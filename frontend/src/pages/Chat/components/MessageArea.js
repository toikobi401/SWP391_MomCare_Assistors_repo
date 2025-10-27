import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSocket } from "../../../contexts/SocketContext";
import {
  getMessages,
  sendUserMessage,
  uploadChatFile,
  getConversationDetail,
  editMessage,
  recallMessage,
} from "../../../services/chatApi";
import toast from "react-hot-toast";

export const MessageArea = ({ conversation, currentUser, onConversationUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [conversationDetail, setConversationDetail] = useState(null);
  const messageBodyRef = useRef(null); // Ref cho message-area-body để kiểm soát scroll
  const fileInputRef = useRef(null);
  const { socket, connected } = useSocket();
  const shouldAutoScrollRef = useRef(true); // Ref để kiểm soát auto-scroll (mặc định scroll)
  const isInitialLoadRef = useRef(false); // Ref để kiểm tra lần load đầu tiên
  
  // State cho edit mode
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // Hàm để lấy tên hiển thị cho conversation (cùng logic với ConversationList)
  const getConversationDisplayName = () => {
    // Merge data từ conversation prop và conversationDetail 
    const mergedConv = { ...conversation, ...conversationDetail };
    
    // Nếu là chat trực tiếp (2 người), hiển thị tên của người kia
    if (mergedConv?.ParticipantCount === 2 && mergedConv?.OtherUserName) {
      return mergedConv.OtherUserName;
    }
    
    // Nếu là group chat (>2 người), hiển thị tên do người tạo đặt
    if (mergedConv?.ParticipantCount > 2) {
      // Nếu có tên custom thì dùng tên custom
      if (mergedConv?.Name && mergedConv?.Name.trim() !== '') {
        return mergedConv.Name;
      }
      // Nếu không có tên custom, hiển thị danh sách tên participants
      else if (mergedConv?.AllParticipantNames) {
        return mergedConv.AllParticipantNames;
      }
    }
    
    // Fallback: hiển thị tên default hoặc "Cuộc trò chuyện"
    return mergedConv?.Name || "Cuộc trò chuyện";
  };

  useEffect(() => {
    if (conversation) {
      loadMessages();
      loadConversationDetail();
      isInitialLoadRef.current = true; // Đánh dấu đang load conversation mới

      // Join conversation room để nhận tin nhắn real-time
      if (socket && connected) {
        socket.emit("join_conversation", conversation.ConversationID);
      }
    }

    // Cleanup: Leave conversation room khi đổi conversation hoặc unmount
    return () => {
      if (socket && conversation) {
        socket.emit("leave_conversation", conversation.ConversationID);
      }
      isInitialLoadRef.current = false;
    };
  }, [conversation, socket, connected]);

  // WebSocket: Listen for new messages
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = ({ conversationId, message }) => {
      // Chỉ add message nếu đang xem conversation này
      if (conversationId === conversation?.ConversationID) {
        console.log("📩 New message received:", message);
        console.log("📎 Message attachments:", message.Attachments || message.attachments);
        setMessages((prevMessages) => {
          // Kiểm tra xem message đã tồn tại chưa (tránh duplicate)
          const exists = prevMessages.some(m => m.MessageID === message.MessageID);
          if (exists) return prevMessages;
          
          // Nếu là tin nhắn của chính mình → cho phép auto-scroll
          if (message.UserID === currentUser.UserID) {
            shouldAutoScrollRef.current = true;
          } else {
            // Nếu là tin nhắn từ người khác → KHÔNG scroll (giữ nguyên vị trí)
            shouldAutoScrollRef.current = false;
          }
          
          return [...prevMessages, message];
        });
      }
    };

    const handleMessageEdited = ({ conversationId, message }) => {
      if (conversationId === conversation?.ConversationID) {
        console.log("✏️ Message edited:", message);
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.MessageID === message.MessageID ? { ...m, ...message } : m
          )
        );
        toast.success("Tin nhắn đã được chỉnh sửa");
      }
    };

    const handleMessageRecalled = ({ conversationId, message }) => {
      if (conversationId === conversation?.ConversationID) {
        console.log("🔙 Message recalled:", message);
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.MessageID === message.MessageID ? { ...m, ...message } : m
          )
        );
        toast("Tin nhắn đã được thu hồi", { icon: "ℹ️" });
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_recalled", handleMessageRecalled);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_recalled", handleMessageRecalled);
    };
  }, [socket, connected, conversation, currentUser]);

  useEffect(() => {
    // Kiểm soát scroll bằng useEffect - chỉ scroll khi shouldAutoScrollRef = true
    if (shouldAutoScrollRef.current && messageBodyRef.current) {
      messageBodyRef.current.scrollTo({
        top: messageBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
      shouldAutoScrollRef.current = false; // Reset lại sau khi scroll
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await getMessages(conversation.ConversationID);
      if (response.code === 200) {
        setMessages(response.data || []);
        // Chỉ scroll khi load conversation mới lần đầu
        if (isInitialLoadRef.current) {
          shouldAutoScrollRef.current = true;
          isInitialLoadRef.current = false; // Chỉ scroll 1 lần duy nhất
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Không thể tải tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const loadConversationDetail = async () => {
    try {
      const response = await getConversationDetail(conversation.ConversationID);
      if (response.code === 200) {
        setConversationDetail(response.data);
      }
    } catch (error) {
      console.error("Error loading conversation detail:", error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File quá lớn! Vui lòng chọn file nhỏ hơn 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() && !selectedFile) {
      return;
    }

    try {
      setSending(true);
      let attachments = [];

      // Upload file nếu có
      if (selectedFile) {
        toast.loading("Đang tải file lên...", { id: "upload" });
        const uploadResponse = await uploadChatFile(selectedFile);
        if (uploadResponse.code === 200) {
          attachments.push({
            fileName: uploadResponse.data.fileName,
            fileSize: uploadResponse.data.fileSize,
            url: uploadResponse.data.url,
          });
          toast.success("Tải file thành công! Đang gửi tin nhắn...", { id: "upload" });
        }
      }

      // Gửi message
      const messageData = {
        conversationId: conversation.ConversationID,
        userId: currentUser.UserID,
        content: messageText.trim() || selectedFile?.name || "",
        messageType: selectedFile ? "file" : "text",
        attachments: attachments,
      };

      const response = await sendUserMessage(messageData);
      if (response.code === 200) {
        // KHÔNG set shouldAutoScrollRef = true ở đây
        // KHÔNG thêm message vào state ở đây
        // WebSocket sẽ tự động emit event "new_message" và cập nhật cho TẤT CẢ người dùng (bao gồm cả người gửi)
        // Điều này tránh duplicate message ở phía người gửi
        // Và KHÔNG tự động scroll để giữ nguyên vị trí đang đọc
        
        // Dismiss upload toast và hiển thị thành công
        if (selectedFile) {
          toast.success("Tin nhắn đã được gửi thành công!", { id: "upload" });
        }
        
        setMessageText("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onConversationUpdate();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      return format(new Date(timestamp), "HH:mm - dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return "";
    }
  };

  const isOwnMessage = (message) => {
    return message.UserID === currentUser.UserID;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return "fas fa-image";
    } else if (["pdf"].includes(ext)) {
      return "fas fa-file-pdf";
    } else if (["doc", "docx"].includes(ext)) {
      return "fas fa-file-word";
    } else if (["xls", "xlsx"].includes(ext)) {
      return "fas fa-file-excel";
    } else {
      return "fas fa-file";
    }
  };

  // Kiểm tra xem file có phải hình ảnh không
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
  };

  // Handler cho chỉnh sửa message
  const handleStartEdit = (message) => {
    setEditingMessageId(message.MessageID);
    setEditingText(message.Content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (messageId) => {
    if (!editingText.trim()) {
      toast.error("Nội dung không được để trống");
      return;
    }

    try {
      await editMessage(messageId, currentUser.UserID, editingText.trim());
      setEditingMessageId(null);
      setEditingText("");
      // WebSocket sẽ tự động update UI
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Không thể chỉnh sửa tin nhắn");
    }
  };

  // Handler cho thu hồi message
  const handleRecallMessage = async (messageId) => {
    if (!window.confirm("Bạn có chắc muốn thu hồi tin nhắn này?")) {
      return;
    }

    try {
      await recallMessage(messageId, currentUser.UserID);
      // WebSocket sẽ tự động update UI
    } catch (error) {
      console.error("Error recalling message:", error);
      toast.error("Không thể thu hồi tin nhắn");
    }
  };

  return (
    <div className="message-area">
      {/* Header */}
      <div className="message-area-header">
        <div className="d-flex align-items-center">
          <div className="conversation-avatar me-3">
            {(conversationDetail?.ParticipantCount || conversation?.ParticipantCount || 0) > 2 ? (
              <i className="fas fa-users"></i>
            ) : (
              <i className="fas fa-user"></i>
            )}
          </div>
          <div>
            <h6 className="mb-0">{getConversationDisplayName()}</h6>
            <small className="text-muted">
              {conversationDetail?.ParticipantCount || conversation?.ParticipantCount || 0} thành viên
            </small>
          </div>
        </div>
        <div className="message-area-actions">
          <button className="btn btn-sm btn-light" title="Thông tin">
            <i className="fas fa-info-circle"></i>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="message-area-body" ref={messageBodyRef}>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="message-empty">
            <i className="fas fa-comments"></i>
            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.MessageID}
                className={`message-item ${
                  isOwnMessage(message) ? "own-message" : "other-message"
                }`}
                onMouseEnter={() => setHoveredMessageId(message.MessageID)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className="message-content">
                  {/* Message actions dropdown - chỉ hiển thị cho tin nhắn của mình */}
                  {isOwnMessage(message) && 
                   message.MessageType !== "recalled" && 
                   hoveredMessageId === message.MessageID && (
                    <div className="message-actions">
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-light dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fas fa-ellipsis-h"></i>
                        </button>
                        <ul className="dropdown-menu">
                          {message.MessageType === "text" && (
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => handleStartEdit(message)}
                              >
                                <i className="fas fa-edit me-2"></i>
                                Chỉnh sửa
                              </button>
                            </li>
                          )}
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleRecallMessage(message.MessageID)}
                            >
                              <i className="fas fa-undo me-2"></i>
                              Thu hồi
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="message-bubble">
                    {editingMessageId === message.MessageID ? (
                      // Edit mode
                      <div className="message-edit-mode">
                        <input
                          type="text"
                          className="form-control form-control-sm mb-2"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(message.MessageID);
                            }
                          }}
                          autoFocus
                        />
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleSaveEdit(message.MessageID)}
                          >
                            <i className="fas fa-check me-1"></i>
                            Lưu
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={handleCancelEdit}
                          >
                            <i className="fas fa-times me-1"></i>
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : message.MessageType === "recalled" ? (
                      // Recalled message
                      <p className="text-muted fst-italic">
                        <i className="fas fa-ban me-1"></i>
                        {message.Content}
                      </p>
                    ) : message.MessageType === "text" ? (
                      <p>{message.Content}</p>
                    ) : message.MessageType === "file" ? (
                      <div className="message-file">
                        {(() => {
                          // Kiểm tra xem có file ảnh không (handle cả Attachments và attachments)
                          const attachments = message.Attachments || message.attachments || [];
                          const fileName = attachments[0]?.OriginalFileName || message.Content || "";
                          const fileUrl = attachments[0]?.StorageURL || "";
                          const isImage = isImageFile(fileName);
                          
                          // Debug log
                          console.log(`🖼️ Rendering file message ${message.MessageID}:`, {
                            attachments,
                            fileName,
                            fileUrl,
                            isImage
                          });

                          if (isImage && fileUrl) {
                            // Hiển thị hình ảnh
                            return (
                              <div className="message-image-container">
                                <img
                                  src={fileUrl}
                                  alt={fileName}
                                  className="message-image"
                                  onClick={() => window.open(fileUrl, '_blank')}
                                />
                                <p className="mb-0 mt-2">
                                  <small>{fileName}</small>
                                </p>
                              </div>
                            );
                          } else {
                            // Hiển thị file khác (không phải hình ảnh)
                            return (
                              <>
                                <i className={getFileIcon(fileName)}></i>
                                <div className="ms-2">
                                  <p className="mb-0">{fileName}</p>
                                  {fileUrl && (
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-decoration-none"
                                    >
                                      <small>Xem file</small>
                                    </a>
                                  )}
                                </div>
                              </>
                            );
                          }
                        })()}
                      </div>
                    ) : (
                      <p className="text-muted fst-italic">{message.Content}</p>
                    )}
                  </div>
                  <small className="message-time">
                    {formatMessageTime(message.SentAt)}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="message-area-footer">
        <form onSubmit={handleSendMessage} className="message-input-form">
          {selectedFile && (
            <div className="selected-file-preview">
              <i className={getFileIcon(selectedFile.name)}></i>
              <span>{selectedFile.name}</span>
              <button
                type="button"
                className="btn-close"
                onClick={handleRemoveFile}
              ></button>
            </div>
          )}

          <div className="message-input-wrapper">
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
            >
              <i className="fas fa-paperclip"></i>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            <input
              type="text"
              className="form-control message-input"
              placeholder="Nhập tin nhắn..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={sending}
            />

            <button
              type="submit"
              className="btn btn-primary btn-send"
              disabled={sending || (!messageText.trim() && !selectedFile)}
              title={sending && selectedFile ? "Đang gửi file..." : sending ? "Đang gửi tin nhắn..." : "Gửi tin nhắn"}
            >
              {sending ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                ></span>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
