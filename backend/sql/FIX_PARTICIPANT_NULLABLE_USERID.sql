-- ===============================================
-- FIX_PARTICIPANT_NULLABLE_USERID.sql - Cho phép UserID nullable trong bảng Participant
-- ===============================================

USE [MomCare]
GO

PRINT '🔧 FIXING PARTICIPANT TABLE - ALLOW NULL UserID';
PRINT '================================================';

-- Kiểm tra cấu trúc hiện tại
PRINT '';
PRINT '📋 1. Current Participant table structure:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Participant'
ORDER BY ORDINAL_POSITION;

-- Kiểm tra dữ liệu hiện tại
PRINT '';
PRINT '📋 2. Current data in Participant table:';
DECLARE @ParticipantCount INT = (SELECT COUNT(*) FROM Participant);
PRINT 'Total records: ' + CAST(@ParticipantCount AS VARCHAR);

IF @ParticipantCount > 0
BEGIN
    SELECT TOP 5 * FROM Participant;
    PRINT '(Showing first 5 records)';
END

-- Thay đổi cấu trúc: Cho phép UserID nullable
PRINT '';
PRINT '📋 3. Modifying UserID column to allow NULL...';

BEGIN TRY
    -- Thay đổi cột UserID để cho phép NULL
    ALTER TABLE Participant
    ALTER COLUMN UserID INT NULL;
    
    PRINT '✅ Successfully modified UserID column to allow NULL';
END TRY
BEGIN CATCH
    PRINT '❌ Error modifying UserID column:';
    PRINT ERROR_MESSAGE();
END CATCH

-- Kiểm tra kết quả
PRINT '';
PRINT '📋 4. Updated Participant table structure:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Participant'
ORDER BY ORDINAL_POSITION;

-- Test insert với UserID = NULL
PRINT '';
PRINT '📋 5. Testing NULL UserID insert...';

-- Kiểm tra có conversation và model nào để test không
DECLARE @TestConversationID BIGINT = (SELECT TOP 1 ConversationID FROM Conversations ORDER BY ConversationID);
DECLARE @TestModelID BIGINT = (SELECT TOP 1 ModelID FROM Models ORDER BY ModelID);

IF @TestConversationID IS NOT NULL AND @TestModelID IS NOT NULL
BEGIN
    BEGIN TRY
        -- Test insert với UserID = NULL (AI participant)
        INSERT INTO Participant (ConversationID, UserID, ModelID)
        VALUES (@TestConversationID, NULL, @TestModelID);
        
        PRINT '✅ Successfully inserted participant with NULL UserID';
        
        -- Xóa record test
        DELETE FROM Participant 
        WHERE ConversationID = @TestConversationID AND UserID IS NULL AND ModelID = @TestModelID;
        
        PRINT '✅ Test record cleaned up';
    END TRY
    BEGIN CATCH
        PRINT '❌ Error testing NULL UserID insert:';
        PRINT ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT '⚠️ No test data available (need Conversations and Models)';
END

PRINT '';
PRINT '🎉 PARTICIPANT TABLE FIX COMPLETED!';
PRINT 'UserID column now allows NULL values for AI model participants';
GO