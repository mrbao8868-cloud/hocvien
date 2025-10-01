import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

/**
 * Initializes or re-initializes the Gemini AI client with a new API key.
 * This must be called before any other service function.
 * @param apiKey The Google Gemini API key.
 */
export function initializeGemini(apiKey: string) {
  if (apiKey && apiKey.trim()) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    ai = null; // Invalidate the client if the key is empty
  }
}

/**
 * Gets the initialized AI instance, throwing an error if it's not available.
 * @returns The initialized GoogleGenAI instance.
 */
function getAiInstance(): GoogleGenAI {
  if (!ai) {
    throw new Error("API Key is not configured. Please set your API key in the application.");
  }
  return ai;
}

// Interfaces for character data structure
interface ProjectCharacter {
    id: number;
    name: string;
    description: string;
}

interface SceneCharacter extends ProjectCharacter {
    dialogue: string;
}

interface BaseTextInput {
  mainIdea: string;
  setting: string;
  characters: SceneCharacter[];
}

interface VeoTextInput extends BaseTextInput {
    style: string[];
}

interface ImageTextInput extends BaseTextInput {
    style: '3D Hoạt hình' | 'Hiện thực';
}


// Helper function to handle API call and error
async function callGemini(contents: any, systemInstruction: string): Promise<string> {
  const gemini = getAiInstance();
  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Rethrow to be caught by the calling component
    throw error;
  }
}

const getCharactersString = (characters: SceneCharacter[]): string => {
    return characters.length > 0
        ? characters.map(char => `${char.name} (${char.description || 'No description'})`).join(', ')
        : 'Not specified';
};

const getCharactersAndDialogueString = (characters: SceneCharacter[]): string => {
    return characters.length > 0
        ? characters.map(char => {
            let characterString = `${char.name} (${char.description || 'No description'})`;
            if (char.dialogue && char.dialogue.trim()) {
                characterString += ` says: "${char.dialogue.trim()}"`;
            }
            return characterString;
        }).join('\n')
        : 'Not specified';
};


export async function generateVeoPromptFromText(input: VeoTextInput): Promise<string> {
  const systemInstruction = `Bạn là một chuyên gia sáng tạo prompt cho các mô hình AI tạo video như Google Veo. Nhiệm vụ của bạn là chuyển đổi thông tin do người dùng cung cấp thành một prompt video duy nhất, chi tiết, đậm chất điện ảnh bằng tiếng Anh.

**YÊU CẦU QUAN TRỌNG:**
1.  **Ngôn ngữ:** Toàn bộ prompt mô tả cảnh, hành động, và máy quay phải bằng **tiếng Anh**. Tuy nhiên, nếu người dùng cung cấp **lời thoại**, bạn PHẢI giữ nguyên lời thoại đó bằng **tiếng Việt** và lồng ghép nó một cách tự nhiên vào trong prompt.
2.  **Chất lượng điện ảnh:** Đừng chỉ liệt kê thông tin. Hãy dệt chúng thành một kịch bản cảnh quay sống động.
    - **Mô tả chi tiết:** Thêm các chi tiết tinh tế về môi trường (cơn gió nhẹ làm rèm cửa bay, lá cây lay động, tiếng đồng hồ tích tắc, tiếng cười từ xa).
    - **Ánh sáng & không khí:** Mô tả ánh sáng (ánh nắng ấm áp buổi chiều) và không khí chung của cảnh (hoài niệm, chân thành).
    - **Kỹ thuật quay phim:** Đề xuất các chuyển động và góc máy cụ thể (góc máy thấp, lia máy chậm - dolly-in, cảnh quay từ trên cao).
    - **Cảm xúc & hành động nhân vật:** Mô tả biểu cảm, giọng điệu, và những cử chỉ nhỏ của nhân vật (ánh mắt trầm ngâm, nụ cười đầy hy vọng, cái nhìn ấm áp).
3.  **Định dạng:** Chỉ trả về một đoạn văn duy nhất, mạch lạc. KHÔNG sử dụng markdown.

**VÍ DỤ VỀ PROMPT CHUẨN:**
Dựa trên ý tưởng "hai giáo viên nói chuyện trong phòng nghỉ", prompt đầu ra nên có dạng như sau:
---
The same teacher’s lounge, now viewed from a slightly lower angle, capturing more of the warm afternoon sunlight streaming through the window. The camera slowly dolly-ins toward the teachers as their conversation continues. A soft breeze causes the curtains to flutter gently, and the leaves of the potted plant sway slightly, adding a sense of peaceful movement.

The older teacher looks thoughtful, her tone tinged with quiet determination: “Chúng ta nên tổ chức một buổi học nhẹ nhàng, kiểu như chơi mà học, giúp các em thư giãn trước kỳ thi.”
The younger teacher’s face lights up with a hopeful smile. She steps closer, voice filled with excitement: “Ý hay quá cô! Em sẽ chuẩn bị một tiết học ngoài trời, có trò chơi và kể chuyện.”

The two exchange a warm, supportive glance. In the background, a wall clock ticks softly, and faint laughter from children outside echoes distantly through the slightly open window, enriching the nostalgic, heartfelt tone of the moment.
---`;
  
  const charactersAndDialogueString = getCharactersAndDialogueString(input.characters);

  const contents = `Please generate a Veo prompt based on the following details:
- Main Idea: "${input.mainIdea}"
- Setting: "${input.setting || 'An interesting and fitting location'}"
- Visual Style: "${input.style.join(', ') || 'cinematic, photorealistic, 8K'}"
- Characters and Dialogue: "${charactersAndDialogueString}"
`;

  return callGemini(contents, systemInstruction);
}


