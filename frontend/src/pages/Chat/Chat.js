import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../contexts/SocketContext";
import { ConversationList } from "./components/ConversationList";
import { MessageArea } from "./components/MessageArea";
import { ExpertList } from "./components/ExpertList";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { getUserConversations } from "../../services/chatApi";
import toast from "react-hot-toast";
import "./Chat.css";

export const Chat = () => {
  const { infoUser, isLogin } = useAuth();
  const { socket, connected } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showExpertList, setShowExpertList] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load conversations khi component mount
  useEffect(() => {
    if (isLogin && infoUser?.UserID) {
      loadConversations();
    }
  }, [isLogin, infoUser]);

  // WebSocket event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    // Listen cho conversation updates (tin nhắn mới)
    const handleConversationUpdated = ({ conversationId }) => {
      console.log("📨 Conversation updated:", conversationId);
      loadConversations(); // Refresh conversation list để update last message
    };

    // Listen cho conversation mới được tạo
    const handleNewConversation = () => {
      console.log("🆕 New conversation created");
      loadConversations();
    };

    socket.on("conversation_updated", handleConversationUpdated);
    socket.on("new_conversation", handleNewConversation);

    // Cleanup listeners
    return () => {
      socket.off("conversation_updated", handleConversationUpdated);
      socket.off("new_conversation", handleNewConversation);
    };
  }, [socket, connected]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await getUserConversations(infoUser.UserID);
      if (response.code === 200) {
        setConversations(response.data || []);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Không thể tải danh sách hội thoại");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowExpertList(false);
  };

  const handleNewChat = () => {
    setShowExpertList(true);
    setSelectedConversation(null);
  };

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true);
  };

  const handleConversationCreated = () => {
    loadConversations();
    setShowCreateGroupModal(false);
    setShowExpertList(false);
  };

  if (!isLogin) {
    return (
      <div className="chat-container">
        <div className="chat-login-required">
          <h3>Vui lòng đăng nhập để sử dụng tính năng chat</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-layout">
        {/* Sidebar - Danh sách conversations */}
        <div className="chat-sidebar">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onCreateGroup={handleCreateGroup}
            loading={loading}
            currentUser={infoUser}
          />
        </div>

        {/* Main area - Messages hoặc Expert list */}
        <div className="chat-main">
          {showExpertList ? (
            <ExpertList
              currentUser={infoUser}
              onConversationCreated={handleConversationCreated}
              onBack={() => setShowExpertList(false)}
            />
          ) : selectedConversation ? (
            <MessageArea
              conversation={selectedConversation}
              currentUser={infoUser}
              onConversationUpdate={loadConversations}
            />
          ) : (
            <div className="chat-welcome">
              <div className="chat-welcome-content">
                <i className="fas fa-comments chat-welcome-icon"></i>
                <h3>Chào mừng đến với Chat</h3>
                <p>Chọn một cuộc trò chuyện hoặc bắt đầu chat mới với chuyên gia</p>
                <button className="btn btn-primary mt-3" onClick={handleNewChat}>
                  <i className="fas fa-plus me-2"></i>
                  Tìm chuyên gia
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal tạo nhóm chat */}
      {showCreateGroupModal && (
        <CreateGroupModal
          currentUser={infoUser}
          onClose={() => setShowCreateGroupModal(false)}
          onSuccess={handleConversationCreated}
        />
      )}
    </div>
  );
};
