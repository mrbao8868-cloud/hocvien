import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

// Initialize or reuse a cached Gemini AI client instance.
function initializeGemini(apiKey: string): GoogleGenAI {
  if (ai && currentApiKey === apiKey) {
    return ai;
  }
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API key.");
  }
  ai = new GoogleGenAI({ apiKey });
  currentApiKey = apiKey;
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

// Helper function to handle API call and error
async function callGemini(contents: any, systemInstruction: string, apiKey: string): Promise<string> {
  try {
    const ai = initializeGemini(apiKey);
    const response = await ai.models.generateContent({
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


export async function generateVeoPromptFromText(input: VeoTextInput, apiKey: string): Promise<string> {
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

  return callGemini(contents, systemInstruction, apiKey);
}

export async function generateVeoPromptFromImage(
  idea: string,
  image: { mimeType: string; data: string },
  apiKey: string
): Promise<string> {
  const systemInstruction = `Bạn là một chuyên gia sáng tạo prompt cho các mô hình AI tạo video như Google Veo. Nhiệm vụ của bạn là phân tích một hình ảnh và một ý tưởng tùy chọn từ người dùng để tạo ra một prompt video chi tiết, sống động.

**YÊU CẦU QUAN TRỌNG:**
1.  **Ngôn ngữ:** Toàn bộ prompt mô tả cảnh, hành động, và máy quay phải bằng **tiếng Anh**. Tuy nhiên, nếu ý tưởng bổ sung của người dùng có chứa **lời thoại** (thường trong dấu ngoặc kép), bạn PHẢI giữ nguyên lời thoại đó bằng **tiếng Việt** và lồng ghép nó một cách tự nhiên vào trong prompt.
2.  **Phân tích hình ảnh:** Xác định chủ thể chính, bối cảnh, phong cách nghệ thuật, ánh sáng và bố cục của hình ảnh.
3.  **Kết hợp ý tưởng:** Tích hợp ý tưởng bổ sung một cách sáng tạo vào prompt. Ví dụ: nếu hình ảnh là một khu rừng và ý tưởng là "thêm một con rồng", hãy mô tả con rồng trong khu rừng đó. Nếu không có ý tưởng, hãy tạo một hành động hoặc câu chuyện dựa trên hình ảnh.
4.  **Xây dựng Prompt:** Tạo một prompt hoàn chỉnh, kết hợp các yếu tố như:
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

  return callGemini(contents, systemInstruction, apiKey);
}