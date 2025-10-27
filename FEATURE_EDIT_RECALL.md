# 📝 CHỨC NĂNG CHỈNH SỬA/THU HỒI TIN NHẮN

## 🎯 Tổng quan
Chức năng chỉnh sửa và thu hồi tin nhắn tương tự Messenger đã được thêm vào hệ thống chat.

---

## ✨ Tính năng

### 1️⃣ **Chỉnh sửa tin nhắn**
- ✅ Chỉ người gửi mới có thể chỉnh sửa tin nhắn của mình
- ✅ Chỉ áp dụng cho tin nhắn text (không áp dụng cho file/hình ảnh)
- ✅ Hiển thị dropdown menu (3 chấm) khi hover vào tin nhắn
- ✅ Edit mode với input box và nút Save/Cancel
- ✅ Cập nhật real-time cho tất cả người dùng trong conversation

### 2️⃣ **Thu hồi tin nhắn**
- ✅ Chỉ người gửi mới có thể thu hồi tin nhắn của mình
- ✅ Áp dụng cho mọi loại tin nhắn (text, file, hình ảnh)
- ✅ Hiển thị xác nhận trước khi thu hồi
- ✅ Tin nhắn bị thu hồi hiển thị dạng: "Tin nhắn đã được thu hồi" (màu xám, italic)
- ✅ Cập nhật real-time cho tất cả người dùng trong conversation

---

## 🔧 Các file đã thay đổi

### **Backend**

#### 1. `backend/api/models/messageModel.js`
**Thêm 2 functions mới:**

```javascript
// Chỉnh sửa message
module.exports.editMessage = async (messageId, newContent, userId) => {
  // Kiểm tra quyền sở hữu
  // Cập nhật nội dung
  // Trả về message đã cập nhật
};

// Thu hồi message
module.exports.recallMessage = async (messageId, userId) => {
  // Kiểm tra quyền sở hữu
  // Cập nhật message thành "recalled"
  // Trả về message đã cập nhật
};
```

#### 2. `backend/api/controllers/message.controller.js`
**Thêm 2 controller functions:**

```javascript
// [PUT] /api/messages/:messageId/edit
module.exports.editMessage = async (req, res) => {
  // Validate input
  // Gọi messageModel.editMessage()
  // Emit socket event: message_edited
  // Response
};

// [PUT] /api/messages/:messageId/recall
module.exports.recallMessage = async (req, res) => {
  // Gọi messageModel.recallMessage()
  // Emit socket event: message_recalled
  // Response
};
```

#### 3. `backend/api/routes/message.route.js`
**Thêm 2 routes mới:**

```javascript
router.put("/:messageId/edit", controller.editMessage);
router.put("/:messageId/recall", controller.recallMessage);
```

---

### **Frontend**

#### 4. `frontend/src/services/chatApi.js`
**Thêm 2 API functions:**

```javascript
// Chỉnh sửa message
export const editMessage = async (messageId, userId, newContent) => {
  // PUT /api/messages/:messageId/edit
};

// Thu hồi message
export const recallMessage = async (messageId, userId) => {
  // PUT /api/messages/:messageId/recall
};
```

#### 5. `frontend/src/pages/Chat/components/MessageArea.js`
**Thêm các state và handlers:**

```javascript
// State
const [editingMessageId, setEditingMessageId] = useState(null);
const [editingText, setEditingText] = useState("");
const [hoveredMessageId, setHoveredMessageId] = useState(null);

// Handlers
const handleStartEdit = (message) => { /* ... */ };
const handleSaveEdit = async (messageId) => { /* ... */ };
const handleCancelEdit = () => { /* ... */ };
const handleRecallMessage = async (messageId) => { /* ... */ };

// WebSocket listeners
socket.on("message_edited", handleMessageEdited);
socket.on("message_recalled", handleMessageRecalled);
```

**UI Components:**
- Dropdown menu với options "Chỉnh sửa" và "Thu hồi"
- Edit mode với input box và nút Save/Cancel
- Styling cho tin nhắn đã thu hồi

#### 6. `frontend/src/pages/Chat/Chat.css`
**Thêm CSS styling:**

```css
/* Message actions dropdown */
.message-actions { /* ... */ }

/* Edit mode */
.message-edit-mode { /* ... */ }

/* Recalled message */
.message-bubble .text-muted.fst-italic { /* ... */ }
```

---

## 📡 WebSocket Events

### 1. **message_edited**
**Emit:** Backend sau khi chỉnh sửa thành công
```javascript
io.to(`conversation_${conversationId}`).emit('message_edited', {
  conversationId,
  message: updatedMessage
});
```

**Listen:** Frontend để cập nhật UI
```javascript
socket.on('message_edited', ({ conversationId, message }) => {
  // Update message trong state
});
```

