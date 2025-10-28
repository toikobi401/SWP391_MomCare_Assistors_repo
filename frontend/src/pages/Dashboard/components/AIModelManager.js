import React, { useState, useEffect } from 'react';
import { 
  getAllAIModels, 
  createAIModel, 
  updateAIModel, 
  deleteAIModel,
  checkModelAvailability 
} from '../../services/aiService';
import { toast } from 'react-hot-toast';

export const AIModelManager = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    description: ''
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const result = await getAllAIModels();
      if (result.success) {
        setModels(result.models);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách AI models');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.apiKey) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      let result;
      if (editingModel) {
        result = await updateAIModel(editingModel.ModelID, formData);
      } else {
        result = await createAIModel(formData);
      }

      if (result.success) {
        toast.success(editingModel ? 'Cập nhật model thành công!' : 'Tạo model thành công!');
        setShowCreateModal(false);
        setEditingModel(null);
        setFormData({ name: '', apiKey: '', description: '' });
        loadModels();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Lỗi khi lưu model');
      console.error(error);
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData({
      name: model.Name,
      apiKey: model.Api_Key,
      description: model.description || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (modelId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa model này?')) {
      return;
    }

    try {
      const result = await deleteAIModel(modelId);
      if (result.success) {
        toast.success('Xóa model thành công!');
        loadModels();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Lỗi khi xóa model');
      console.error(error);
    }
  };

  const handleTestModel = async (modelId) => {
    try {
      const isAvailable = await checkModelAvailability(modelId);
      if (isAvailable) {
        toast.success('Model hoạt động bình thường!');
      } else {
        toast.error('Model không khả dụng!');
      }
    } catch (error) {
      toast.error('Lỗi khi test model');
      console.error(error);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingModel(null);
    setFormData({ name: '', apiKey: '', description: '' });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🤖 Quản lý AI Models</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Thêm Model Mới
        </button>
      </div>

      {/* Models Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Model</th>
                  <th>API Key</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr key={model.ModelID}>
                    <td>{model.ModelID}</td>
                    <td>
                      <strong>{model.Name}</strong>
                      {model.Name.toLowerCase().includes('gemini') && (
                        <span className="badge bg-success ms-2">Gemini</span>
                      )}
                    </td>
                    <td>
                      <code className="text-muted">
                        {model.Api_Key.substring(0, 20)}...
                      </code>
                    </td>
                    <td>{model.description || <em className="text-muted">Không có mô tả</em>}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleTestModel(model.ModelID)}
                          title="Test Model"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleEdit(model)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(model.ModelID)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {models.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">Chưa có AI model nào được tạo</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Tạo Model Đầu Tiên
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingModel ? 'Chỉnh sửa Model' : 'Tạo Model Mới'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tên Model *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ví dụ: Gemini-2.5-Flash"
                      required
                    />
                    <div className="form-text">
                      Đặt tên có ý nghĩa để dễ phân biệt (VD: Gemini_Chatbot, GPT4_DirectChat)
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">API Key *</label>
                    <input
                      type="password"
                      className="form-control font-monospace"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                      placeholder="AIzaSy... hoặc sk-..."
                      required
                    />
                    <div className="form-text">
                      API key từ provider AI (Google, OpenAI, Anthropic, v.v.)
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Mô tả mục đích sử dụng model này (chatbot, direct chat, v.v.)"
                    ></textarea>
                    <div className="form-text">
                      Từ khóa quan trọng: "chatbot", "direct", "float" để system tự động chọn model phù hợp
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <small>
                      <strong>💡 Gợi ý:</strong> Sử dụng từ khóa trong mô tả:
                      <br />• "chatbot" hoặc "float" → Model cho chatbot floating
                      <br />• "direct" hoặc "chat" → Model cho direct chat
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingModel ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};