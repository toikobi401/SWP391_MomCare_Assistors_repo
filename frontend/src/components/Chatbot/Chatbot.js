import React, { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { LuBot, LuChevronDown, LuX } from "react-icons/lu";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from "../../hooks/useAuth";
import { getChatbotModel, sendMessageWithAIResponse, getAllAIModels } from "../../services/aiService";
import { createOrGetChatbotConversation } from "../../services/chatApi";

// Giữ nguyên fallback cho trường hợp cần thiết
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

if (!apiKey) {
  console.warn("REACT_APP_GEMINI_API_KEY chưa được thiết lập. Chatbot sẽ sử dụng thông báo lỗi mặc định.");
}
export const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [aiModel, setAiModel] = useState(null); // State để lưu AI model từ database
  const [availableModels, setAvailableModels] = useState([]); // Danh sách tất cả models
  const [showModelSelector, setShowModelSelector] = useState(false); // Hiển thị modal chọn model
  const [useDatabase, setUseDatabase] = useState(true); // Flag để chuyển đổi giữa database và env
  const [chatbotConversation, setChatbotConversation] = useState(null); // Conversation cho chatbot
  const chatBodyRef = useRef();
  const { infoUser, isLogin } = useAuth(); // Lấy thông tin user từ cookie

  // Load AI model từ database chỉ khi user đã đăng nhập
  useEffect(() => {
    const loadAIModel = async () => {
      // Load tất cả models để hiển thị trong selector (chỉ khi đã đăng nhập)
      if (isLogin && infoUser?.UserID) {
        try {
          const result = await getAllAIModels();
          if (result.success) {
            setAvailableModels(result.models);
          } else {
            console.error("❌ Error loading all models:", result.error);
          }
        } catch (error) {
          console.error("❌ Error loading all models:", error);
        }
      }

      // Chỉ load AI model từ database khi user đã đăng nhập
      if (!isLogin || !infoUser?.UserID) {
        console.log("👤 Guest user - using fallback .env AI model");
        setUseDatabase(false);
        setAiModel(null);
        setChatbotConversation(null);
        setAvailableModels([]);
        return;
      }

      try {
        const model = await getChatbotModel();
        if (model) {
          setAiModel(model);
          console.log("✅ Loaded AI model from database:", model.Name);
          
          // Tạo hoặc lấy chatbot conversation cho user đã đăng nhập
          await createChatbotConversation(model.ModelID);
        } else {
          console.warn("⚠️ No AI model found in database, falling back to .env");
          setUseDatabase(false);
        }
      } catch (error) {
        console.error("❌ Error loading AI model:", error);
        setUseDatabase(false);
      }
    };

    loadAIModel();
  }, [isLogin, infoUser]);

  // Tạo hoặc lấy chatbot conversation (chỉ cho user đã đăng nhập)
  const createChatbotConversation = async (modelId) => {
    // Chỉ tạo conversation khi user đã đăng nhập
    if (!isLogin || !infoUser?.UserID) {
      console.log("👤 Guest user - skipping conversation creation");
      return;
    }

    try {
      const userId = infoUser.UserID;
      const result = await createOrGetChatbotConversation(userId, modelId);
      
      if (result.code === 200) {
        setChatbotConversation(result.data);
        console.log(`✅ Chatbot conversation ready: ${result.data.ConversationID}`);
      } else {
        console.error("❌ Failed to create chatbot conversation:", result.message);
      }
    } catch (error) {
      console.error("❌ Error creating chatbot conversation:", error);
    }
  };

  // Chuyển đổi AI model
  const switchModel = async (selectedModel) => {
    if (!isLogin || !infoUser?.UserID) {
      console.log("👤 Guest user cannot switch models");
      return;
    }

    try {
      console.log(`🔄 Switching to model: ${selectedModel.Name}`);
      
      // Cập nhật model hiện tại
      setAiModel(selectedModel);
      
      // Tạo conversation mới cho model mới (hoặc lấy conversation cũ nếu có)
      await createChatbotConversation(selectedModel.ModelID);
      
      // Đóng modal
      setShowModelSelector(false);
      
      // Thông báo cho user
      setChatHistory(prev => [...prev, {
        role: "system",
        text: `🤖 Đã chuyển sang sử dụng model: <strong>${selectedModel.Name}</strong><br/><small>${selectedModel.description || 'Không có mô tả'}</small>`
      }]);
      
    } catch (error) {
      console.error("❌ Error switching model:", error);
    }
  };

  function formatAIResponse(text) {
    if (!text) return "";

    // Convert markdown to HTML
    let formatted = text
      // Code blocks với ```
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      
      // Inline code với `
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Bold với **
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      
      // Italic với *
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      
      // Unordered list
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      
      // Numbered list
      .replace(/^\d+\.\s(.+)$/gm, '<li class="numbered">$1</li>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap lists
    formatted = formatted.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
    formatted = formatted.replace(/(<li class="numbered">.*?<\/li>)+/gs, '<ol>$&</ol>');
    
    // Wrap trong paragraph nếu chưa có tags
    if (!formatted.startsWith('<')) {
      formatted = '<p>' + formatted + '</p>';
    }

    return formatted;
  }

  const generateBotResponse = async (history, imageFile = null) => {
    const updateHistory = (text) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text },
      ]);
    };

    // Tạo system prompt với thông tin user để cá nhân hóa
    let systemPrompt = "Bạn là trợ lý AI thông minh hỗ trợ về chăm sóc sức khỏe mẹ và bé của hệ thống MomCare.";
    
    if (isLogin && infoUser) {
      systemPrompt += `\n\nThông tin người dùng đang chat với bạn:`;
      if (infoUser.FullName) {
        systemPrompt += `\n- Tên: ${infoUser.FullName}`;
      } else if (infoUser.Username) {
        systemPrompt += `\n- Username: ${infoUser.Username}`;
      }
      if (infoUser.Email) {
        systemPrompt += `\n- Email: ${infoUser.Email}`;
      }
      if (infoUser.RoleName) {
        systemPrompt += `\n- Vai trò: ${infoUser.RoleName}`;
      }
      
      systemPrompt += `\n\nHãy xưng hô phù hợp và cá nhân hóa câu trả lời dựa trên thông tin này. Nếu có tên, hãy gọi người dùng bằng tên thân thiện.`;
    } else {
      systemPrompt += `\n\nNgười dùng chưa đăng nhập. Hãy trả lời một cách chung chung và gợi ý đăng nhập để có trải nghiệm tốt hơt.`;
    }

    try {
      // Chỉ sử dụng database AI khi user đã đăng nhập
      if (useDatabase && isLogin && infoUser?.UserID && aiModel && chatbotConversation && !imageFile) {
        console.log("🤖 Using database AI model:", aiModel.Name);
        
        const lastMessage = history[history.length - 1];
        
        // Gọi API backend với AI model từ database và conversation thực sự
        const result = await sendMessageWithAIResponse({
          content: lastMessage.text,
          modelId: aiModel.ModelID,
          systemPrompt: systemPrompt,
          conversationId: chatbotConversation.ConversationID, // Sử dụng conversation thực sự
          userId: infoUser.UserID, // UserID có thật
          messageType: "text"
        });

        if (result.success && result.aiMessage) {
          const responseText = result.aiMessage.Content;
          const formattedResponse = formatAIResponse(responseText);
          updateHistory(formattedResponse);
          return;
        } else if (result.success && result.partial) {
          // AI failed but user message sent
          updateHistory(`Đã ghi nhận tin nhắn nhưng AI hiện tại không thể phản hồi: ${result.aiError}`);
          return;
        } else {
          console.warn("Database AI failed, falling back to .env model");
        }
      }

      // Fallback: Sử dụng .env API key (cho guest user hoặc khi database AI fail)
      if (!ai) {
        updateHistory("Chức năng AI đang bị vô hiệu do thiếu khóa cấu hình. Vui lòng liên hệ quản trị viên.");
        return;
      }

      console.log(isLogin ? "🔄 Falling back to .env AI model" : "👤 Guest user using .env AI model");

      let response;

      // Nếu có ảnh, sử dụng Gemini Vision
      if (imageFile) {
        const base64Image = await fileToBase64(imageFile);
        
        const imagePart = {
          inlineData: {
            data: base64Image.split(',')[1], // Loại bỏ phần "data:image/...;base64,"
            mimeType: imageFile.type
          }
        };

        const lastMessage = history[history.length - 1];
        const textPart = { text: systemPrompt + "\n\n" + lastMessage.text };

        response = await ai.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent([textPart, imagePart]);
      } else {
        // Thêm system prompt vào đầu history và normalize roles cho Google AI
        // Lọc bỏ system messages vì Google AI không hỗ trợ role "system"
        const filteredHistory = history.filter(msg => msg.role !== "system");
        
        const enhancedHistory = [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...filteredHistory.map(({ role, text }) => ({ 
            role: role === "user" ? "user" : "model", // Đảm bảo role chỉ là "user" hoặc "model"
            parts: [{ text }] 
          }))
        ];

        response = await ai.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent({
          contents: enhancedHistory,
        });
      }

      console.log(response);

      const rawText =
        response?.response?.text() ||
        "Không có phản hồi từ AI!";

      const apiResponseText = formatAIResponse(rawText);

      updateHistory(apiResponseText);
    } catch (error) {
      console.error("Something wrong happened", error);
      updateHistory("Hiện tại hệ thống đang có vấn đề, xin hãy quay lại sau!");
    }
  };

  // Helper function để convert file sang base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleEditMessage = (index, newText) => {
    const updatedHistory = [...chatHistory];
    updatedHistory[index].text = newText;
    
    // Xóa tất cả các tin nhắn sau tin nhắn được chỉnh sửa
    const newHistory = updatedHistory.slice(0, index + 1);
    setChatHistory(newHistory);
    setEditingIndex(null);
    
    // Tạo lại phản hồi từ bot
    setTimeout(() => {
      setChatHistory((history) => [
        ...history,
        { role: "model", text: "Thinking..." },
      ]);
      generateBotResponse(newHistory);
    }, 600);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    <div className={`container ${showChat ? "show-chatbot" : ""}`}>
      <button
        onClick={() => {
          setShowChat((prev) => !prev);
        }}
        id="chatbot-toggler"
      >
        <span>
          <LuBot />
        </span>
        <span>
          <LuX />
        </span>
      </button>
      <div className="chat-popup">
        {/* Chat header */}
        <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="header-info">
            <ChatbotIcon />
            <div>
              <h1 className="logo-text">Chatbot</h1>
              {isLogin && aiModel && useDatabase && (
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Powered by {aiModel.Name}
                  {chatbotConversation && ` • Conv: ${chatbotConversation.ConversationID}`}
                </small>
              )}
              {isLogin && !useDatabase && (
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Powered by Gemini (.env) • Logged in
                </small>
              )}
              {!isLogin && (
                <small style={{ color: '#e67e22', fontSize: '12px' }}>
                  Guest mode • Data not saved
                </small>
              )}
              {isLogin && !chatbotConversation && useDatabase && (
                <small style={{ color: '#e74c3c', fontSize: '12px' }}>
                  Connecting...
                </small>
              )}
            </div>
          </div>
          
          {/* Model Selector Button - chỉ hiển thị khi user đã đăng nhập và có ít nhất 2 models */}
          {isLogin && availableModels.length > 1 && (
            <button
              onClick={() => setShowModelSelector(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              title="Chuyển đổi AI Model"
            >
              AI
              <LuChevronDown size={14} />
            </button>
          )}
        </div>

        {/* Chat body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              {isLogin && infoUser?.FullName 
                ? `Xin chào ${infoUser.FullName}! 👋` 
                : isLogin && infoUser?.Username
                ? `Xin chào ${infoUser.Username}! 👋`
                : "Xin chào! 👋"
              }
              <br />
              Tôi là trợ lý AI của MomCare. Tôi có thể giúp gì cho bạn hôm nay?
            </p>
          </div>

          {/* Render chat history dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage 
              key={index} 
              chat={chat} 
              index={index}
              isEditing={editingIndex === index}
              onEdit={() => setEditingIndex(index)}
              onSave={(newText) => handleEditMessage(index, newText)}
              onCancel={handleCancelEdit}
            />
          ))}
        </div>

        {/* Chat footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>

      {/* Model Selector Modal */}
      {showModelSelector && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowModelSelector(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '400px',
              width: '90%',
              maxHeight: '70vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Chọn AI Model</h3>
            
            <div style={{ marginBottom: '15px' }}>
              {availableModels.map((model) => (
                <div
                  key={model.ModelID}
                  onClick={() => switchModel(model)}
                  style={{
                    padding: '12px',
                    border: aiModel?.ModelID === model.ModelID ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: aiModel?.ModelID === model.ModelID ? '#f0f9ff' : 'white',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (aiModel?.ModelID !== model.ModelID) {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (aiModel?.ModelID !== model.ModelID) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{model.Name}</span>
                    {aiModel?.ModelID === model.ModelID && (
                      <span style={{ 
                        color: '#2563eb', 
                        fontSize: '11px', 
                        backgroundColor: '#dbeafe',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        ✓ Đang sử dụng
                      </span>
                    )}
                  </div>
                  {model.description && (
                    <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                      {model.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowModelSelector(false)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
