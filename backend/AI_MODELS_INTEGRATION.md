# 🤖 AI MODELS INTEGRATION - HƯỚNG DẪN SỬ DỤNG

## 🎯 Tổng quan
Hệ thống đã được nâng cấp để hỗ trợ kết nối với các AI models được lưu trữ trong database thay vì chỉ sử dụng hardcode từ file `.env`. Điều này cho phép:

- **Quản lý nhiều AI models** từ database
- **Chuyển đổi linh hoạt** giữa các models khác nhau
- **Cấu hình dynamic** không cần restart server
- **Fallback mechanism** về `.env` khi cần thiết

---

## 📊 Cấu trúc Database

### Bảng Models
```sql
CREATE TABLE [Models] (
    [ModelID] [bigint] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](50) NOT NULL,
    [Api_Key] [nvarchar](150) NOT NULL,
    [description] [nvarchar](255) NULL,
    PRIMARY KEY ([ModelID])
)
```

### Dữ liệu mẫu
```sql
ModelID | Name          | Api_Key                              | Description
--------|---------------|--------------------------------------|---------------------------
1       | Gemini_2.5_1  | AIzaSyAHQVeBfhUNJEoVFi9Rx-5sfaYZ... | For direct chat
2       | Gemini_2.5_2  | AIzaSyBaawGhWsfTmyeMxCrbB4Q8YM98... | For float chatbot
```

---

## 🚀 Cài đặt

### 1. Cài đặt Database
```bash
# Chạy script tạo dữ liệu mẫu
sqlcmd -S your_server -d MomCare -i INSERT_SAMPLE_MODELS.sql
```

### 2. Cài đặt Dependencies (Backend)
```bash
cd backend
npm install @google/generative-ai
```

### 3. No Frontend Changes Required
Frontend sẽ tự động detect và sử dụng AI models từ database.

---

## 🔧 Cách sử dụng

### Backend API

#### 1. Lấy danh sách AI models
```http
GET /api/models/
```

**Response:**
```json
{
  "code": 200,
  "data": [
    {
      "ModelID": 1,
      "Name": "Gemini_2.5_1",
      "Api_Key": "AIzaSy...",
      "description": "For direct chat"
    }
  ]
}
```

#### 2. Gửi message với AI auto-response
```http
POST /api/messages/send-with-ai-response
Content-Type: application/json

{
  "conversationId": 1,
  "userId": 1,
  "content": "Xin chào!",
  "modelId": 1,
  "systemPrompt": "Custom system prompt...",
  "messageType": "text"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Gửi message và nhận AI response thành công!",
  "data": {
    "userMessage": { ... },
    "aiMessage": { ... },
    "aiModel": "Gemini_2.5_1",
    "usage": { ... }
  }
}
```

### Frontend Integration

#### 1. Import AI Service
```javascript
import { 
  getAllAIModels, 
  sendMessageWithAIResponse,
  getChatbotModel,
  getDirectChatModel 
} from '../services/aiService';
```

#### 2. Sử dụng Database AI Models
```javascript
// Load model cho chatbot
const chatbotModel = await getChatbotModel();

// Load model cho direct chat
const directChatModel = await getDirectChatModel();

// Gửi message với AI response
const result = await sendMessageWithAIResponse({
  conversationId: 1,
  userId: 1,
  content: "Hello",
  modelId: chatbotModel.ModelID,
  systemPrompt: "You are a helpful assistant"
});
```

---

## 📋 Components Updated

### Backend
- ✅ `api/services/aiService.js` - AI service integration
- ✅ `api/controllers/message.controller.js` - New endpoint: `sendMessageWithAIResponse`
- ✅ `api/routes/message.route.js` - Route: `/send-with-ai-response`
- ✅ `api/models/modelModel.js` - Đã có sẵn (không thay đổi)

### Frontend
- ✅ `services/aiService.js` - Frontend AI service
- ✅ `components/Chatbot/Chatbot.js` - Updated to use database models
- ✅ Chatbot header - Shows current AI model being used

### Database
- ✅ `sql/INSERT_SAMPLE_MODELS.sql` - Sample data script

---

## 🔄 Workflow

### 1. Chatbot Float (Existing Component)
```
User Input → Frontend (Chatbot.js) → 
  ↓
Check Database Models → Load Chatbot Model → 
  ↓
Send to Backend (/send-with-ai-response) → 
  ↓
AI Service → Generate Response → 
  ↓
Return to Frontend → Display Response
```

### 2. Direct Chat (Chat Page)
```
User Message → MessageArea → 
  ↓
Load Direct Chat Model → 
  ↓
Send via sendMessageWithAIResponse() → 
  ↓
Backend AI Service → WebSocket Update → 
  ↓
Real-time Display
```

---

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Fallback API key (vẫn giữ nguyên)
REACT_APP_GEMINI_API_KEY=AIzaSyBaawGhWsfTmyeMxCrbB4Q8YM98DNFPDSk
```

### Model Selection Logic
- **Chatbot Float**: Tìm model có description chứa "chatbot" hoặc "float"
- **Direct Chat**: Tìm model có description chứa "direct" hoặc "chat" (không phải "chatbot")
- **Fallback**: Sử dụng model đầu tiên trong danh sách

---

## 🧪 Testing

### 1. Test API Endpoints
```bash
# Lấy danh sách models
curl http://localhost:5000/api/models/

# Test AI response
curl -X POST http://localhost:5000/api/messages/send-with-ai-response \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "userId": 1,
    "content": "Hello",
    "modelId": 1
  }'
```

### 2. Test Frontend
1. Mở Chatbot float
2. Kiểm tra header hiển thị model name
3. Gửi tin nhắn và verify AI response
4. Check console logs để xem model được sử dụng

---

## 🚨 Fallback Mechanism

### Khi nào sử dụng .env fallback?
1. **Database không có model nào**
2. **API key không hợp lệ**
3. **Lỗi kết nối database**
4. **User upload ảnh** (vì logic xử lý ảnh phức tạp hơn)

### Console Logs
```
✅ Loaded AI model from database: Gemini_2.5_2
🤖 Using database AI model: Gemini_2.5_2
⚠️ No AI model found in database, falling back to .env
🔄 Falling back to .env AI model
❌ Error loading AI model: [error details]
```

---

## 🛠️ Troubleshooting

### Lỗi: "AI model not available"
**Nguyên nhân:** Model ID không tồn tại hoặc API key không hợp lệ
**Giải pháp:** 
```sql
SELECT * FROM Models WHERE ModelID = 1;
-- Kiểm tra API key có đúng không
```

### Lỗi: "Fallback to .env model"
**Nguyên nhân:** Database models không khả dụng
**Giải pháp:** Kiểm tra kết nối database và chạy `INSERT_SAMPLE_MODELS.sql`

### Lỗi: "Cannot import GoogleGenerativeAI"
**Nguyên nhân:** Package chưa được cài đặt
**Giải pháp:** 
```bash
npm install @google/generative-ai
```

---

## 📈 Mở rộng tương lai

### 1. Hỗ trợ thêm AI Providers
- **ChatGPT** (OpenAI)
- **Claude** (Anthropic)
- **Local LLMs** (Ollama)

### 2. Admin Panel
- Quản lý AI models qua web interface
- Test models trực tiếp
- Monitor usage và performance

### 3. Model Selection Strategy
- Auto-select model dựa trên content type
- Load balancing giữa các models
- Fallback chain khi model unavailable

---

**Version:** 1.0.0  
**Date:** October 28, 2025  
**Author:** MomCare Development Team