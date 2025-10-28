import React, { useRef, useState } from "react";
import { LuArrowUp, LuImage, LuX } from "react-icons/lu";
import { uploadChatFile } from "../../../services/chatApi";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse, saveUserMessage, isLogin, chatbotConversation }) => {
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage && !selectedImage) return;
    
    const messageText = userMessage || "Phân tích hình ảnh này";
    
    // Lưu ảnh và preview trước khi xóa
    const imageToSend = selectedImage;
    const imagePreviewToUse = imagePreview;
    
    // Clear input và image ngay lập tức sau khi lấy giá trị
    inputRef.current.value = "";
    handleRemoveImage();

    //Update chat history with text and image
    setChatHistory((history) => [
      ...history,
      { 
        role: "user", 
        text: messageText,
        image: imagePreviewToUse 
      },
    ]);

    // Lưu tin nhắn user vào database CHỈ KHI đã đăng nhập
    if (isLogin && chatbotConversation && saveUserMessage) {
      console.log("💾 Saving user message to database (logged user)");
      
      let attachments = [];
      
      // Upload ảnh lên Cloudinary nếu có
      if (imageToSend) {
        try {
          console.log("📤 Uploading image to Cloudinary...");
          const uploadResponse = await uploadChatFile(imageToSend);
          if (uploadResponse.code === 200) {
            attachments.push({
              fileName: uploadResponse.data.fileName,
              fileSize: uploadResponse.data.fileSize,
              url: uploadResponse.data.url,
            });
            console.log("✅ Image uploaded successfully:", uploadResponse.data.url);
          }
        } catch (error) {
          console.error("❌ Error uploading image:", error);
        }
      }
      
      await saveUserMessage(messageText, imageToSend ? "image" : "text", attachments);
    } else if (!isLogin) {
      console.log("👤 Guest user - message not saved to database");
    }

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
          image: imagePreviewToUse 
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
