import React, { useState, useEffect } from "react";
import { getUsersByRole, createPrivateConversation } from "../../../services/chatApi";
import toast from "react-hot-toast";

export const ExpertList = ({ currentUser, onConversationCreated, onBack }) => {
  const [experts, setExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      setLoading(true);
      // Sử dụng API mới để lấy users theo role "Expert"
      const response = await getUsersByRole("Expert");
      if (response.code === 200) {
        // Lọc bỏ current user khỏi danh sách
        const expertUsers = response.data.filter(
          (user) => user.UserID !== currentUser.UserID
        );
        setExperts(expertUsers);
      }
    } catch (error) {
      console.error("Error loading experts:", error);
      toast.error("Không thể tải danh sách chuyên gia");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (expert) => {
    try {
      // Tạo hoặc lấy cuộc hội thoại 1-1 với expert (tương tự Messenger)
      const response = await createPrivateConversation(currentUser.UserID, expert.UserID);
      
      if (response.code === 200) {
        const conversation = response.data;
        
        // Kiểm tra xem đây là conversation mới hay đã tồn tại
        const isNewConversation = new Date(conversation.CreateAt).getTime() > (Date.now() - 5000); // Trong vòng 5 giây vừa rồi
        
        if (isNewConversation) {
          toast.success(`Đã tạo cuộc trò chuyện mới với ${expert.Fullname}`);
        } else {
          toast.info(`Đã mở cuộc trò chuyện với ${expert.Fullname}`);
        }
        
        onConversationCreated();
      }
    } catch (error) {
      console.error("Error creating/getting private conversation:", error);
      toast.error("Không thể tạo hoặc mở cuộc trò chuyện");
    }
  };

  // Lọc experts theo search
  const filteredExperts = experts.filter((expert) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      expert.Fullname?.toLowerCase().includes(searchLower) ||
      expert.Email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="expert-list">
      {/* Header */}
      <div className="expert-list-header">
        <button className="btn btn-light btn-sm" onClick={onBack}>
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại
        </button>
        <h5>Chọn chuyên gia để chat</h5>
      </div>

      {/* Search */}
      <div className="expert-search">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm chuyên gia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Expert List */}
      <div className="expert-list-items">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="expert-empty">
            <i className="fas fa-user-md"></i>
            <p>
              {searchTerm
                ? "Không tìm thấy chuyên gia nào"
                : "Chưa có chuyên gia nào trong hệ thống"}
            </p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredExperts.map((expert) => (
              <div key={expert.UserID} className="col-12 col-md-6 col-lg-4">
                <div className="expert-card">
                  <div className="expert-avatar">
                    {expert.Avatar ? (
                      <img src={expert.Avatar} alt={expert.Fullname} />
                    ) : (
                      <div className="expert-avatar-placeholder">
                        <i className="fas fa-user-md"></i>
                      </div>
                    )}
                  </div>

                  <div className="expert-info">
                    <h6 className="expert-name">{expert.Fullname}</h6>
                    <p className="expert-email">
                      <i className="fas fa-envelope me-1"></i>
                      {expert.Email}
                    </p>
                    {expert.Phone && (
                      <p className="expert-phone">
                        <i className="fas fa-phone me-1"></i>
                        {expert.Phone}
                      </p>
                    )}
                    <span className="badge bg-success">
                      <i className="fas fa-certificate me-1"></i>
                      Chuyên gia
                    </span>
                  </div>

                  <button
                    className="btn btn-primary w-100 mt-2"
                    onClick={() => handleStartChat(expert)}
                  >
                    <i className="fas fa-comment-dots me-2"></i>
                    Nhắn tin
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
