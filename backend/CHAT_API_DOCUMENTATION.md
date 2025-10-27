# 📚 API DOCUMENTATION - HỆ THỐNG CHAT

## 🎯 Tổng quan
Backend API cho hệ thống chat đa năng hỗ trợ:
- Chat với AI chatbot (Gemini, ChatGPT, v.v.)
- Chat 1-1 với user khác
- Chat nhóm
- Gửi file đính kèm
- Quản lý nhiều conversation

---

## 📁 CONVERSATIONS API

### 1. Lấy tất cả conversations của user
```http
GET /api/conversations/user/:userId
```

**Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách conversations thành công!",
  "data": [
    {
      "ConversationID": 1,
      "Name": "Chat với bác sĩ",
      "CreateAt": "2025-10-27T10:30:00.000Z",
      "LastMessage": "Xin chào, tôi có thể giúp gì cho bạn?",
      "LastMessageTime": "2025-10-27T12:45:00.000Z"
    }
  ]
}
```

---

### 2. Lấy chi tiết conversation
```http
GET /api/conversations/:conversationId
```

**Response:**
```json
{
  "code": 200,
  "message": "Lấy chi tiết conversation thành công!",
  "data": {
    "ConversationID": 1,
    "Name": "Chat với bác sĩ",
    "CreateAt": "2025-10-27T10:30:00.000Z",
    "participants": [
      {
        "UserID": 1,
        "FullName": "Nguyễn Văn A",
        "Avatar": "https://...",
        "Email": "user@example.com",
        "ModelID": null,
        "ModelName": null
      },
      {
        "UserID": null,
        "FullName": null,
        "Avatar": null,
        "Email": null,
        "ModelID": 1,
        "ModelName": "Gemini-2.5-Flash"
      }
    ]
  }
}
```

---

### 3. Tạo conversation mới
```http
POST /api/conversations/create
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Nhóm chat mẹ bầu",
  "creatorUserId": 1,
  "participantUserIds": [2, 3, 4],
  "modelId": null
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Tạo conversation thành công!",
  "data": {
    "conversationId": 5
  }
}
```

**Lưu ý:**
- `modelId`: Để `null` nếu chat với users, điền ID nếu chat với AI
- `participantUserIds`: Mảng ID các user tham gia (không bao gồm creator)

---

### 4. Thêm participant vào conversation
```http
POST /api/conversations/:conversationId/add-participant
Content-Type: application/json
```

**Body:**
```json
{
  "userId": 5,
  "modelId": null
}
```

---

### 5. Xóa participant khỏi conversation
```http
DELETE /api/conversations/:conversationId/remove-participant/:userId
```

---

### 6. Đổi tên conversation
```http
PUT /api/conversations/:conversationId/rename
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Tên mới của conversation"
}
```

---

### 7. Xóa conversation
```http
DELETE /api/conversations/:conversationId
```

**Lưu ý:** Xóa conversation sẽ xóa tất cả messages, attachments và participants.

---

## 💬 MESSAGES API

### 1. Lấy tất cả messages trong conversation
```http
GET /api/messages/:conversationId?limit=100&offset=0
```

**Query Parameters:**
- `limit`: Số lượng messages tối đa (mặc định 100)
- `offset`: Vị trí bắt đầu (cho phân trang, mặc định 0)

**Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách messages thành công!",
  "data": [
    {
      "MessageID": 1,
      "UserID": 1,
      "ModelID": null,
      "Content": "Xin chào",
      "MessageType": "text",
      "Timestamp": "2025-10-27T12:30:00.000Z",
      "SenderName": "Nguyễn Văn A",
      "SenderAvatar": "https://...",
      "ModelName": null,
      "AttachmentCount": 0
    },
    {
      "MessageID": 2,
      "UserID": null,
      "ModelID": 1,
      "Content": "Xin chào! Tôi có thể giúp gì cho bạn?",
      "MessageType": "text",
      "Timestamp": "2025-10-27T12:31:00.000Z",
      "SenderName": null,
      "SenderAvatar": null,
      "ModelName": "Gemini-2.5-Flash",
      "AttachmentCount": 0,
      "attachments": []
    }
  ]
}
```

---

### 2. Lấy chi tiết một message
```http
GET /api/messages/detail/:messageId
```

