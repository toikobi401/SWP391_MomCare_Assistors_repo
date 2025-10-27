import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewChat,
  onCreateGroup,
  loading,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc conversations theo search
  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.Name?.toLowerCase().includes(searchLower) ||
      conv.LastMessage?.toLowerCase().includes(searchLower)
    );
  });

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
                {conversation.ParticipantCount > 2 ? (
                  <div className="avatar-group">
                    <i className="fas fa-users"></i>
                  </div>
                ) : (
                  <div className="avatar-single">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>

              <div className="conversation-content">
                <div className="conversation-header">
                  <h6 className="conversation-name">
                    {conversation.Name || "Cuộc trò chuyện"}
                  </h6>
                  <span className="conversation-time">
                    {formatLastMessageTime(conversation.LastMessageAt)}
                  </span>
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
