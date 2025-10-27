# 🚀 HƯỚNG DẪN CÀI ĐẶT HỆ THỐNG CHAT

## 📋 Checklist trước khi bắt đầu

- [x] Models được tạo: `conversationModel.js`, `messageModel.js`, `modelModel.js`, `attachmentModel.js`
- [x] Controllers được tạo: `conversation.controller.js`, `message.controller.js`, `model.controller.js`
- [x] Routes được tạo: `conversation.route.js`, `message.route.js`, `model.route.js`
- [x] Routes đã đăng ký trong `index.route.js`

---

## 📦 Bước 1: Cài đặt Database

### 1.1. Chạy file SQL gốc (nếu chưa có)
```sql
-- Mở SQL Server Management Studio
-- Chạy file: backend/sql/ChatBotV2.sql
```

### 1.2. Chạy file fix để thêm ConversationID
```sql
-- Chạy file: backend/sql/FIX_ChatBotV2.sql
-- File này sẽ thêm cột ConversationID vào bảng Messages
```

### 1.3. Kiểm tra tables đã được tạo
```sql
USE MomCare;
GO

-- Kiểm tra các bảng
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('Conversations', 'Messages', 'Models', 'Participant', 'Attachments');

-- Kiểm tra cột ConversationID trong Messages
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Messages';
```

Kết quả mong đợi:
```
Messages columns:
- MessageID (bigint)
- UserID (int)
- ModelID (bigint)
- Content (nvarchar)
- MessageType (nvarchar)
- Timestamp (datetime)
- ConversationID (bigint) <-- Phải có cột này
```

---

## 🔧 Bước 2: Khởi động Backend

### 2.1. Cài đặt dependencies (nếu chưa)
```bash
cd backend
npm install
```

### 2.2. Kiểm tra file .env
```env
DB_USER=dat
DB_PASSWORD=123
DB_SERVER=WAR-MACHINE
DB_NAME=MomCare
PORT=5000
```

### 2.3. Chạy server
```bash
npm run dev
```

Kết quả mong đợi:
```
Đang kết nối tới SQL Server...
Connected to SQL Server!
Website đang chạy trên cổng 5000
```

---

## 🧪 Bước 3: Test API

### 3.1. Test với Postman/Thunder Client

#### Test 1: Tạo AI Model
```http
POST http://localhost:5000/api/models/create
Content-Type: application/json

{
  "name": "Gemini-2.5-Flash",
  "apiKey": "AIzaSyBaawGhWsfTmyeMxCrbB4Q8YM98DNFPDSk",
  "description": "Google Gemini AI for MomCare"
}
```

Kết quả mong đợi:
```json
{
  "code": 200,
  "message": "Tạo model thành công!",
  "data": {
    "modelId": 1
  }
}
```

---

#### Test 2: Tạo Conversation (Chat với AI)
```http
POST http://localhost:5000/api/conversations/create
Content-Type: application/json

{
  "name": "Chat với Gemini AI",
  "creatorUserId": 1,
  "participantUserIds": [],
  "modelId": 1
}
```

Kết quả mong đợi:
```json
{
  "code": 200,
  "message": "Tạo conversation thành công!",
  "data": {
    "conversationId": 1
  }
}
```

---

#### Test 3: Gửi message từ user
```http
POST http://localhost:5000/api/messages/send-user
Content-Type: application/json

{
  "conversationId": 1,
  "userId": 1,
  "content": "Xin chào, tôi đang mang thai tuần 12",
  "messageType": "text",
  "attachments": []
}
```

Kết quả mong đợi:
```json
{
  "code": 200,
  "message": "Gửi message thành công!",
  "data": {
    "MessageID": 1,
    "UserID": 1,
    "Content": "Xin chào, tôi đang mang thai tuần 12",
    "Timestamp": "2025-10-27T...",
    "attachments": []
  }
}
```

---

#### Test 4: Gửi response từ AI
```http
POST http://localhost:5000/api/messages/send-model
Content-Type: application/json

{
  "conversationId": 1,
  "modelId": 1,
  "content": "Chào bạn! Chúc mừng bạn đã đến tuần 12. Ở giai đoạn này...",
  "messageType": "text"
}
```

---

#### Test 5: Lấy tất cả messages
```http
GET http://localhost:5000/api/messages/1
```

Kết quả mong đợi:
```json
{
  "code": 200,
  "message": "Lấy danh sách messages thành công!",
  "data": [
    {
      "MessageID": 1,
      "UserID": 1,
      "SenderName": "Nguyễn Văn A",
      "Content": "Xin chào, tôi đang mang thai tuần 12",
      "Timestamp": "..."
    },
    {
      "MessageID": 2,
      "ModelID": 1,
      "ModelName": "Gemini-2.5-Flash",
      "Content": "Chào bạn! Chúc mừng bạn...",
      "Timestamp": "..."
    }
  ]
}
```

---

#### Test 6: Lấy conversations của user
```http
GET http://localhost:5000/api/conversations/user/1
```

---

#### Test 7: Tạo conversation chat với user khác
```http
POST http://localhost:5000/api/conversations/create
Content-Type: application/json

{
  "name": "Chat với Trần Thị B",
  "creatorUserId": 1,
  "participantUserIds": [2],
  "modelId": null
}
```

---

### 3.2. Test với SQL Query

