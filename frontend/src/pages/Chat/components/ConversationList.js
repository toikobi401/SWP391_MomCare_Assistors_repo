import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { deleteConversation } from "../../../services/chatApi";
import { toast } from "react-toastify";

export const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewChat,
  onCreateGroup,
  loading,
  currentUser,
  onDeleteConversation, // Thêm callback để refresh danh sách sau khi xóa
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm để lấy tên hiển thị cho conversation 
  const getConversationDisplayName = (conversation) => {
    // Nếu là chat trực tiếp (2 người), hiển thị tên của người kia
    if (conversation.ParticipantCount === 2 && conversation.OtherUserName) {
      return conversation.OtherUserName;
    }
    
    // Nếu là group chat (>2 người), hiển thị tên do người tạo đặt
    if (conversation.ParticipantCount > 2) {
      // Nếu có tên custom thì dùng tên custom
      if (conversation.Name && conversation.Name.trim() !== '') {
        return conversation.Name;
      }
      // Nếu không có tên custom, hiển thị danh sách tên participants
      else if (conversation.AllParticipantNames) {
        return conversation.AllParticipantNames;
      }
    }
    
    // Fallback: hiển thị tên default hoặc "Cuộc trò chuyện"
    return conversation.Name || "Cuộc trò chuyện";
  };

  // Lọc conversations theo search
  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = getConversationDisplayName(conv);
    
    return (
      displayName?.toLowerCase().includes(searchLower) ||
      conv.Name?.toLowerCase().includes(searchLower) ||
      conv.LastMessage?.toLowerCase().includes(searchLower) ||
      conv.OtherUserName?.toLowerCase().includes(searchLower) ||
      conv.AllParticipantNames?.toLowerCase().includes(searchLower)
    );
  });

  // Hàm để lấy avatar cho conversation
  const getConversationAvatar = (conversation) => {
    if (conversation.ParticipantCount > 2) {
      return (
        <div className="avatar-group">
          <i className="fas fa-users"></i>
        </div>
      );
    } else {
      return (
        <div className="avatar-single">
          {conversation.OtherUserAvatar ? (
            <img 
              src={conversation.OtherUserAvatar} 
              alt={conversation.OtherUserName || "User"} 
              className="rounded-circle"
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
          ) : (
            <i className="fas fa-user"></i>
          )}
        </div>
      );
    }
  };

  // Hàm xử lý xóa conversation
  const handleDeleteConversation = async (conversation, e) => {
    e.stopPropagation(); // Ngăn chặn việc select conversation khi click nút xóa
    
    const displayName = getConversationDisplayName(conversation);
    const confirmMessage = `Bạn có chắc chắn muốn xóa cuộc trò chuyện "${displayName}"?\n\nTất cả tin nhắn và file đính kèm sẽ bị xóa vĩnh viễn và không thể khôi phục.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await deleteConversation(conversation.ConversationID);
        
        if (response.code === 200) {
          // Sử dụng alert thay vì toast nếu có vấn đề
          alert(`Đã xóa cuộc trò chuyện "${displayName}"`);
          
          // Nếu conversation đang được chọn thì clear selection
          if (selectedConversation?.ConversationID === conversation.ConversationID) {
            onSelectConversation(null);
          }
          
          // Gọi callback để refresh danh sách
          if (onDeleteConversation) {
            onDeleteConversation();
          }
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
        alert("Không thể xóa cuộc trò chuyện. Vui lòng thử lại!");
      }
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, "HH:mm", { locale: vi });
      } else if (diffInHours < 168) {
        return format(date, "EEE", { locale: vi });
      } else {
        return format(date, "dd/MM", { locale: vi });
      }
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="conversation-list">
      {/* Header */}
      <div className="conversation-list-header">
        <h5>Đoạn chat</h5>
        <div className="conversation-list-actions">
          <button
            className="btn btn-sm btn-light"
            onClick={onCreateGroup}
            title="Tạo nhóm chat"
          >
            <i className="fas fa-users"></i>
          </button>
          <button
            className="btn btn-sm btn-light"
            onClick={onNewChat}
            title="Chat mới với chuyên gia"
          >
            <i className="fas fa-edit"></i>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="conversation-search">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm đoạn chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="conversation-list-items">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="conversation-empty">
            <i className="fas fa-comments"></i>
            <p>
              {searchTerm
                ? "Không tìm thấy đoạn chat nào"
                : "Chưa có đoạn chat nào"}
            </p>
            <button className="btn btn-sm btn-primary" onClick={onNewChat}>
              Bắt đầu chat mới
            </button>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.ConversationID}
              className={`conversation-item ${
                selectedConversation?.ConversationID ===
                conversation.ConversationID
                  ? "active"
                  : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-avatar">
                {getConversationAvatar(conversation)}
              </div>

              <div className="conversation-content">
                <div className="conversation-header">
                  <h6 className="conversation-name">
                    {getConversationDisplayName(conversation)}
                  </h6>
                  <div className="conversation-header-actions">
                    <span className="conversation-time">
                      {formatLastMessageTime(conversation.LastMessageTime)}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-danger conversation-delete-btn"
                      onClick={(e) => handleDeleteConversation(conversation, e)}
                      title="Xóa cuộc trò chuyện"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <div className="conversation-message">
                  <p>{conversation.LastMessage || "Chưa có tin nhắn"}</p>
                  {conversation.ParticipantCount > 2 && (
                    <span className="conversation-badge">
                      <i className="fas fa-users me-1"></i>
                      {conversation.ParticipantCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
