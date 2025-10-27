-- ===============================================
-- FIX ChatBotV2.sql - Thêm ConversationID vào Messages
-- ===============================================

USE [MomCare]
GO

-- Kiểm tra xem cột ConversationID đã tồn tại chưa
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Messages') 
    AND name = 'ConversationID'
)
BEGIN
    -- Thêm cột ConversationID vào bảng Messages
    ALTER TABLE Messages
    ADD ConversationID BIGINT NULL;
    
    PRINT 'Đã thêm cột ConversationID vào bảng Messages';
END
ELSE
BEGIN
    PRINT 'Cột ConversationID đã tồn tại trong bảng Messages';
END
GO

-- Thêm Foreign Key constraint nếu chưa có
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE object_id = OBJECT_ID('FK_Messages_Conversations')
)
BEGIN
    ALTER TABLE Messages
    ADD CONSTRAINT FK_Messages_Conversations 
    FOREIGN KEY (ConversationID) REFERENCES Conversations(ConversationID);
    
    PRINT 'Đã thêm Foreign Key FK_Messages_Conversations';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_Messages_Conversations đã tồn tại';
END
GO

-- Kiểm tra kết quả
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Messages'
ORDER BY ORDINAL_POSITION;
GO
