import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ===================== CONVERSATIONS API =====================

/**
 * Lấy tất cả conversations của user
 */
export const getUserConversations = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/conversations/user/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết một conversation
 */
export const getConversationDetail = async (conversationId) => {
  try {
    const response = await axios.get(`${API_URL}/conversations/${conversationId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation detail:", error);
    throw error;
  }
};

/**
 * Tạo conversation mới
 * @param {Object} data - { name, creatorUserId, participantUserIds: [], modelId }
 */
export const createConversation = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/conversations/create`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

/**
 * Tạo hoặc lấy cuộc hội thoại 1-1 (tương tự Messenger)
 * @param {number} userId1 - ID user thứ nhất
 * @param {number} userId2 - ID user thứ hai
 */
export const createPrivateConversation = async (userId1, userId2) => {
  try {
    const response = await axios.post(`${API_URL}/conversations/create-private`, {
      userId1,
      userId2
    }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating private conversation:", error);
    throw error;
  }
};

/**
 * Thêm participant vào conversation
 */
export const addParticipant = async (conversationId, userId, modelId = null) => {
  try {
    const response = await axios.post(
      `${API_URL}/conversations/${conversationId}/add-participant`,
      { userId, modelId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding participant:", error);
    throw error;
  }
};

/**
 * Xóa participant khỏi conversation
 */
export const removeParticipant = async (conversationId, userId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/conversations/${conversationId}/remove-participant/${userId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing participant:", error);
    throw error;
  }
};

/**
 * Đổi tên conversation
 */
export const renameConversation = async (conversationId, newName) => {
  try {
    const response = await axios.put(
      `${API_URL}/conversations/${conversationId}/rename`,
      { name: newName },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error renaming conversation:", error);
    throw error;
  }
};

/**
 * Xóa conversation
 */
export const deleteConversation = async (conversationId) => {
  try {
    const response = await axios.delete(`${API_URL}/conversations/${conversationId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

// ===================== MESSAGES API =====================

/**
 * Lấy messages trong conversation
 */
export const getMessages = async (conversationId, limit = 100, offset = 0) => {
  try {
    const response = await axios.get(
      `${API_URL}/messages/${conversationId}?limit=${limit}&offset=${offset}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

/**
 * Gửi message từ user
 * @param {Object} data - { conversationId, userId, content, messageType, attachments: [{fileName, fileSize, url}] }
 */
export const sendUserMessage = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/messages/send-user`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Gửi message từ AI model
 */
export const sendModelMessage = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/messages/send-model`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending model message:", error);
    throw error;
  }
};

/**
 * Xóa message
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await axios.delete(`${API_URL}/messages/${messageId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

/**
 * Chỉnh sửa message (Messenger-style)
 * @param {number} messageId - ID tin nhắn cần chỉnh sửa
 * @param {number} userId - ID người dùng
 * @param {string} newContent - Nội dung mới
 */
export const editMessage = async (messageId, userId, newContent) => {
  try {
    const response = await axios.put(
      `${API_URL}/messages/${messageId}/edit`,
      { userId, newContent },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing message:", error);
    throw error;
  }
};

/**
 * Thu hồi message (Messenger-style)
 * @param {number} messageId - ID tin nhắn cần thu hồi
 * @param {number} userId - ID người dùng
 */
export const recallMessage = async (messageId, userId) => {
  try {
    const response = await axios.put(
      `${API_URL}/messages/${messageId}/recall`,
      { userId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error recalling message:", error);
    throw error;
  }
};

/**
 * Tìm kiếm messages
 */
export const searchMessages = async (conversationId, keyword) => {
  try {
    const response = await axios.get(
      `${API_URL}/messages/${conversationId}/search?keyword=${encodeURIComponent(keyword)}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching messages:", error);
    throw error;
  }
};

// ===================== MODELS API =====================

/**
 * Lấy tất cả AI models
 */
export const getAllModels = async () => {
  try {
    const response = await axios.get(`${API_URL}/models/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching models:", error);
    throw error;
  }
};

// ===================== USERS API =====================

/**
 * Lấy tất cả users (để tìm Experts)
 */
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Lấy users theo role (ví dụ: "Expert")
 * @param {string} roleName - Tên role cần lọc
 */
export const getUsersByRole = async (roleName) => {
  try {
    const response = await axios.get(`${API_URL}/users/role/${roleName}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};

// ===================== UPLOAD API =====================

/**
 * Upload file cho chat
 * @param {File} file - File cần upload
 */
export const uploadChatFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_URL}/chat-upload/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
