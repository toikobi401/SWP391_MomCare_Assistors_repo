-- ===============================================
-- TEST_AI_MODELS_INTEGRATION.sql - Test AI Models Integration
-- ===============================================

USE [MomCare]
GO

PRINT '🧪 TESTING AI MODELS INTEGRATION';
PRINT '================================';

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
    PRINT '❌ Models table does not exist! Run ChatBotV2.sql and INSERT_SAMPLE_MODELS.sql first';
END

-- 2. Kiểm tra bảng Messages có ConversationID
PRINT '';
PRINT '📋 2. Checking Messages table structure...';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Messages') AND name = 'ConversationID')
BEGIN
    PRINT '✅ Messages table has ConversationID column';
END
ELSE
BEGIN
    PRINT '❌ Messages table missing ConversationID! Run FIX_ChatBotV2.sql first';
END

-- 3. Kiểm tra sample conversation
PRINT '';
PRINT '📋 3. Checking sample conversations...';
DECLARE @ConversationCount INT = (SELECT COUNT(*) FROM Conversations);
PRINT 'Conversations count: ' + CAST(@ConversationCount AS VARCHAR);

IF @ConversationCount = 0
BEGIN
    PRINT '⚠️ No conversations found. Creating sample conversation...';
    
    -- Tạo sample conversation
    INSERT INTO Conversations (Name, CreateAt)
    VALUES (N'Test AI Integration', GETDATE());
    
    DECLARE @TestConversationID BIGINT = SCOPE_IDENTITY();
    PRINT '✅ Created test conversation ID: ' + CAST(@TestConversationID AS VARCHAR);
    
    -- Thêm participant (user ID 1)
    INSERT INTO Participant (ConversationID, UserID, ModelID)
    VALUES (@TestConversationID, 1, NULL);
    
    -- Thêm AI model participant
    IF EXISTS (SELECT 1 FROM Models WHERE ModelID = 1)
    BEGIN
        INSERT INTO Participant (ConversationID, UserID, ModelID)
        VALUES (@TestConversationID, NULL, 1);
        PRINT '✅ Added AI model participant';
    END
END

-- 4. Test data summary
PRINT '';
PRINT '📊 4. Test Data Summary:';
PRINT '========================';

SELECT 
    'Models' AS TableName,
    COUNT(*) AS RecordCount
FROM Models
UNION ALL
SELECT 
    'Conversations' AS TableName,
    COUNT(*) AS RecordCount
FROM Conversations
UNION ALL
SELECT 
    'Participants' AS TableName,
    COUNT(*) AS RecordCount
FROM Participant
UNION ALL
SELECT 
    'Messages' AS TableName,
    COUNT(*) AS RecordCount
FROM Messages;

-- 5. API Test Commands
PRINT '';
PRINT '🚀 5. API Test Commands:';
PRINT '========================';
PRINT 'Test these endpoints in Postman/Thunder Client:';
PRINT '';
PRINT '1. Get all models:';
PRINT '   GET http://localhost:5000/api/models/';
PRINT '';
PRINT '2. Test AI response:';
PRINT '   POST http://localhost:5000/api/messages/send-with-ai-response';
PRINT '   Body: {';
PRINT '     "conversationId": 1,';
PRINT '     "userId": 1,';
PRINT '     "content": "Xin chào! Bạn có thể giúp gì cho tôi?",';
PRINT '     "modelId": 1,';
PRINT '     "systemPrompt": "Bạn là trợ lý AI của MomCare"';
PRINT '   }';
PRINT '';
PRINT '3. Test conversation messages:';
PRINT '   GET http://localhost:5000/api/messages/1';
PRINT '';

-- 6. Final status
PRINT '🎯 6. Integration Status:';
PRINT '=========================';

DECLARE @Status NVARCHAR(50) = 'READY';
DECLARE @Issues NVARCHAR(500) = '';

-- Check models
IF NOT EXISTS (SELECT 1 FROM Models)
BEGIN
    SET @Status = 'NOT READY';
    SET @Issues = @Issues + 'No AI models found; ';
END

-- Check conversations structure
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Messages') AND name = 'ConversationID')
BEGIN
    SET @Status = 'NOT READY';
    SET @Issues = @Issues + 'Messages table missing ConversationID; ';
END

IF @Status = 'READY'
BEGIN
    PRINT '✅ AI Models Integration is READY to test!';
    PRINT '🌟 You can now use database AI models in your application';
END
ELSE
BEGIN
    PRINT '❌ Integration NOT READY. Issues: ' + @Issues;
END

PRINT '';
PRINT '📚 Next Steps:';
PRINT '- Start your backend server: npm start';
PRINT '- Test the API endpoints above';
PRINT '- Open frontend and check chatbot floating';
PRINT '- Monitor console logs for AI model selection';

GO