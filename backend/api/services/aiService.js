const { GoogleGenerativeAI } = require("@google/generative-ai");
const ModelModel = require("../models/modelModel");

/**
 * 🤖 AI Service - Kết nối với các AI models từ database
 */
class AIService {
  constructor() {
    this.modelInstances = new Map(); // Cache các instance AI models
  }

  /**
   * 🧩 Lấy instance AI model từ cache hoặc tạo mới
   * @param {number} modelId - ID của model trong database
   * @returns {object|null} - Instance của AI model
   */
  async getModelInstance(modelId) {
    try {
      // Kiểm tra cache trước
      if (this.modelInstances.has(modelId)) {
        return this.modelInstances.get(modelId);
      }

      // Lấy thông tin model từ database
      const modelInfo = await ModelModel.getModelById(modelId);
      if (!modelInfo) {
        console.error(`Model with ID ${modelId} not found in database`);
        return null;
      }

      console.log(`🔄 Initializing AI model: ${modelInfo.Name} (ID: ${modelId})`);

      let modelInstance = null;

      // Xác định loại AI model và khởi tạo
      if (modelInfo.Name.toLowerCase().includes('gemini')) {
        // Khởi tạo Google Gemini
        if (!modelInfo.Api_Key) {
          console.error(`Missing API key for Gemini model ${modelInfo.Name}`);
          return null;
        }

        try {
          const genAI = new GoogleGenerativeAI(modelInfo.Api_Key);
          
          // Xác định model name phù hợp
          let modelName = "gemini-2.5-flash"; // default
          if (modelInfo.Name.toLowerCase().includes('pro')) {
            modelName = "gemini-2.5-pro";
          } else if (modelInfo.Name.toLowerCase().includes('flash')) {
            modelName = "gemini-2.5-flash";
          }

          modelInstance = {
            type: 'gemini',
            name: modelInfo.Name,
            client: genAI,
            modelName: modelName,
            apiKey: modelInfo.Api_Key,
            description: modelInfo.description
          };

          console.log(`✅ Gemini model initialized: ${modelName}`);
        } catch (error) {
          console.error(`Error initializing Gemini model:`, error);
          return null;
        }
      } 
      // Có thể mở rộng cho ChatGPT, Claude, v.v.
      else if (modelInfo.Name.toLowerCase().includes('chatgpt') || modelInfo.Name.toLowerCase().includes('gpt')) {
        // TODO: Implement ChatGPT integration
        console.warn(`ChatGPT integration not implemented yet for model: ${modelInfo.Name}`);
        return null;
      }
      else if (modelInfo.Name.toLowerCase().includes('claude')) {
        // TODO: Implement Claude integration  
        console.warn(`Claude integration not implemented yet for model: ${modelInfo.Name}`);
        return null;
      }
      else {
        console.warn(`Unknown AI model type: ${modelInfo.Name}`);
        return null;
      }

      // Lưu vào cache
      if (modelInstance) {
        this.modelInstances.set(modelId, modelInstance);
      }

      return modelInstance;
    } catch (error) {
      console.error(`Error getting model instance for ID ${modelId}:`, error);
      return null;
    }
  }

  /**
   * 🧩 Generate response từ AI model
   * @param {number} modelId - ID của model trong database
   * @param {string} prompt - Prompt gửi cho AI
   * @param {array} history - Lịch sử chat (optional)
   * @param {object} imageData - Dữ liệu ảnh nếu có (optional)
   * @returns {object} - Response từ AI
   */
  async generateResponse(modelId, prompt, history = [], imageData = null) {
    try {
      const modelInstance = await this.getModelInstance(modelId);
      if (!modelInstance) {
        return {
          success: false,
          error: `AI model with ID ${modelId} not available`
        };
      }

      console.log(`🚀 Generating response with ${modelInstance.name}...`);

      let response = null;

      if (modelInstance.type === 'gemini') {
        response = await this.generateGeminiResponse(modelInstance, prompt, history, imageData);
      }
      // Thêm các loại AI khác ở đây
      else {
        return {
          success: false,
          error: `AI model type ${modelInstance.type} not supported`
        };
      }

      console.log(`✅ Response generated successfully with ${modelInstance.name}`);
      return response;
    } catch (error) {
      console.error(`Error generating response with model ID ${modelId}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * 🧩 Generate response từ Gemini
   * @param {object} modelInstance - Instance của Gemini model
   * @param {string} prompt - Prompt gửi cho AI
   * @param {array} history - Lịch sử chat
   * @param {object} imageData - Dữ liệu ảnh nếu có
   * @returns {object} - Response từ Gemini
   */
  async generateGeminiResponse(modelInstance, prompt, history = [], imageData = null) {
    try {
      const { client, modelName } = modelInstance;
      let contents = [];

      // Nếu có ảnh, sử dụng Gemini Vision
      if (imageData) {
        const imagePart = {
          inlineData: {
            data: imageData.base64Data,
            mimeType: imageData.mimeType
          }
        };

        const textPart = { text: prompt };
        contents = [{ role: "user", parts: [textPart, imagePart] }];
      } else {
        // Xây dựng conversation history
        if (history && history.length > 0) {
          contents = history.map(item => ({
            role: item.role || "user",
            parts: [{ text: item.text || item.content }]
          }));
        }
        
        // Thêm prompt hiện tại
        contents.push({
          role: "user",
          parts: [{ text: prompt }]
        });
      }

      // Gửi request đến Gemini
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: contents
      });

      const responseText = result.response?.text();
      
      if (!responseText) {
        return {
          success: false,
          error: 'No response text from Gemini'
        };
      }

      return {
        success: true,
        data: {
          text: responseText,
          model: modelInstance.name,
          modelId: modelInstance.modelId,
          tokens: result.response?.usageMetadata || null
        }
      };
    } catch (error) {
      console.error(`Error in Gemini response generation:`, error);
      return {
        success: false,
        error: error.message || 'Gemini API error'
      };
    }
  }

  /**
   * 🧩 Clear cache cho một model cụ thể
   * @param {number} modelId - ID của model cần clear cache
   */
  clearModelCache(modelId) {
    if (this.modelInstances.has(modelId)) {
      this.modelInstances.delete(modelId);
      console.log(`🗑️ Cleared cache for model ID: ${modelId}`);
    }
  }

  /**
   * 🧩 Clear toàn bộ cache
   */
  clearAllCache() {
    this.modelInstances.clear();
    console.log(`🗑️ Cleared all AI model cache`);
  }

  /**
   * 🧩 Lấy danh sách models đã cache
   */
  getCachedModels() {
    return Array.from(this.modelInstances.keys());
  }

  /**
   * 🧩 Kiểm tra xem model có available không
   * @param {number} modelId - ID của model
   * @returns {boolean} - True nếu model available
   */
  async isModelAvailable(modelId) {
    const modelInstance = await this.getModelInstance(modelId);
    return modelInstance !== null;
  }
}

// Export singleton instance
const aiService = new AIService();
module.exports = aiService;