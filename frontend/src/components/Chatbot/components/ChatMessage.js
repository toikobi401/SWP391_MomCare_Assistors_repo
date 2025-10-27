import React, { useState, useRef, useEffect } from "react";
import ChatbotIcon from "./ChatbotIcon";
import { FiCopy, FiCheck, FiEdit2, FiSave, FiX } from "react-icons/fi";

const ChatMessage = ({ chat, index, isEditing, onEdit, onSave, onCancel }) => {
  const [copied, setCopied] = useState(false);
  const [editText, setEditText] = useState(chat.text);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chat.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = () => {
    if (editText.trim()) {
      onSave(editText.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div>
      <div
        className={`message ${chat.role === "model" ? "bot" : "user"}-message`}
      >
        {chat.role === "model" && <ChatbotIcon/>}
        
        {isEditing && chat.role === "user" ? (
          <div className="edit-container">
            <textarea
              ref={textareaRef}
              className="edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="edit-actions">
              <button 
                className="edit-action-btn save-btn" 
                onClick={handleSave}
                title="Lưu (Enter)"
              >
                <FiSave />
              </button>
              <button 
                className="edit-action-btn cancel-btn" 
                onClick={onCancel}
                title="Hủy (Esc)"
              >
                <FiX />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="message-content">
              {/* Hiển thị ảnh nếu có */}
              {chat.image && (
                <img 
                  src={chat.image} 
                  alt="User uploaded" 
                  className="message-image"
                />
              )}
              {/* Render HTML formatted text cho bot, plain text cho user */}
              {chat.role === "model" ? (
                <div 
                  className="message-text formatted" 
                  dangerouslySetInnerHTML={{ __html: chat.text }}
                />
              ) : (
                <p className="message-text">{chat.text}</p>
              )}
            </div>
            
            {/* Nút copy cho bot message */}
            {chat.role === "model" && chat.text !== "Đang suy nghĩ..." && (
              <button 
                className="copy-btn" 
                onClick={handleCopy}
                title={copied ? "Đã copy!" : "Copy câu trả lời"}
              >
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            )}
            
            {/* Nút edit cho user message */}
            {chat.role === "user" && !chat.image && (
              <button 
                className="edit-btn" 
                onClick={onEdit}
                title="Chỉnh sửa tin nhắn"
              >
                <FiEdit2 />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
