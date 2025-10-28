-- ===============================================
-- FIX_CHATBOT_CONVERSATION.sql - Kiểm tra và tạo conversation cho chatbot
-- ===============================================

USE [MomCare]
GO

PRINT '🔧 FIXING CHATBOT CONVERSATION ISSUES';
PRINT '====================================';

-- 1. Kiểm tra bảng Models
PRINT '';
PRINT '📋 1. Checking Models table...';
IF EXISTS (SELECT * FROM sysobjects WHERE name='Models' AND xtype='U')
BEGIN
    DECLARE @ModelCount INT = (SELECT COUNT(*) FROM Models);
    PRINT '✅ Models table exists with ' + CAST(@ModelCount AS VARCHAR) + ' records';
    
    SELECT 
        ModelID,
        Name,
        LEFT(Api_Key, 15) + '...' AS Api_Key_Preview,
        description
    FROM Models
    ORDER BY ModelID;
END
ELSE
BEGIN
    PRINT '❌ Models table does not exist! Run ChatBotV2.sql first';
END

-- 2. Kiểm tra có conversation nào chưa
PRINT '';
PRINT '📋 2. Checking existing conversations...';
SELECT 
    ConversationID,
    Name,
    CreateAt,
    (SELECT COUNT(*) FROM Participant WHERE ConversationID = c.ConversationID) AS ParticipantCount,
    (SELECT COUNT(*) FROM Messages WHERE ConversationID = c.ConversationID) AS MessageCount
FROM Conversations c
ORDER BY ConversationID;

-- 3. Tạo conversation demo nếu cần
PRINT '';
PRINT '📋 3. Creating demo chatbot conversation...';

DECLARE @DemoConversationID BIGINT;
DECLARE @DemoUserID INT = 1; -- Assume user ID 1 exists
DECLARE @DemoModelID BIGINT = 2; -- Gemini model for chatbot

-- Kiểm tra xem conversation demo đã tồn tại chưa
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE Name LIKE '%Demo Chatbot%')
BEGIN
    -- Tạo conversation demo
    INSERT INTO Conversations (Name, CreateAt)
    VALUES (N'Demo Chatbot Assistant', GETDATE());
    
    SET @DemoConversationID = SCOPE_IDENTITY();
    PRINT '✅ Created demo conversation ID: ' + CAST(@DemoConversationID AS VARCHAR);
    
    -- Thêm user participant (nếu user ID 1 tồn tại)
    IF EXISTS (SELECT 1 FROM [User] WHERE UserID = @DemoUserID)
    BEGIN
        INSERT INTO Participant (ConversationID, UserID, ModelID)
        VALUES (@DemoConversationID, @DemoUserID, NULL);
        PRINT '✅ Added user participant';
    END
    ELSE
    BEGIN
        PRINT '⚠️ User ID 1 not found, skipping user participant';
    END
    
    -- Thêm AI model participant (nếu model ID 2 tồn tại)
    IF EXISTS (SELECT 1 FROM Models WHERE ModelID = @DemoModelID)
    BEGIN
        INSERT INTO Participant (ConversationID, UserID, ModelID)
        VALUES (@DemoConversationID, NULL, @DemoModelID);
        PRINT '✅ Added AI model participant';
    END
    ELSE
    BEGIN
        PRINT '⚠️ Model ID 2 not found, skipping AI participant';
    END
END
ELSE
BEGIN
    PRINT 'ℹ️ Demo chatbot conversation already exists';
END

-- 4. Hiển thị participants
PRINT '';
PRINT '📋 4. Conversation participants summary:';
SELECT 
    c.ConversationID,
    c.Name,
    p.UserID,
    u.FullName AS UserName,
    p.ModelID,
    m.Name AS ModelName
FROM Conversations c
LEFT JOIN Participant p ON c.ConversationID = p.ConversationID
LEFT JOIN [User] u ON p.UserID = u.UserID
LEFT JOIN Models m ON p.ModelID = m.ModelID
ORDER BY c.ConversationID, p.UserID, p.ModelID;

-- 5. Test query để kiểm tra foreign key
PRINT '';
PRINT '📋 5. Testing foreign key constraints...';

-- Kiểm tra tất cả conversation IDs đang được reference
SELECT DISTINCT ConversationID 
FROM Messages 
WHERE ConversationID NOT IN (SELECT ConversationID FROM Conversations);

IF @@ROWCOUNT = 0
BEGIN
    PRINT '✅ All message conversation IDs are valid';
END
ELSE
BEGIN
    PRINT '❌ Found invalid conversation IDs in Messages table';
END

-- 6. Recommendations
PRINT '';
PRINT '💡 RECOMMENDATIONS:';
PRINT '==================';
PRINT '1. Test API endpoint: POST /api/conversations/create-chatbot';
PRINT '   Body: {"userId": 1, "modelId": 2}';
PRINT '';
PRINT '2. Check chatbot frontend console for conversation creation';
PRINT '';
PRINT '3. Verify that hardcoded conversationId: 1 is replaced with dynamic conversation';

PRINT '';
PRINT '🎯 Status: Ready for chatbot conversation testing!';

GO