**Response:**
```json
{
  "code": 200,
  "message": "Lấy chi tiết message thành công!",
  "data": {
    "MessageID": 3,
    "UserID": 1,
    "ModelID": null,
    "Content": "Đây là hình ảnh siêu âm",
    "MessageType": "image",
    "Timestamp": "2025-10-27T13:00:00.000Z",
    "ConversationID": 1,
    "SenderName": "Nguyễn Văn A",
    "SenderAvatar": "https://...",
    "ModelName": null,
    "attachments": [
      {
        "AttachmentID": 1,
        "MessageID": 3,
        "OriginalFileName": "sieu_am.jpg",
        "FileSize": 1024000,
        "StorageURL": "https://cloudinary.com/...",
        "CreateAt": "2025-10-27T13:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Gửi message từ user
```http
POST /api/messages/send-user
Content-Type: application/json
```

**Body:**
```json
{
  "conversationId": 1,
  "userId": 1,
  "content": "Chào bạn!",
  "messageType": "text",
  "attachments": [
    {
      "fileName": "file.pdf",
      "fileSize": 2048000,
      "url": "https://cloudinary.com/..."
    }
  ]
}
```

**Message Types:**
- `text`: Tin nhắn văn bản
- `image`: Hình ảnh
- `file`: File đính kèm
- `system`: Thông báo hệ thống

**Response:**
```json
{
  "code": 200,
  "message": "Gửi message thành công!",
  "data": {
    "MessageID": 10,
    "UserID": 1,
    "Content": "Chào bạn!",
    "MessageType": "text",
    "Timestamp": "2025-10-27T14:00:00.000Z",
    "SenderName": "Nguyễn Văn A",
    "attachments": [...]
  }
}
```

---

### 4. Gửi message từ AI model
```http
POST /api/messages/send-model
Content-Type: application/json
```

**Body:**
```json
{
  "conversationId": 1,
  "modelId": 1,
  "content": "Đây là câu trả lời từ AI...",
  "messageType": "text"
}
```

---

### 5. Cập nhật nội dung message
```http
PUT /api/messages/:messageId
Content-Type: application/json
```

**Body:**
```json
{
  "content": "Nội dung đã chỉnh sửa"
}
```

---

### 6. Xóa message
```http
DELETE /api/messages/:messageId
```

---

### 7. Tìm kiếm messages
```http
GET /api/messages/:conversationId/search?q=từ_khóa
```

**Response:**
```json
{
  "code": 200,
  "message": "Tìm kiếm messages thành công!",
  "data": [
    {
      "MessageID": 5,
      "Content": "Nội dung chứa từ_khóa",
      "Timestamp": "2025-10-27T12:00:00.000Z",
      "SenderName": "Nguyễn Văn A"
    }
  ]
}
```

---

## 📤 CHAT UPLOAD API

### Upload file cho chat
```http
POST /api/chat-upload/
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File cần upload (hình ảnh, PDF, DOC, v.v.)

**Request Example (Postman/Thunder Client):**
```
POST http://localhost:5000/api/chat-upload/
Content-Type: multipart/form-data

Body (form-data):
- file: [Select File]
```

**Response:**
```json
{
  "code": 200,
  "message": "Upload file thành công!",
  "data": {
    "url": "https://res.cloudinary.com/dlvydxyma/image/upload/v1234567890/abc123.jpg",
    "fileName": "sieu_am.jpg",
    "fileSize": 1024000
  }
}
```

**Lưu ý:**
- File được upload lên Cloudinary tự động
- URL trả về có thể sử dụng trực tiếp trong message
- Hỗ trợ tất cả loại file (ảnh, PDF, DOC, video, v.v.)
- Kích thước file tối đa phụ thuộc vào cấu hình Cloudinary

**Cách sử dụng với chat:**
1. Upload file bằng endpoint này
2. Lấy `url`, `fileName`, `fileSize` từ response
3. Gửi message kèm attachment:
```json
{
  "conversationId": 1,
  "userId": 1,
  "content": "Đây là kết quả siêu âm của tôi",
  "messageType": "file",
  "attachments": [
    {
      "fileName": "sieu_am.jpg",
      "fileSize": 1024000,
      "url": "https://res.cloudinary.com/.../abc123.jpg"
    }
  ]
}
```

---

## 🤖 MODELS API

### 1. Lấy tất cả AI models
```http
GET /api/models/
```

**Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách models thành công!",
  "data": [
    {
      "ModelID": 1,
      "Name": "Gemini-2.5-Flash",
      "Api_Key": "AIzaSy...",
      "description": "Google Gemini AI for health consultation"
    },
    {
      "ModelID": 2,
      "Name": "ChatGPT-4",
      "Api_Key": "sk-...",
      "description": "OpenAI ChatGPT for general chat"
    }
  ]
}
```

---

### 2. Lấy chi tiết một model
```http
GET /api/models/:modelId
```

---

### 3. Tạo model mới
```http
POST /api/models/create
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Claude-3.5",
  "apiKey": "sk-ant-...",
  "description": "Anthropic Claude AI"
}
```

---

### 4. Cập nhật model
```http
PUT /api/models/:modelId
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Gemini-2.5-Pro",
  "apiKey": "AIzaSy...",
  "description": "Updated description"
}
```

---

### 5. Xóa model
```http
DELETE /api/models/:modelId
```

---

## 🔧 CÁCH SỬ DỤNG

### Scenario 1: Chat với AI Chatbot

1. **Tạo conversation với AI:**
```bash
POST /api/conversations/create
{
  "name": "Chat với Gemini AI",
  "creatorUserId": 1,
  "participantUserIds": [],
  "modelId": 1
}
```

2. **Gửi tin nhắn từ user:**
```bash
POST /api/messages/send-user
{
  "conversationId": 1,
  "userId": 1,
  "content": "Tôi đang mang thai tuần thứ 12, nên ăn gì?",
  "messageType": "text"
}
```

3. **Gửi câu trả lời từ AI:**
```bash
POST /api/messages/send-model
{
  "conversationId": 1,
  "modelId": 1,
  "content": "Ở tuần thứ 12, bạn nên ăn...",
  "messageType": "text"
}
```

---

### Scenario 2: Chat 1-1 với User khác

1. **Tạo conversation:**
```bash
POST /api/conversations/create
{
  "name": "Chat với Trần Thị B",
  "creatorUserId": 1,
  "participantUserIds": [2],
  "modelId": null
}
```

2. **Gửi tin nhắn:**
```bash
POST /api/messages/send-user
{
  "conversationId": 2,
  "userId": 1,
  "content": "Chào bạn, bạn khỏe không?",
  "messageType": "text"
}
```

---

### Scenario 3: Chat nhóm

1. **Tạo nhóm chat:**
```bash
POST /api/conversations/create
{
  "name": "Nhóm mẹ bầu tháng 10/2025",
  "creatorUserId": 1,
  "participantUserIds": [2, 3, 4, 5],
  "modelId": null
}
```

2. **Thêm thành viên mới:**
```bash
POST /api/conversations/3/add-participant
{
  "userId": 6,
  "modelId": null
}
```

---

## 📊 DATABASE SCHEMA

File SQL schema: `backend/sql/ChatBotV2.sql`

**Tables:**
- `Conversations`: Lưu thông tin cuộc trò chuyện
- `Messages`: Lưu tin nhắn (từ user hoặc AI)
- `Models`: Quản lý các AI models
- `Participant`: Liên kết user/model với conversation
- `Attachments`: Quản lý file đính kèm
- `User`: Thông tin user (kế thừa từ MomCareV9.sql)
- `Role`: Vai trò user (kế thừa từ MomCareV9.sql)

---

## 🚀 TESTING

### Sử dụng Postman/Thunder Client:

1. Import collection với các endpoint trên
2. Set base URL: `http://localhost:5000`
3. Test theo thứ tự:
   - Tạo model (nếu chưa có)
   - Tạo conversation
   - Gửi messages
   - Lấy messages
   - Tìm kiếm messages

### Kiểm tra database:

```sql
-- Kiểm tra conversations
SELECT * FROM Conversations;

-- Kiểm tra messages
SELECT * FROM Messages ORDER BY Timestamp DESC;

-- Kiểm tra participants
SELECT * FROM Participant;

-- Kiểm tra models
SELECT * FROM Models;
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Trước khi sử dụng API:**
   - Chạy file `backend/sql/ChatBotV2.sql` để tạo các bảng cần thiết
   - Đảm bảo database `MomCare` đã có bảng `User` và `Role`

2. **ConversationID là BIGINT** (không phải INT như các bảng khác)

3. **MessageType values:**
   - `text`: Tin nhắn văn bản thông thường
   - `image`: Hình ảnh
   - `file`: File đính kèm (PDF, DOC, v.v.)
   - `system`: Thông báo hệ thống (vd: "User A đã tham gia nhóm")

4. **User hoặc Model:**
   - Message từ user: `UserID` có giá trị, `ModelID` = NULL
   - Message từ AI: `ModelID` có giá trị, `UserID` = NULL

5. **File Upload:**
   - Sử dụng endpoint `/api/upload` (đã có sẵn) để upload file
   - Lấy URL trả về và lưu vào `attachments` khi gửi message

---

## 📝 ROADMAP TƯƠNG LAI

- [ ] WebSocket/Socket.IO cho real-time chat
- [ ] Typing indicators
- [ ] Read receipts (đã đọc/chưa đọc)
- [ ] Notification system
- [ ] Message reactions (like, love, v.v.)
- [ ] Voice messages
- [ ] Video calls
- [ ] End-to-end encryption

---

**Version:** 1.0.0  
**Date:** October 27, 2025  
**Author:** MomCare Development Team
