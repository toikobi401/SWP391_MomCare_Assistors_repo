-- ===============================================
-- OPTIMIZE_CHAT_1_1.sql - Tối ưu performance cho chat 1-1
-- ===============================================

USE [MomCare]
GO

-- Tạo index để tối ưu việc tìm kiếm conversation 1-1
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Participant_UserID_ConversationID')
BEGIN
    CREATE INDEX IX_Participant_UserID_ConversationID 
    ON Participant (UserID, ConversationID);
    PRINT 'Đã tạo index IX_Participant_UserID_ConversationID';
END
ELSE
BEGIN
    PRINT 'Index IX_Participant_UserID_ConversationID đã tồn tại';
END
GO

-- Tạo index để tối ưu việc tìm kiếm messages theo conversation
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Messages_ConversationID_Timestamp')
BEGIN
    CREATE INDEX IX_Messages_ConversationID_Timestamp 
    ON Messages (ConversationID, Timestamp DESC);
    PRINT 'Đã tạo index IX_Messages_ConversationID_Timestamp';
END
ELSE
BEGIN
    PRINT 'Index IX_Messages_ConversationID_Timestamp đã tồn tại';
END
GO

-- Tạo computed column để dễ dàng identify chat 1-1
IF NOT EXISTS (
    SELECT * FROM sys.computed_columns 
    WHERE object_id = OBJECT_ID('Conversations') 
    AND name = 'IsPrivateChat'
)
BEGIN
    ALTER TABLE Conversations
    ADD IsPrivateChat AS (
        CASE 
            WHEN (SELECT COUNT(*) FROM Participant WHERE ConversationID = Conversations.ConversationID AND ModelID IS NULL) = 2 
            THEN 1 
            ELSE 0 
        END
    ) PERSISTED;
    PRINT 'Đã thêm computed column IsPrivateChat';
END
ELSE
BEGIN
    PRINT 'Computed column IsPrivateChat đã tồn tại';
END
GO

PRINT 'Hoàn thành tối ưu performance cho chat 1-1!';