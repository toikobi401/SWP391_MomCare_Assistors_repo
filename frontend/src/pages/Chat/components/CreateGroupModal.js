import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import {
  getUsersByRole,
  getAllModels,
  createConversation,
} from "../../../services/chatApi";
import toast from "react-hot-toast";

export const CreateGroupModal = ({ currentUser, onClose, onSuccess }) => {
  const [groupName, setGroupName] = useState("");
  const [experts, setExperts] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedExperts, setSelectedExperts] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [searchExpert, setSearchExpert] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, modelsResponse] = await Promise.all([
        getUsersByRole("Expert"),
        getAllModels(),
      ]);

      if (usersResponse.code === 200) {
        // Lọc bỏ current user khỏi danh sách experts
        const expertUsers = usersResponse.data.filter(
          (user) => user.UserID !== currentUser.UserID
        );
        setExperts(expertUsers);
      }

      if (modelsResponse.code === 200) {
        setModels(modelsResponse.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpert = (expertId) => {
    setSelectedExperts((prev) =>
      prev.includes(expertId)
        ? prev.filter((id) => id !== expertId)
        : [...prev, expertId]
    );
  };

  const handleToggleModel = (modelId) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleCreateGroup = async () => {
    // Validation
    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }

    if (selectedExperts.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 chuyên gia");
      return;
    }

    try {
      setCreating(true);

      // Tạo conversation với experts
      const participantUserIds = [currentUser.UserID, ...selectedExperts];

      const conversationData = {
        name: groupName,
        creatorUserId: currentUser.UserID,
        participantUserIds: participantUserIds,
        modelId: null, // Tạo conversation trước
      };

      const response = await createConversation(conversationData);

      if (response.code === 200) {
        // TODO: Thêm AI models vào conversation nếu cần
        // Hiện tại backend chưa hỗ trợ thêm nhiều models cùng lúc
        // Có thể gọi API addParticipant nhiều lần cho từng model

        toast.success("Tạo nhóm chat thành công!");
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Không thể tạo nhóm chat");
    } finally {
      setCreating(false);
    }
  };

  // Lọc experts theo search
  const filteredExperts = experts.filter((expert) =>
    expert.Fullname?.toLowerCase().includes(searchExpert.toLowerCase())
  );

  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-users me-2"></i>
          Tạo nhóm chat mới
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Tên nhóm */}
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Tên nhóm chat</strong>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên nhóm..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </Form.Group>

            {/* Chọn chuyên gia */}
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Chọn chuyên gia ({selectedExperts.length})</strong>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm chuyên gia..."
                value={searchExpert}
                onChange={(e) => setSearchExpert(e.target.value)}
                className="mb-2"
              />
              <div className="expert-select-list">
                {filteredExperts.length === 0 ? (
                  <p className="text-muted text-center py-3">
                    Không tìm thấy chuyên gia nào
                  </p>
                ) : (
                  filteredExperts.map((expert) => (
                    <div
                      key={expert.UserID}
                      className={`expert-select-item ${
                        selectedExperts.includes(expert.UserID) ? "selected" : ""
                      }`}
                      onClick={() => handleToggleExpert(expert.UserID)}
                    >
                      <div className="d-flex align-items-center">
                        <div className="expert-select-avatar me-2">
                          {expert.Avatar ? (
                            <img src={expert.Avatar} alt={expert.Fullname} />
                          ) : (
                            <i className="fas fa-user"></i>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{expert.Fullname}</div>
                          <small className="text-muted">{expert.Email}</small>
                        </div>
                        <Form.Check
                          type="checkbox"
                          checked={selectedExperts.includes(expert.UserID)}
                          readOnly
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Form.Group>

            {/* Chọn AI Models */}
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Chọn AI Models (tùy chọn) ({selectedModels.length})</strong>
              </Form.Label>
              <div className="model-select-list">
                {models.length === 0 ? (
                  <p className="text-muted text-center py-3">
                    Chưa có AI model nào trong hệ thống
                  </p>
                ) : (
                  models.map((model) => (
                    <div
                      key={model.ModelID}
                      className={`model-select-item ${
                        selectedModels.includes(model.ModelID) ? "selected" : ""
                      }`}
                      onClick={() => handleToggleModel(model.ModelID)}
                    >
                      <div className="d-flex align-items-center">
                        <div className="model-select-icon me-2">
                          <i className="fas fa-robot"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{model.Name}</div>
                          <small className="text-muted">
                            {model.description || "AI Assistant"}
                          </small>
                        </div>
                        <Form.Check
                          type="checkbox"
                          checked={selectedModels.includes(model.ModelID)}
                          readOnly
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Form.Group>

            {/* Summary */}
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Bạn đang tạo nhóm chat với <strong>{selectedExperts.length}</strong>{" "}
              chuyên gia
              {selectedModels.length > 0 &&
                ` và ${selectedModels.length} AI model`}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={creating}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateGroup}
          disabled={loading || creating}
        >
          {creating ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              Đang tạo...
            </>
          ) : (
            <>
              <i className="fas fa-check me-2"></i>
              Tạo nhóm
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
