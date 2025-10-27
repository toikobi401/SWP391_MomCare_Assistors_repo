import React, { useRef, useState } from "react";
import { LuArrowUp, LuImage, LuX } from "react-icons/lu";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();
  const fileInputRef = useRef();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage && !selectedImage) return;
    
    const messageText = userMessage || "Phân tích hình ảnh này";
    inputRef.current.value = "";

    //Update chat history with text and image
    setChatHistory((history) => [
      ...history,
      { 
        role: "user", 
        text: messageText,
        image: imagePreview 
      },
    ]);

    // Clear image after sending
    const imageToSend = selectedImage;
    handleRemoveImage();

    setTimeout(() => {
      setChatHistory((history) => [
        ...history,
        { role: "model", text: "Thinking..." },
      ]);
      generateBotResponse([
        ...chatHistory,
        { 
          role: "user", 
          text: messageText,
          image: imagePreview 
        },
      ], imageToSend);
    }, 600);
  };

  return (
    <div>
      {imagePreview && (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <button 
            type="button"
            className="remove-image-btn" 
            onClick={handleRemoveImage}
            title="Xóa ảnh"
          >
            <LuX />
          </button>
        </div>
      )}
      <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <button 
          type="button"
          className="image-upload-btn"
          onClick={() => fileInputRef.current.click()}
          title="Tải ảnh lên"
        >
          <LuImage />
        </button>
        <input
          type="text"
          ref={inputRef}
          className="message-input"
          placeholder={selectedImage ? "Mô tả hoặc đặt câu hỏi về ảnh..." : "Message..."}
          required={!selectedImage}
        />
        <button type="submit"><LuArrowUp/></button>
      </form>
    </div>
  );
};

export default ChatForm;
