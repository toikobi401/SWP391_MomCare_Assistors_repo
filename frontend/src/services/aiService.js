const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * 🤖 AI Service - Frontend integration với database AI models
 */

/**
 * Lấy danh sách tất cả AI models từ database
 */
export const getAllAIModels = async () => {
  try {
    const response = await fetch(`${API_URL}/models`);
    const data = await response.json();
    
    if (data.code === 200) {
      return {
        success: true,
        models: data.data
      };
    } else {
      return {
        success: false,
        error: data.message
      };
    }
  } catch (error) {
    console.error("Error fetching AI models:", error);
    return {
      success: false,
      error: "Không thể kết nối với server"
    };
  }
};

/**
 * Lấy thông tin chi tiết một AI model
 */
export const getAIModelById = async (modelId) => {
  try {
    const response = await fetch(`${API_URL}/models/${modelId}`);
    const data = await response.json();
    
    if (data.code === 200) {
      return {
        success: true,
        model: data.data
      };
    } else {
      return {
        success: false,
        error: data.message
      };
    }
  } catch (error) {
    console.error("Error fetching AI model:", error);
    return {
      success: false,
      error: "Không thể kết nối với server"
    };
  }
};

/**
 * Gửi message với AI auto-response sử dụng model từ database
 * @param {Object} messageData - Dữ liệu message
 * @param {number} messageData.conversationId - ID cuộc trò chuyện
 * @param {number} messageData.userId - ID người gửi
 * @param {string} messageData.content - Nội dung tin nhắn
 * @param {number} messageData.modelId - ID AI model trong database
 * @param {string} messageData.messageType - Loại tin nhắn (text, image, file)
 * @param {Array} messageData.attachments - Danh sách file đính kèm
 * @param {string} messageData.systemPrompt - System prompt tùy chỉnh
 */
export const sendMessageWithAIResponse = async (messageData) => {
  try {
    const response = await fetch(`${API_URL}/messages/send-with-ai-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });

    const data = await response.json();
    
    if (data.code === 200) {
      return {
        success: true,
        userMessage: data.data.userMessage,
        aiMessage: data.data.aiMessage,
        aiModel: data.data.aiModel,
        usage: data.data.usage
      };
    } else if (data.code === 206) {
      // Partial success - user message sent but AI failed
      return {
        success: true,
        partial: true,
        userMessage: data.data.userMessage,
        aiError: data.data.aiError
      };
    } else {
      return {
        success: false,
        error: data.message
      };
    }
  } catch (error) {
    console.error("Error sending message with AI response:", error);
    return {
      success: false,
      error: "Không thể kết nối với server"
    };
  }
};

/**
 * Tạo AI model mới trong database
 * @param {Object} modelData - Dữ liệu model
 * @param {string} modelData.name - Tên model
 * @param {string} modelData.apiKey - API key
 * @param {string} modelData.description - Mô tả
 */
export const createAIModel = async (modelData) => {
  try {
    const response = await fetch(`${API_URL}/models/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(modelData),
    });

    const data = await response.json();
    
    if (data.code === 200) {
      return {
        success: true,
        modelId: data.data.modelId
      };
    } else {
      return {
        success: false,
        error: data.message
      };
    }
  } catch (error) {
    console.error("Error creating AI model:", error);
    return {
      success: false,
      error: "Không thể kết nối với server"
    };
  }
};

/**
 * Cập nhật AI model trong database
 * @param {number} modelId - ID model cần cập nhật
 * @param {Object} modelData - Dữ liệu cập nhật
 */
export const updateAIModel = async (modelId, modelData) => {
  try {
    const response = await fetch(`${API_URL}/models/${modelId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(modelData),
    });

    const data = await response.json();
    
    if (data.code === 200) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        error: data.message
      };
    }
  } catch (error) {
    console.error("Error updating AI model:", error);
    return {
      success: false,
      error: "Không thể kết nối với server"
    };
  }
};

/**
 * Xóa AI model khỏi database
 * @param {number} modelId - ID model cần xóa
 */
export const deleteAIModel = async (modelId) => {
  try {
    const response = await fetch(`${API_URL}/models/${modelId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    
    if (data.code === 200) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        error: data.message
      };
    }
  } catch (error) {
    console.error("Error deleting AI model:", error);
    return {
      success: false,
      error: "Không thể kết nối với server"
    };
  }
};

/**
 * Kiểm tra model có available không
 * @param {number} modelId - ID model cần kiểm tra
 */
export const checkModelAvailability = async (modelId) => {
  try {
    const result = await getAIModelById(modelId);
    return result.success;
  } catch (error) {
    console.error("Error checking model availability:", error);
    return false;
  }
};

/**
 * Lấy model phù hợp cho chatbot float (dựa vào description)
 */
export const getChatbotModel = async () => {
  try {
    const result = await getAllAIModels();
    if (!result.success) {
      return null;
    }

    // Tìm model có description chứa "chatbot" hoặc "float"
    const chatbotModel = result.models.find(model => 
      model.description?.toLowerCase().includes('chatbot') ||
      model.description?.toLowerCase().includes('float')
    );

    return chatbotModel || result.models[0]; // Fallback về model đầu tiên
  } catch (error) {
    console.error("Error getting chatbot model:", error);
    return null;
  }
};

/**
 * Lấy model phù hợp cho direct chat (dựa vào description)
 */
export const getDirectChatModel = async () => {
  try {
    const result = await getAllAIModels();
    if (!result.success) {
      return null;
    }

    // Tìm model có description chứa "direct" hoặc "chat"
    const directChatModel = result.models.find(model => 
      model.description?.toLowerCase().includes('direct') ||
      (model.description?.toLowerCase().includes('chat') && 
       !model.description?.toLowerCase().includes('chatbot'))
    );

    return directChatModel || result.models[0]; // Fallback về model đầu tiên
  } catch (error) {
    console.error("Error getting direct chat model:", error);
    return null;
  }
};