import { GoogleGenAI, Type } from "@google/genai";
import { Scene, ImageElement, Transform, TextOverlay } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const sceneSchema = {
  'type': Type.OBJECT,
  properties: {
    'textSection': { 'type': Type.STRING },
    'background': { 'type': Type.STRING },
    'textOverlay': {
      'type': Type.OBJECT,
      nullable: true,
      properties: {
        'text': { 'type': Type.STRING },
        'color': { 'type': Type.STRING },
        'style': { 'type': Type.STRING },
        'transform': {
            'type': Type.OBJECT,
            nullable: true,
            properties: {
                'x': { 'type': Type.NUMBER, description: "Horizontal position in pixels, default 0." },
                'y': { 'type': Type.NUMBER, description: "Vertical position in pixels, default 0." },
                'scale': { 'type': Type.NUMBER, description: "Scale factor, default 1." },
                'rotation': { 'type': Type.NUMBER, description: "Rotation in degrees, default 0." },
            }
        }
      },
      required: ['text', 'color', 'style'],
    },
    'images': {
      'type': Type.ARRAY,
      items: {
        'type': Type.OBJECT,
        properties: {
          'type': { 'type': Type.STRING, 'enum': ['AI_GENERATED', 'SEARCH'] },
          'query': { 'type': Type.STRING },
          'initialPosition': { 'type': Type.STRING, 'enum': ['center', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] },
          'copyFromPrevious': { 'type': Type.BOOLEAN, nullable: true },
        },
        required: ['type', 'query', 'initialPosition'],
      },
    },
  },
  required: ['textSection', 'background', 'images'],
};

const getPrompt = (transcriptionText: string, userInstructions: string) => `
You are an expert video editor. Your task is to take a script and a set of user-provided editing instructions to generate a JSON array of scene objects.

The script is:
"${transcriptionText}"

The user's instructions are:
"${userInstructions}"

Strictly follow the user's instructions to break down the script and define the visual elements for each scene. Generate a JSON array of scene objects based *only* on the user's instructions and the provided schema.

Each scene object in the JSON array must follow these rules:
1.  **textSection**: A short, meaningful phrase from the script relevant to the scene, as specified in the user's instructions.
2.  **background**: A simple CSS background color string (e.g., 'white', '#111827').
3.  **textOverlay**: An optional object for text displayed on screen. If used, it must have:
    *   \`text\`: The text to display.
    *   \`color\`: A simple color name (e.g., 'red', 'yellow').
    *   \`style\`: A short description of the style (e.g., 'with black border', 'bold white').
    *   \`transform\`: Optional. An object for text position, scale, and rotation. Defaults to center if omitted.
4.  **images**: An array of image objects (0 to 3 images). Each image object must have:
    *   \`type\`: Either "AI_GENERATED" or "SEARCH".
    *   \`query\`:
        *   If type is "AI_GENERATED", this must be a detailed, descriptive prompt suitable for an AI image generator.
        *   If type is "SEARCH", this must be a concise and effective search term for Google Images.
    *   \`initialPosition\`: A suggested starting position from ["center", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"].
    *   \`copyFromPrevious\`: An optional boolean. Set this to \`true\` **only if** the user instructions explicitly state that an image's position, scale, or rotation should be the same as it was in the immediately preceding scene (e.g., "Image 1 as in the previous section", "keep Image 2 the same"). If the instruction does not mention this, omit this property.

The entire output must be a valid JSON object matching the provided schema. Do not add any extra commentary.
`;


const getDefaultTransform = (): Transform => ({
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  flipX: false,
  flipY: false,
});

export const generateVisualPlan = async (transcriptionText: string, userInstructions: string): Promise<Scene[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: getPrompt(transcriptionText, userInstructions),
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: sceneSchema,
        },
      },
    });

    const jsonText = response.text;
    const rawScenes = JSON.parse(jsonText);

    if (!Array.isArray(rawScenes)) {
      throw new Error("AI response is not an array.");
    }
    
    return rawScenes.map((rawScene: any, sceneIndex: number) => ({
      ...rawScene,
      id: `scene-${sceneIndex}-${Date.now()}`,
      textOverlay: rawScene.textOverlay 
        ? ({
          ...rawScene.textOverlay,
          transform: { ...getDefaultTransform(), ...(rawScene.textOverlay.transform || {}) },
        } as TextOverlay) 
        : undefined,
      images: rawScene.images ? rawScene.images.map((img: any, imgIndex: number): ImageElement => ({
        ...img,
        id: `img-${sceneIndex}-${imgIndex}-${Date.now()}`,
        url: '',
        transform: getDefaultTransform(),
      })) : [],
      startTime: 0, // will be calculated later
      endTime: 0, // will be calculated later
    }));
    
  } catch (error) {
    console.error("Error generating visual plan from Gemini:", error);
    if (error instanceof SyntaxError) {
        console.error("Gemini returned invalid JSON");
    }
    throw new Error("Failed to generate visual plan from AI. Please check your API key and instructions, then try again.");
  }
};