### 2. **message_recalled**
**Emit:** Backend sau khi thu hồi thành công
```javascript
io.to(`conversation_${conversationId}`).emit('message_recalled', {
  conversationId,
  message: recalledMessage
});
```

**Listen:** Frontend để cập nhật UI
```javascript
socket.on('message_recalled', ({ conversationId, message }) => {
  // Update message trong state
});
```

---

## 🎨 UI/UX Flow

### **Chỉnh sửa tin nhắn:**
1. User hover vào tin nhắn của mình
2. Hiển thị nút 3 chấm (...)
3. Click vào nút → hiển thị dropdown menu
4. Click "Chỉnh sửa" → chuyển sang edit mode
5. Sửa nội dung trong input box
6. Click "Lưu" hoặc Enter → gửi request
7. Backend xử lý → emit socket event
8. Tất cả users trong conversation nhận được update real-time

### **Thu hồi tin nhắn:**
1. User hover vào tin nhắn của mình
2. Hiển thị nút 3 chấm (...)
3. Click vào nút → hiển thị dropdown menu
4. Click "Thu hồi" → hiển thị confirm dialog
5. Xác nhận → gửi request
6. Backend xử lý → emit socket event
7. Tất cả users trong conversation nhận được update
8. Tin nhắn hiển thị dạng: "🚫 Tin nhắn đã được thu hồi" (màu xám, italic)

---

## 🔐 Bảo mật

### **Kiểm tra quyền sở hữu:**
```javascript
// Trong messageModel.js
const checkResult = await pool
  .request()
  .input("MessageID", sql.BigInt, messageId)
  .input("UserID", sql.Int, userId)
  .query(`
    SELECT MessageID FROM Messages 
    WHERE MessageID = @MessageID AND UserID = @UserID
  `);

if (checkResult.recordset.length === 0) {
  throw new Error("Bạn không có quyền chỉnh sửa/thu hồi tin nhắn này");
}
```

- ✅ Chỉ user sở hữu message mới có quyền edit/recall
- ✅ Backend validation để ngăn chặn request không hợp lệ
- ✅ Frontend UI chỉ hiển thị options cho tin nhắn của mình

---

## 🧪 Testing

### **Test cases:**

#### Chỉnh sửa tin nhắn:
1. ✅ Chỉnh sửa tin nhắn text của mình → thành công
2. ✅ Cố gắng chỉnh sửa tin nhắn của người khác → không hiển thị option
3. ✅ Chỉnh sửa với nội dung trống → hiển thị lỗi
4. ✅ Real-time update cho tất cả users trong conversation
5. ✅ Cancel edit mode → không lưu thay đổi

#### Thu hồi tin nhắn:
1. ✅ Thu hồi tin nhắn của mình → thành công
2. ✅ Cố gắng thu hồi tin nhắn của người khác → không hiển thị option
3. ✅ Confirm dialog trước khi thu hồi
4. ✅ Real-time update cho tất cả users
5. ✅ Tin nhắn đã thu hồi không thể edit/recall lại

---

## 🚀 Cách sử dụng

### **Khởi chạy:**

1. **Backend:**
```bash
cd backend
npm install
npm start
```

2. **Frontend:**
```bash
cd frontend
npm install
npm start
```

3. **Truy cập:** http://localhost:3000

### **Demo:**

1. Đăng nhập vào 2 tài khoản khác nhau (2 browser)
2. Tạo conversation và gửi tin nhắn
3. Hover vào tin nhắn → click nút 3 chấm
4. Thử chỉnh sửa/thu hồi tin nhắn
5. Quan sát real-time update ở cả 2 browser

---

## 📌 Lưu ý

- 🔴 Chỉ có tin nhắn **text** mới có thể chỉnh sửa
- 🔴 Mọi loại tin nhắn đều có thể **thu hồi**
- 🔴 Tin nhắn đã thu hồi **không thể** chỉnh sửa hoặc thu hồi lại
- 🟢 Real-time updates hoạt động qua **WebSocket**
- 🟢 Database lưu trữ thay đổi **vĩnh viễn**

---

## 🎯 Tương thích với Messenger

| Tính năng | Messenger | Hệ thống của chúng ta |
|-----------|-----------|----------------------|
| Chỉnh sửa tin nhắn | ✅ | ✅ |
| Thu hồi tin nhắn | ✅ | ✅ |
| Real-time update | ✅ | ✅ |
| Dropdown menu | ✅ | ✅ |
| Edit mode inline | ✅ | ✅ |
| Confirm dialog | ✅ | ✅ |
| Kiểm tra quyền sở hữu | ✅ | ✅ |
| Hiển thị "đã thu hồi" | ✅ | ✅ |

---

**✅ Hoàn thành!** Chức năng chỉnh sửa/thu hồi tin nhắn đã được tích hợp thành công vào hệ thống chat.
