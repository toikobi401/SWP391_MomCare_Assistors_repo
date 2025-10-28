-- ===============================================
-- INSERT_SAMPLE_MODELS.sql - Thêm dữ liệu mẫu cho bảng Models
-- ===============================================

USE [MomCare]
GO

-- Kiểm tra và tạo bảng Models nếu chưa có (từ ChatBotV2.sql)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Models' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[Models](
        [ModelID] [bigint] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](50) NOT NULL,
        [Api_Key] [nvarchar](150) NOT NULL,
        [description] [nvarchar](255) NULL,
    CONSTRAINT [PK_Models] PRIMARY KEY CLUSTERED 
    (
        [ModelID] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    
    PRINT '✅ Đã tạo bảng Models'
END
ELSE
BEGIN
    PRINT 'ℹ️ Bảng Models đã tồn tại'
END
GO

-- Xóa dữ liệu cũ nếu có
DELETE FROM [Models];
PRINT '🗑️ Đã xóa dữ liệu cũ trong bảng Models';
GO

-- Thêm dữ liệu mẫu
INSERT INTO [Models] ([Name], [Api_Key], [description]) VALUES
(N'Gemini_2.5_1', N'AIzaSyAHQVeBfhUNJEoVFi9Rx-5sfaYZ_lZ8LxA', N'a model to response in direct chat to direct chat'),
(N'Gemini_2.5_2', N'AIzaSyBaawGhWsfTmyeMxCrbB4Q8YM98DNFPDSk', N'a model to reponse in float chatbot');

PRINT '✅ Đã thêm 2 AI models mẫu:';
PRINT '   - Gemini_2.5_1: Cho direct chat';
PRINT '   - Gemini_2.5_2: Cho float chatbot';
GO

-- Hiển thị kết quả
SELECT 
    ModelID,
    Name,
    LEFT(Api_Key, 20) + '...' AS Api_Key_Preview,
    description
FROM [Models]
ORDER BY ModelID;

PRINT '';
PRINT '📋 Danh sách AI Models đã được tạo thành công!';
PRINT '🔗 Có thể test qua API: GET /api/models/';
GO