export async function generateImageFromText(input: ImageTextInput): Promise<{ prompt: string; images: string[] }> {
    const gemini = getAiInstance();

    // Step 1: Generate a high-quality English prompt using the text model
    const systemInstructionForPromptGeneration = `You are an expert prompt creator for AI image generation models like Imagen. Your task is to convert user-provided information in Vietnamese into a single, detailed, and descriptive image prompt in English.

**REQUIREMENTS:**
1.  **Language:** The entire output prompt must be in **English**.
2.  **Detail:** Don't just list the information. Weave it into a cohesive scene description. Add rich details about the subject, environment, lighting, atmosphere, and character expressions to create a vivid picture.
3.  **Format:** Return only a single, coherent paragraph. DO NOT use markdown.

**EXAMPLE:**
Based on "cô gái ngồi bên cửa sổ, trời mưa", the output prompt should be something like this:
---
A melancholic young Vietnamese woman with long dark hair sits by a large window, raindrops streaming down the glass. The room is dimly lit, with a soft, cool light filtering through the rainy window, casting gentle reflections on her thoughtful face. She gazes out at the gray, wet world, a cup of steaming tea held in her hands. The atmosphere is quiet, contemplative, and slightly nostalgic. Photorealistic, cinematic lighting, 8K.
---`;

    const charactersString = getCharactersString(input.characters);
    const styleDescription = input.style === '3D Hoạt hình'
        ? '3D animation, Pixar style, charming, detailed, high resolution'
        : 'photorealistic, cinematic, 8K, high detail, professional photography';

    const contentsForPromptGeneration = `Please generate a rich, detailed, and single-paragraph English image prompt based on the following details:
- Main Idea: "${input.mainIdea}"
- Setting: "${input.setting || 'An interesting and fitting location'}"
- Characters: "${charactersString}"
- Desired Visual Style: "${styleDescription}"
`;
    // Use the helper to call the text model and get an English prompt
    const englishPrompt = await callGemini(contentsForPromptGeneration, systemInstructionForPromptGeneration);

    // Step 2: Use the generated English prompt to generate the image
    try {
        const response = await gemini.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: englishPrompt, // Use the translated and enriched English prompt
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        const images = response.generatedImages.map(img => img.image.imageBytes);

        // Return the English prompt that was actually used, for user transparency
        return { prompt: englishPrompt, images };

    } catch (error) {
        console.error("Imagen API call failed:", error);
        throw error;
    }
}


export async function generateVeoPromptFromImage(
  idea: string,
  image: { mimeType: string; data: string }
): Promise<string> {
  const systemInstruction = `Bạn là một chuyên gia sáng tạo prompt cho các mô hình AI tạo video như Google Veo. Nhiệm vụ của bạn là phân tích một hình ảnh và một ý tưởng tùy chọn từ người dùng để tạo ra một prompt video chi tiết, sống động. Prompt cuối cùng phải là một đoạn văn duy nhất, mạch lạc, bằng tiếng Anh.

1.  **Phân tích hình ảnh:** Xác định chủ thể chính, bối cảnh, phong cách nghệ thuật, ánh sáng và bố cục của hình ảnh.
2.  **Kết hợp ý tưởng:** Nếu người dùng cung cấp ý tưởng, hãy tích hợp nó một cách sáng tạo vào prompt. Ví dụ: nếu hình ảnh là một khu rừng và ý tưởng là "thêm một con rồng", hãy mô tả con rồng trong khu rừng đó. Nếu không có ý tưởng, hãy tạo một hành động hoặc câu chuyện dựa trên hình ảnh.
3.  **Xây dựng Prompt:** Tạo một prompt hoàn chỉnh, kết hợp các yếu tố như:
    - **Chủ thể & Hành động:** Mô tả chi tiết chủ thể từ ảnh và hành động được đề xuất.
    - **Môi trường:** Dựa trên bối cảnh của ảnh.
    - **Phong cách hình ảnh:** Dựa trên phong cách của ảnh, nhưng có thể nhấn mạnh thêm (ví dụ: "cinematic, photorealistic, 8K").
    - **Máy quay & Cảnh quay:** Đề xuất các chuyển động máy quay động (ví dụ: "a slow panning shot revealing...", "an epic aerial drone shot").
    - **Ánh sáng:** Mô tả ánh sáng trong ảnh.

KHÔNG sử dụng markdown. Chỉ trả về một đoạn văn tiếng Anh duy nhất.`;

  const imagePart = {
    inlineData: {
      mimeType: image.mimeType,
      data: image.data,
    },
  };
  const textPart = {
    text: `Ý tưởng bổ sung của người dùng: "${idea || 'Hãy tạo một câu chuyện hoặc hành động thú vị dựa trên hình ảnh này.'}"`
  };

  const contents = { parts: [imagePart, textPart] };

  return callGemini(contents, systemInstruction);
}