```sql
USE MomCare;

-- Xem tất cả conversations
SELECT * FROM Conversations;

-- Xem tất cả messages
SELECT 
    m.*,
    u.FullName AS SenderName,
    mod.Name AS ModelName
FROM Messages m
LEFT JOIN [User] u ON m.UserID = u.UserID
LEFT JOIN Models mod ON m.ModelID = mod.ModelID
ORDER BY m.Timestamp DESC;

-- Xem participants
SELECT 
    c.Name AS ConversationName,
    u.FullName AS UserName,
    mod.Name AS ModelName
FROM Participant p
INNER JOIN Conversations c ON p.ConversationID = c.ConversationID
LEFT JOIN [User] u ON p.UserID = u.UserID
LEFT JOIN Models mod ON p.ModelID = mod.ModelID;

-- Xem models
SELECT * FROM Models;
```

---

## 📁 Cấu trúc File đã tạo

```
backend/
├── api/
│   ├── models/
│   │   ├── conversationModel.js ✅ MỚI
│   │   ├── messageModel.js ✅ MỚI
│   │   ├── modelModel.js ✅ MỚI
│   │   ├── attachmentModel.js ✅ MỚI
│   │   ├── userModel.js (đã có)
│   │   ├── roleModel.js (đã có)
│   │   └── blogModel.js (đã có)
│   │
│   ├── controllers/
│   │   ├── conversation.controller.js ✅ MỚI
│   │   ├── message.controller.js ✅ MỚI
│   │   ├── model.controller.js ✅ MỚI
│   │   ├── user.controller.js (đã có)
│   │   └── blog.controller.js (đã có)
│   │
│   └── routes/
│       ├── conversation.route.js ✅ MỚI
│       ├── message.route.js ✅ MỚI
│       ├── model.route.js ✅ MỚI
│       ├── index.route.js (đã cập nhật) ✅
│       ├── user.route.js (đã có)
│       └── blog.route.js (đã có)
│
├── sql/
│   ├── ChatBotV2.sql (đã có)
│   ├── FIX_ChatBotV2.sql ✅ MỚI
│   └── MomCareV9.sql (đã có)
│
├── CHAT_API_DOCUMENTATION.md ✅ MỚI
└── SETUP_GUIDE.md ✅ MỚI (file này)
```

---

## 🎯 Endpoints đã tạo

### Conversations (7 endpoints)
- `GET /api/conversations/user/:userId` - Lấy conversations của user
- `GET /api/conversations/:conversationId` - Chi tiết conversation
- `POST /api/conversations/create` - Tạo conversation mới
- `POST /api/conversations/:conversationId/add-participant` - Thêm người
- `DELETE /api/conversations/:conversationId/remove-participant/:userId` - Xóa người
- `PUT /api/conversations/:conversationId/rename` - Đổi tên
- `DELETE /api/conversations/:conversationId` - Xóa conversation

### Messages (7 endpoints)
- `GET /api/messages/:conversationId` - Lấy messages
- `GET /api/messages/detail/:messageId` - Chi tiết message
- `POST /api/messages/send-user` - Gửi từ user
- `POST /api/messages/send-model` - Gửi từ AI
- `PUT /api/messages/:messageId` - Cập nhật message
- `DELETE /api/messages/:messageId` - Xóa message
- `GET /api/messages/:conversationId/search?q=...` - Tìm kiếm

### Models (5 endpoints)
- `GET /api/models/` - Lấy tất cả models
- `GET /api/models/:modelId` - Chi tiết model
- `POST /api/models/create` - Tạo model mới
- `PUT /api/models/:modelId` - Cập nhật model
- `DELETE /api/models/:modelId` - Xóa model

**Tổng: 19 endpoints mới**

---

## ⚠️ Lưu ý quan trọng

1. **Trước khi test API:**
   - Chạy `FIX_ChatBotV2.sql` để thêm cột `ConversationID`
   - Đảm bảo có ít nhất 1 user trong database (UserID = 1)

2. **Khi tạo conversation:**
   - Chat với AI: `modelId` có giá trị, `participantUserIds` = []
   - Chat với users: `modelId` = null, `participantUserIds` = [2, 3, 4]

3. **MessageType values:**
   - `text` - Tin nhắn văn bản
   - `image` - Hình ảnh
   - `file` - File đính kèm
   - `system` - Thông báo hệ thống

4. **Upload file:**
   - Sử dụng `/api/upload` để upload file trước
   - Lấy URL và thêm vào `attachments` array

---

## 🐛 Troubleshooting

### Lỗi: "Invalid column name 'ConversationID'"
**Giải pháp:** Chạy file `FIX_ChatBotV2.sql`

### Lỗi: "Cannot insert NULL into ConversationID"
**Giải pháp:** Đảm bảo bạn truyền `conversationId` trong body khi gửi message

### Lỗi: "Foreign key constraint error"
**Giải pháp:** Kiểm tra `conversationId`, `userId`, `modelId` có tồn tại trong database không

### Lỗi: "User not found"
**Giải pháp:** Tạo user trước bằng endpoint `/api/users/register`

---

## 📚 Tài liệu tham khảo

- [CHAT_API_DOCUMENTATION.md](./CHAT_API_DOCUMENTATION.md) - Chi tiết tất cả API endpoints
- [ChatBotV2.sql](./sql/ChatBotV2.sql) - Database schema
- [FIX_ChatBotV2.sql](./sql/FIX_ChatBotV2.sql) - Fix script

---

## ✅ Kiểm tra hoàn tất

- [ ] Database tables đã được tạo
- [ ] Cột ConversationID đã được thêm vào Messages
- [ ] Backend server chạy thành công
- [ ] Tạo được AI model
- [ ] Tạo được conversation
- [ ] Gửi được message từ user
- [ ] Gửi được message từ AI
- [ ] Lấy được danh sách messages
- [ ] Lấy được danh sách conversations

**Khi tất cả checklist trên ✅, hệ thống chat đã sẵn sàng để phát triển frontend!**

---

**Version:** 1.0.0  
**Date:** October 27, 2025  
**Author:** MomCare Development Team
