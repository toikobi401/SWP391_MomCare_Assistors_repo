-- ===============================================
-- SETUP_CHATBOT_MESSAGES.sql - Setup Messages table cho Chatbot
-- ===============================================

USE [MomCare]
GO

PRINT '🔧 SETTING UP CHATBOT MESSAGES INTEGRATION';
PRINT '==========================================';

-- 1. Kiểm tra và thêm ConversationID vào Messages table
PRINT '';
PRINT '📋 1. Checking and adding ConversationID to Messages table...';

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Messages') 
    AND name = 'ConversationID'
)
BEGIN
    ALTER TABLE Messages
    ADD ConversationID BIGINT NULL;
    
    PRINT '✅ Added ConversationID column to Messages table';
END
ELSE
BEGIN
    PRINT 'ℹ️ ConversationID column already exists in Messages table';
END
GO

-- 2. Thêm Foreign Key constraint
PRINT '';
PRINT '📋 2. Adding Foreign Key constraint...';

IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE object_id = OBJECT_ID('FK_Messages_Conversations')
)
BEGIN
    ALTER TABLE Messages
    ADD CONSTRAINT FK_Messages_Conversations 
    FOREIGN KEY (ConversationID) REFERENCES Conversations(ConversationID);
    
    PRINT '✅ Added Foreign Key FK_Messages_Conversations';
END
ELSE
BEGIN
    PRINT 'ℹ️ Foreign Key FK_Messages_Conversations already exists';
END
GO

-- 3. Kiểm tra cấu trúc Messages table cuối cùng
PRINT '';
PRINT '📋 3. Final Messages table structure:';

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Messages'
ORDER BY ORDINAL_POSITION;
GO

-- 4. Tạo index để tối ưu performance
PRINT '';
PRINT '📋 4. Creating performance indexes...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Messages_ConversationID_Timestamp')
BEGIN
    CREATE INDEX IX_Messages_ConversationID_Timestamp 
    ON Messages (ConversationID, Timestamp DESC);
    
    PRINT '✅ Created index IX_Messages_ConversationID_Timestamp';
END
ELSE
BEGIN
    PRINT 'ℹ️ Index IX_Messages_ConversationID_Timestamp already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Messages_UserID')
BEGIN
    CREATE INDEX IX_Messages_UserID 
    ON Messages (UserID);
    
    PRINT '✅ Created index IX_Messages_UserID';
END
ELSE
BEGIN
    PRINT 'ℹ️ Index IX_Messages_UserID already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Messages_ModelID')
BEGIN
    CREATE INDEX IX_Messages_ModelID 
    ON Messages (ModelID);
    
    PRINT '✅ Created index IX_Messages_ModelID';
END
ELSE
BEGIN
    PRINT 'ℹ️ Index IX_Messages_ModelID already exists';
END
GO

PRINT '';
PRINT '🎉 CHATBOT MESSAGES SETUP COMPLETED!';
PRINT '====================================';
PRINT '';
PRINT '✅ Messages table is ready for Chatbot integration';
PRINT '✅ ConversationID column added with Foreign Key constraint';
PRINT '✅ Performance indexes created';
PRINT '';
PRINT '🚀 You can now use the Chatbot with database message storage!';