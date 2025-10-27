import React, { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { LuBot, LuChevronDown, LuX } from "react-icons/lu";
import { GoogleGenAI } from "@google/genai";
import { useAuth } from "../../hooks/useAuth";

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!apiKey) {
  console.warn("REACT_APP_GEMINI_API_KEY chưa được thiết lập. Chatbot sẽ sử dụng thông báo lỗi mặc định.");
}
export const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const chatBodyRef = useRef();
  const { infoUser, isLogin } = useAuth(); // Lấy thông tin user từ cookie

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
      systemPrompt += `\n\nNgười dùng chưa đăng nhập. Hãy trả lời một cách chung chung và gợi ý đăng nhập để có trải nghiệm tốt hơn.`;
    }

    try {
      if (!ai) {
        updateHistory("Chức năng AI đang bị vô hiệu do thiếu khóa cấu hình. Vui lòng liên hệ quản trị viên.");
        return;
      }

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

        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [textPart, imagePart] }],
        });
      } else {
        // Thêm system prompt vào đầu history
        const enhancedHistory = [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...history.map(({ role, text }) => ({ role, parts: [{ text }] }))
        ];

        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: enhancedHistory,
        });
      }

      console.log(response);

      const rawText =
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
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
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h1 className="logo-text">Chatbot</h1>
          </div>
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
    </div>
  );
};
