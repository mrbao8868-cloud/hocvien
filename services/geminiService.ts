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

// New interface for image prompt input
export interface ImageTextInput {
  idea: string;
  style:string[];
  aspectRatio: string;
  characters: SceneCharacter[]; // dialogue will be ignored
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
    return (response.text || '').trim();
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

export async function generateVeoPromptFromFreestyle(
  userInput: string,
  apiKey: string
): Promise<string> {
  const systemInstruction = `Bạn là một chuyên gia sáng tạo prompt cho các mô hình AI tạo video như Google Veo. Nhiệm vụ của bạn là chuyển đổi một ý tưởng, kịch bản, hoặc lời thoại thô do người dùng cung cấp thành một prompt video duy nhất, chi tiết, đậm chất điện ảnh bằng tiếng Anh.

**YÊU CẦU QUAN TRỌNG:**
1.  **Phân tích & Mở rộng:** Đọc kỹ văn bản của người dùng để nắm bắt bối cảnh, nhân vật, hành động và cảm xúc cốt lõi. Sau đó, hãy làm phong phú nó.
2.  **Ngôn ngữ:** Toàn bộ prompt mô tả cảnh, hành động, và máy quay phải bằng **tiếng Anh**. Tuy nhiên, nếu người dùng cung cấp **lời thoại bằng tiếng Việt**, bạn PHẢI giữ nguyên lời thoại đó và lồng ghép nó một cách tự nhiên vào trong prompt.
3.  **Chất lượng điện ảnh:**
    - **Mô tả chi tiết:** Thêm các chi tiết tinh tế về môi trường (cơn gió nhẹ, tiếng động xung quanh, vật thể trong cảnh).
    - **Ánh sáng & không khí:** Mô tả ánh sáng (ánh nắng ấm áp, ánh đèn neon) và không khí chung của cảnh (hồi hộp, lãng mạn, vui tươi).
    - **Kỹ thuật quay phim:** Đề xuất các chuyển động và góc máy cụ thể (góc máy thấp, lia máy chậm - dolly-in, cảnh quay từ trên cao - aerial shot).
    - **Cảm xúc & hành động nhân vật:** Mô tả biểu cảm, giọng điệu, và những cử chỉ nhỏ của nhân vật dựa trên nội dung gốc.
4.  **Định dạng:** Chỉ trả về một đoạn văn duy nhất, mạch lạc. KHÔNG sử dụng markdown.

**VÍ DỤ:**
- **Input của người dùng:** "Cô giáo nói với học sinh: 'Chúng ta nên tổ chức một buổi học nhẹ nhàng'. Em học sinh vui vẻ trả lời: 'Ý hay quá cô!'"
- **Output (Prompt chuẩn):**
A warm afternoon sunlight streams through the window of a teacher's lounge. The camera slowly dolly-ins toward the teachers. The older teacher looks thoughtful, her tone tinged with quiet determination: “Chúng ta nên tổ chức một buổi học nhẹ nhàng, kiểu như chơi mà học, giúp các em thư giãn trước kỳ thi.” The younger teacher’s face lights up with a hopeful smile, her voice filled with excitement: “Ý hay quá cô! Em sẽ chuẩn bị một tiết học ngoài trời, có trò chơi và kể chuyện.” The two exchange a warm, supportive glance, creating a heartfelt tone.`;
  
  const contents = `Vui lòng chuyển đổi ý tưởng/kịch bản sau thành một prompt video hoàn chỉnh: "${userInput}"`;

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


export async function generateImagePrompt(input: ImageTextInput, apiKey: string): Promise<string> {
    const systemInstruction = `Bạn là một chuyên gia sáng tạo prompt cho các mô hình AI tạo ảnh (như Imagen, Midjourney, Stable Diffusion). Nhiệm vụ của bạn là chuyển đổi ý tưởng và mô tả nhân vật từ người dùng thành một prompt chi tiết, nghệ thuật bằng tiếng Anh.

**YÊU CẦU QUAN TRỌNG:**
1.  **Ngôn ngữ:** Toàn bộ prompt phải bằng **tiếng Anh**.
2.  **Định dạng:** Prompt phải là một chuỗi các từ khóa hoặc cụm từ mô tả, ngăn cách nhau bằng dấu phẩy. Cuối cùng, thêm tham số aspect ratio.
3.  **Đồng nhất nhân vật:**
    -   Sử dụng **triệt để** mô tả chi tiết của từng nhân vật được cung cấp (ngoại hình, quần áo, tính cách) để tạo ra một hình ảnh nhất quán. Đây là ưu tiên hàng đầu.
    -   Nếu có nhiều nhân vật, hãy mô tả sự tương tác giữa họ.
4.  **Chi tiết hóa ý tưởng:**
    -   Mở rộng ý tưởng chính của người dùng thành một cảnh cụ thể.
    -   Mô tả hành động, cảm xúc, và bối cảnh một cách sống động.
5.  **Yếu tố nghệ thuật:**
    -   **Ánh sáng:** Thêm các từ khóa về ánh sáng (ví dụ: "cinematic lighting", "soft natural light", "dramatic Rembrandt lighting").
    -   **Góc máy:** Mô tả góc nhìn (ví dụ: "low angle shot", "wide angle", "portrait", "close-up shot").
    -   **Chất liệu & Chi tiết:** Thêm các chi tiết về chất liệu (ví dụ: "detailed silk dress", "rough wooden texture").
    -   **Chất lượng:** Luôn bao gồm các từ khóa nâng cao chất lượng như "ultra detailed", "photorealistic", "8k", "sharp focus".
6.  **Xử lý phong cách:**
    -   Nếu phong cách là 'Hiện thực', hãy tập trung vào việc tạo ra một hình ảnh chân thực như ảnh chụp, với ánh sáng tự nhiên, chi tiết đời thường, và không khí tự nhiên. Sử dụng các từ khóa như 'photorealistic, candid shot, natural lighting, daily life scene'.
    -   Nếu phong cách là 'Hoạt hình', hãy diễn giải nó thành phong cách anime 2D chất lượng cao, tinh tế, tương tự như phong cách của Studio Ghibli. Sử dụng các từ khóa như 'classic 2D anime style, Studio Ghibli inspired, detailed hand-drawn background, warm and nostalgic lighting, soft color palette, masterpiece'.

**CÁC VÍ DỤ:**

**1. VÍ DỤ VỀ PHONG CÁCH "HOẠT HÌNH":**
-   **Input:**
    -   Ý tưởng: "cô giáo và học sinh trong thư viện"
    -   Nhân vật 1: "Cô giáo trẻ (tóc đen dài, mặc áo dài trắng, dịu dàng)"
    -   Nhân vật 2: "Cậu học trò nhỏ (mặc đồng phục, vẻ mặt tò mò)"
    -   Phong cách: "Hoạt hình"
    -   Tỷ lệ: "16:9"
-   **Output:**
    \`masterpiece, Studio Ghibli inspired 2D anime style, a young female teacher with long black hair, wearing a traditional white Ao Dai, gently smiling as she helps a curious little boy in a school uniform with a book, in a cozy library with detailed hand-drawn bookshelves, warm afternoon sunlight streaming through the windows, soft nostalgic lighting, detailed character design, sharp focus, ultra detailed --ar 16:9\`

**2. VÍ DỤ VỀ PHONG CÁCH "HIỆN THỰC":**
-   **Input:**
    -   Ý tưởng: "một người đàn ông lớn tuổi đang ngồi đọc báo trên ghế đá công viên"
    -   Nhân vật: "Người đàn ông (râu tóc bạc phơ, mặc áo sơ mi cũ, đeo kính)"
    -   Phong cách: "Hiện thực"
    -   Tỷ lệ: "4:3"
-   **Output:**
    \`photorealistic, candid shot of an elderly Vietnamese man with silver hair and a thoughtful expression, wearing glasses and a simple button-up shirt, sitting on a park bench, deeply engrossed in reading a newspaper, soft natural morning light filtering through the trees, daily life scene, shallow depth of field, sharp focus on the man's face, ultra detailed, 8k --ar 4:3\`
---`;

    const charactersString = input.characters.length > 0
        ? 'Characters: ' + input.characters.map(char => `${char.name} (${char.description})`).join(', ')
        : 'No specific characters.';

    const contents = `Please generate an image prompt based on the following details:
- Main Idea: "${input.idea}"
- Visual Style: "${input.style.join(', ')}"
- Characters: "${charactersString}"
- Aspect Ratio: "${input.aspectRatio}"
`;

    const prompt = await callGemini(contents, systemInstruction, apiKey);
    // Ensure the aspect ratio is correctly appended if the model forgets
    const aspectRatioParam = `--ar ${input.aspectRatio}`;
    if (!prompt.includes('--ar')) {
      return `${prompt.replace(/,$/, '')} ${aspectRatioParam}`;
    }
    return prompt;
}

export async function analyzeCharacterFromImage(
  image: { mimeType: string; data: string },
  apiKey: string
): Promise<string> {
  const systemInstruction = `Bạn là một chuyên gia phân tích hình ảnh với mục tiêu tạo ra mô tả nhân vật đồng nhất để sử dụng trong các mô hình AI khác. Nhiệm vụ của bạn là phân tích **KHUÔN MẶT** của nhân vật chính trong ảnh một cách **CỰC KỲ CHI TIẾT** bằng tiếng Việt.

**YÊU CẦU TỐI QUAN TRỌNG:**
1.  **ƯU TIÊN TUYỆT ĐỐI VÀO KHUÔN MẶT:** Hơn 80% mô tả phải tập trung vào các đặc điểm trên mặt để đảm bảo AI có thể tái tạo lại nhân vật một cách nhất quán. Bỏ qua bối cảnh.
2.  **MÔ TẢ SIÊU CHI TIẾT:**
    *   **Khuôn mặt:** Hình dáng tổng thể (trái xoan, tròn, vuông, dài, góc cạnh).
    *   **Mắt:** Hình dáng (bồ câu, một mí, hai mí, xếch), màu sắc (đen, nâu sẫm), khoảng cách giữa hai mắt. Mô tả cả lông mày (dáng cong, ngang, rậm, thưa) và lông mi.
    *   **Mũi:** Dáng mũi (thẳng, cao, tẹt, khoằm), kích thước cánh mũi.
    *   **Miệng:** Hình dáng môi (mỏng, dày, trái tim), độ cong của khóe miệng.
    *   **Da:** Tông màu da (trắng hồng, ngăm đen, vàng), có đặc điểm gì đặc biệt không (tàn nhang, nốt ruồi - nếu có).
    *   **Tóc:** Mô tả **CHỈ** phần tóc có thể nhìn thấy liên quan đến khuôn mặt (kiểu mái, tóc mai, có che trán không).
3.  **Mô tả trang phục và cơ thể (Ngắn gọn):** Sau khi đã mô tả kỹ khuôn mặt, chỉ cần thêm một câu ngắn gọn về trang phục và dáng người tổng thể.
4.  **Khách quan:** Chỉ mô tả những gì thấy được. Không suy diễn tính cách.
5.  **Định dạng:** Trả về một đoạn văn duy nhất, mạch lạc. Không dùng markdown.

**VÍ DỤ:**
- **Input:** (Ảnh chân dung một cô gái)
- **Output:** "Một cô gái trẻ với khuôn mặt trái xoan thanh tú. Cô có đôi mắt hai mí to tròn, màu nâu sẫm, hàng lông mi dài và cong vút, lông mày dáng vòng cung tự nhiên. Sống mũi cao và thẳng, đầu mũi nhỏ. Đôi môi đầy đặn hình trái tim, khóe miệng hơi nhếch lên tạo cảm giác thân thiện. Làn da trắng hồng mịn màng. Mái tóc đen dài, rẽ ngôi giữa, vài sợi tóc mai mềm mại xõa xuống hai bên má. Cô mặc một chiếc áo sơ mi trắng đơn giản."`;

  const imagePart = {
    inlineData: {
      mimeType: image.mimeType,
      data: image.data,
    },
  };
  const textPart = {
    text: "Phân tích và mô tả nhân vật trong hình ảnh này theo yêu cầu."
  };

  const contents = { parts: [imagePart, textPart] };

  return callGemini(contents, systemInstruction, apiKey);
}