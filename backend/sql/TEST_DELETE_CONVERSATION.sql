-- ===============================================
-- TEST_DELETE_CONVERSATION.sql - Test xóa conversation 
-- ===============================================

USE [MomCare]
GO

-- Test script để kiểm tra tính năng xóa conversation
-- Lưu ý: Chỉ chạy trong môi trường development/test

PRINT '=== BẮTT ĐẦU TEST XÓA CONVERSATION ===';

-- 1. Tạo test data
DECLARE @TestConversationID BIGINT;
DECLARE @TestUserID1 INT = 1; -- User 1
DECLARE @TestUserID2 INT = 2; -- User 2

-- Tạo test conversation
INSERT INTO Conversations (Name, CreateAt)
VALUES (N'Test Conversation - Sẽ bị xóa', GETDATE());

SET @TestConversationID = SCOPE_IDENTITY();
PRINT 'Đã tạo test conversation ID: ' + CAST(@TestConversationID AS VARCHAR);

-- Thêm participants
INSERT INTO Participant (ConversationID, UserID, ModelID)
VALUES 
(@TestConversationID, @TestUserID1, NULL),
(@TestConversationID, @TestUserID2, NULL);

PRINT 'Đã thêm 2 participants';

-- Tạo test messages
DECLARE @TestMessageID1 BIGINT, @TestMessageID2 BIGINT;

INSERT INTO Messages (UserID, ModelID, Content, MessageType, Timestamp, ConversationID)
VALUES 
(@TestUserID1, NULL, N'Test message 1', 'text', GETDATE(), @TestConversationID);
SET @TestMessageID1 = SCOPE_IDENTITY();

INSERT INTO Messages (UserID, ModelID, Content, MessageType, Timestamp, ConversationID) 
VALUES
(@TestUserID2, NULL, N'Test message 2', 'text', GETDATE(), @TestConversationID);
SET @TestMessageID2 = SCOPE_IDENTITY();

PRINT 'Đã tạo 2 test messages';

-- Tạo test attachments
INSERT INTO Attachments (OriginalFileName, MessageID, FileSize, CreateAt, StorageURL)
VALUES 
(N'test_file_1.jpg', @TestMessageID1, 1024, GETDATE(), 'https://test.com/file1.jpg'),
(N'test_file_2.pdf', @TestMessageID2, 2048, GETDATE(), 'https://test.com/file2.pdf');

PRINT 'Đã tạo 2 test attachments';

-- 2. Kiểm tra dữ liệu trước khi xóa
PRINT '';
PRINT '=== DỮ LIỆU TRƯỚC KHI XÓA ===';
SELECT 'Conversation' AS TableName, COUNT(*) AS Count FROM Conversations WHERE ConversationID = @TestConversationID
UNION ALL
SELECT 'Participants', COUNT(*) FROM Participant WHERE ConversationID = @TestConversationID  
UNION ALL
SELECT 'Messages', COUNT(*) FROM Messages WHERE ConversationID = @TestConversationID
UNION ALL
SELECT 'Attachments', COUNT(*) FROM Attachments WHERE MessageID IN (SELECT MessageID FROM Messages WHERE ConversationID = @TestConversationID);

-- 3. Thực hiện xóa (mô phỏng logic trong deleteConversation function)
PRINT '';
PRINT '=== BẮT ĐẦU QUÁ TRÌNH XÓA ===';

BEGIN TRANSACTION TestDelete;

BEGIN TRY
    -- Xóa attachments trước
    DELETE FROM Attachments 
    WHERE MessageID IN (
        SELECT MessageID FROM Messages WHERE ConversationID = @TestConversationID
    );
    PRINT 'Đã xóa attachments';

    -- Xóa messages
    DELETE FROM Messages 
    WHERE ConversationID = @TestConversationID;
    PRINT 'Đã xóa messages';

    -- Xóa participants
    DELETE FROM Participant 
    WHERE ConversationID = @TestConversationID;
    PRINT 'Đã xóa participants';

    -- Xóa conversation
    DELETE FROM Conversations 
    WHERE ConversationID = @TestConversationID;
    PRINT 'Đã xóa conversation';

    COMMIT TRANSACTION TestDelete;
    PRINT 'Transaction completed successfully!';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION TestDelete;
    PRINT 'Error occurred: ' + ERROR_MESSAGE();
END CATCH;

-- 4. Kiểm tra dữ liệu sau khi xóa
PRINT '';
PRINT '=== DỮ LIỆU SAU KHI XÓA ===';
SELECT 'Conversation' AS TableName, COUNT(*) AS Count FROM Conversations WHERE ConversationID = @TestConversationID
UNION ALL
SELECT 'Participants', COUNT(*) FROM Participant WHERE ConversationID = @TestConversationID  
UNION ALL
SELECT 'Messages', COUNT(*) FROM Messages WHERE ConversationID = @TestConversationID
UNION ALL
SELECT 'Attachments', COUNT(*) FROM Attachments WHERE MessageID IN (SELECT MessageID FROM Messages WHERE ConversationID = @TestConversationID);

PRINT '';
PRINT '=== KẾT THÚC TEST XÓA CONVERSATION ===';
PRINT 'Nếu tất cả Count = 0 thì tính năng xóa hoạt động đúng!';