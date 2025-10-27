-- Tạo Database
CREATE DATABASE MomCare;
GO

USE MomCare;
GO

-- Role
CREATE TABLE Role (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(255) NOT NULL,
    RoleDescription NVARCHAR(255),
	IsActive BIT DEFAULT 1,
	IsDelete BIT DEFAULT 0,
);

-- User
CREATE TABLE [User] (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    RoleID INT NOT NULL,
    Username NVARCHAR(255) NOT NULL UNIQUE,
    [Password] NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Phone NVARCHAR(20),
	FullName NVARCHAR(255),
    DateOfBirth DATE,
    Address NVARCHAR(500),
    Avatar NVARCHAR(500),
    IsActive BIT DEFAULT 1,
	IsDelete BIT DEFAULT 0,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);

-- Baby (thông tin bé)
CREATE TABLE Baby (
    BabyID INT IDENTITY(1,1) PRIMARY KEY,
	UserID INT NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    Gender NVARCHAR(10) NOT NULL,
    BirthDate DATE NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (UserID) REFERENCES [User](UserID)
);

-- Journal (theo dõi trạng thái của mẹ để đưa vào AI)
CREATE TABLE Journal (
    JournalID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Symptoms NVARCHAR(500),
    Mood NVARCHAR(500),
    Weight DECIMAL(5,2),
    KickCount INT,
	CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES [User](UserID)
);

-- GrowthLog (theo dõi tăng trưởng của bé)
CREATE TABLE GrowthLog (
    GrowthLogID INT PRIMARY KEY IDENTITY(1,1),
    BabyID INT NOT NULL,
    Height DECIMAL(5,2),
    Weight DECIMAL(5,2),
    HeadCircumference DECIMAL(5,2),
    FOREIGN KEY (BabyID) REFERENCES Baby(BabyID)
);

-- Profile (thông tin thai kỳ)
CREATE TABLE Profile (
    ProfileID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    PregnancyStartDate DATE,
    DueDate DATE,
    CurrentStage NVARCHAR(100),
    FOREIGN KEY (UserID) REFERENCES [User](UserID)
);

-- Category (danh sách thư mục các bài blog)
CREATE TABLE Category (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX),
	[Image] NVARCHAR(500),
    IsActive BIT DEFAULT 1,
	IsDelete BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Content (danh sách các bài viết)
CREATE TABLE Content (
    ContentID INT PRIMARY KEY IDENTITY(1,1),
    CategoryID INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    [Type] NVARCHAR(255),
    [Description] NVARCHAR(MAX),
    IsActive BIT DEFAULT 1,
	IsDelete BIT DEFAULT 0,
	Image NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID)
);

-- Comment (danh sách bình luận)
CREATE TABLE Comment (
    CommentID INT PRIMARY KEY IDENTITY(1,1),
    ContentID INT NOT NULL,
    UserID INT NOT NULL,
    ParentCommentID INT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    IsActive BIT DEFAULT 1,
	IsDelete BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (ContentID) REFERENCES Content(ContentID),
    FOREIGN KEY (UserID) REFERENCES [User](UserID),
    FOREIGN KEY (ParentCommentID) REFERENCES Comment(CommentID)
);

-- CommentReport (danh sách bình luận bị báo cáo)
CREATE TABLE CommentReport (
    ReportID INT PRIMARY KEY IDENTITY(1,1),
    CommentID INT NOT NULL,
    UserID INT NOT NULL,
    Reason NVARCHAR(MAX),
    ReportDate DATETIME DEFAULT GETDATE(),
	Status NVARCHAR(255),
	FOREIGN KEY (UserID) REFERENCES [User](UserID),
    FOREIGN KEY (CommentID) REFERENCES Comment(CommentID)
);

-- FavoriteContent (danh sách bài viết ưa thích)
CREATE TABLE FavoriteContent (
    FavoriteID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    ContentID INT NOT NULL,
	CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES [User](UserID),
    FOREIGN KEY (ContentID) REFERENCES Content(ContentID)
);

-- Question (bảng câu hỏi)
CREATE TABLE [dbo].[Question] (
    [QuestionID] INT IDENTITY(1,1) PRIMARY KEY,
    [UserID] INT NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Content] NVARCHAR(MAX) NOT NULL,
    [Specialty] NVARCHAR(255) NULL,
    [IsClosed] BIT DEFAULT 0,       -- Đóng/mở thảo luận
    [IsActive] BIT DEFAULT 1,
    [IsDelete] BIT DEFAULT 0,
    [CreatedAt] DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Question_User FOREIGN KEY ([UserID]) REFERENCES [dbo].[User]([UserID])
);

-- Answer (bảng câu trả lời)
CREATE TABLE [dbo].[Answer] (
    [AnswerID] INT IDENTITY(1,1) PRIMARY KEY,
    [QuestionID] INT NOT NULL,
    [UserID] INT NOT NULL,
    [Content] NVARCHAR(MAX) NOT NULL,
    [IsAccepted] BIT DEFAULT 0,     -- Câu trả lời hay nhất
    [IsActive] BIT DEFAULT 1,
    [IsDelete] BIT DEFAULT 0,
    [CreatedAt] DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Answer_Question FOREIGN KEY ([QuestionID]) REFERENCES [dbo].[Question]([QuestionID]),
    CONSTRAINT FK_Answer_User FOREIGN KEY ([UserID]) REFERENCES [dbo].[User]([UserID])
);

-- Chat
-- Conversation (danh sách các cuộc trò chuyện)
CREATE TABLE Conversation (
    ConversationID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NULL,
    Type NVARCHAR(20) NOT NULL DEFAULT 'private',  -- private || group
	Image NVARCHAR(500),
	[Description] NVARCHAR(MAX),
    IsActive BIT DEFAULT 1,
	CreatedAt DATETIME DEFAULT GETDATE()
);

-- ConversationMember (danh sách các thành viên trong cuộc trò chuyện)
CREATE TABLE ConversationMember (
    ConversationID INT NOT NULL,
    UserID INT NOT NULL,
    Role NVARCHAR(20) DEFAULT 'member',  -- 'member', 'admin', 'owner'
    JoinedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (ConversationID, UserID),
    FOREIGN KEY (ConversationID) REFERENCES Conversation(ConversationID),
    FOREIGN KEY (UserID) REFERENCES [User](UserID)
);

-- Message (danh sách các đoạn tin nhắn của user trong cuộc trò chuyện)
CREATE TABLE Message (
    MessageID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    ConversationID INT NOT NULL,
    Content NVARCHAR(MAX) NULL,
	[Image] NVARCHAR(500) NULL,
    IsActive BIT DEFAULT 1,
	IsDelete BIT DEFAULT 0,
	CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES [User](UserID),
    FOREIGN KEY (ConversationID) REFERENCES Conversation(ConversationID)
);

-- OTP
CREATE TABLE OTP (
    OtpID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Code NVARCHAR(10) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ExpiredAt DATETIME DEFAULT (DATEADD(MINUTE, 5, GETDATE())),
    IsUsed BIT DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES [User](UserID)
);

-- Tiêm chủng
-- Vaccine (thông tin vắc xin)
CREATE TABLE Vaccine (
    VaccineID INT IDENTITY(1,1) PRIMARY KEY,
    VaccineName NVARCHAR(255) NOT NULL,
	Pathogen NVARCHAR(255),
	Description NVARCHAR(MAX),
	Benefit NVARCHAR(MAX),
    Contraindication NVARCHAR(MAX),
	IsDelete BIT DEFAULT 0,
);

-- VaccineSchedule (lịch tiêm chuẩn theo tuần thai và tháng tuổi)
CREATE TABLE VaccineSchedule (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    VaccineID INT NOT NULL,
	TargetGroup NVARCHAR(20), -- Mom, Baby
	AgeInWeeks INT NULL,       -- tuần thai (cho mẹ)
    AgeInMonths INT NULL,      -- tháng tuổi (cho bé)
	TotalDose INT DEFAULT 1,
    DoseNumber INT,				  -- mũi thứ mấy trong loạt tiêm của cùng loại vaccine
    SuggestedDateDays INT,        -- số ngày sau sinh được đề xuất tiêm mũi đó
	IsDelete BIT DEFAULT 0,
    FOREIGN KEY (VaccineID) REFERENCES Vaccine(VaccineID)
);

-- VaccinationRecord (ghi nhận lịch tiêm từ lúc mang thai đến khi 2 tuổi)
CREATE TABLE VaccinationRecord (
    RecordID INT IDENTITY(1,1) PRIMARY KEY,
    ScheduleID INT NOT NULL,
	BabyID INT, -- đã sinh ra
	UserID INT, -- lúc mang thai
    Status NVARCHAR(50),
    InjectedDate DATE NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (BabyID) REFERENCES Baby(BabyID),
	FOREIGN KEY (UserID) REFERENCES [User](UserID),
    FOREIGN KEY (ScheduleID) REFERENCES VaccineSchedule(ScheduleID)
);

-- Data Fake

-- Role
INSERT INTO Role (RoleName, RoleDescription)
VALUES 
(N'Mom', N'Người dùng là mẹ bầu'),
(N'Expert', N'Chuyên gia tư vấn'),
(N'Admin', N'Quản trị hệ thống');

-- User
INSERT INTO [User] (RoleID, Username, [Password], Email, Phone, DateOfBirth, Address, Avatar)
VALUES
(1, N'mom01', N'hashed_pass_mom01', N'mom01@gmail.com', N'0901111111', '1995-05-10', N'Hà Nội', N'/images/mom01.png'),
(1, N'mom02', N'hashed_pass_mom02', N'mom02@gmail.com', N'0902222222', '1997-07-15', N'Hồ Chí Minh', N'/images/mom02.png'),
(2, N'expert01', N'hashed_pass_expert01', N'expert01@gmail.com', N'0911111111', '1985-03-20', N'Đà Nẵng', N'/images/expert01.png'),
(3, N'admin01', N'hashed_pass_admin01', N'admin01@gmail.com', N'0999999999', '1990-01-01', N'Hà Nội', N'/images/admin01.png');

-- Baby
INSERT INTO Baby (UserID, FullName, Gender, BirthDate)
VALUES
(1, N'Nguyễn Gia Bảo', N'Nam', '2022-03-15'),
(1, N'Nguyễn Thảo Nhi', N'Nữ', '2020-08-22'),
(2, N'Trần Đức Anh', N'Nam', '2021-11-05'),
(3, N'Lê Ngọc Hà', N'Nữ', '2023-01-10'),
(3, N'Lê Bảo Long', N'Nam', '2024-05-18');

-- Journal
INSERT INTO Journal (UserID, Symptoms, Mood, Weight, KickCount)
VALUES
(2, N'Đau lưng nhẹ', N'Vui vẻ', 57.5, 12),
(2, N'Khó ngủ', N'Mệt mỏi', 58.2, 8);

-- GrowthLog
INSERT INTO GrowthLog (BabyID, Height, Weight, HeadCircumference)
VALUES
(1, 50.0, 3.2, 34.0),
(2, 48.0, 3.0, 33.5);

-- Profile
INSERT INTO Profile (UserID, PregnancyStartDate, DueDate, CurrentStage)
VALUES
(2, '2024-09-01', '2025-06-01', N'Tháng thứ 2');

-- Category
INSERT INTO Category (Title, [Description], [Image])
VALUES
(N'Sự phát triển của trẻ', N'Đây là nơi cung cấp các kiến thức chăm sóc cho sự phát triển của trẻ từ giai đoạn sơ sinh đến tuổi dậy thì, từ sức khỏe thế chất đến tinh thần, đảm bảo con lớn lên khỏe mạnh, toàn diện.', N'https://cdn.marrybaby.vn/wp-content/uploads/2021/10/15/su-phat-trien-cua-tre@3x.png'),
(N'Chuẩn bị mang thai', N'Chuyên mục dành cho các cặp đôi chuẩn bị mang thai và mong muốn làm cha mẹ. Nơi đây cung cấp đầy đủ các thông tin, kiến thức cần thiết cho bạn như: Dinh dưỡng - sức khỏe hỗ trợ thụ thai, quá trình thụ thai và chứng hiếm muộn, vô sinh.', N'https://cdn.marrybaby.vn/wp-content/uploads/2021/10/15/chuan-bi-mang-thai@3x-1.png'),
(N'Mang thai', N'Bên cạnh cảm giác hạnh phúc khi biết mình mang thai, mẹ ắt hẳn còn rất nhiều bỡ ngỡ. Đừng lo! Chuyên mục này như một cẩm nang thu nhỏ để hành trình của mẹ cùng bé yêu nhẹ tênh trông thấy.', N'https://cdn.marrybaby.vn/wp-content/uploads/2021/10/15/Thai-ky@3x.png'),
(N'Sau khi sinh', N'Sau khi sinh, cơ thể yếu ớt của mẹ còn trải qua nhiều trở ngại khác về sức khỏe. Chăm sóc mẹ như thế nào để đẩy nhanh quá trình hồi phục và đủ sữa cho bé bú sẽ được giải đáp tại đây.', N'https://cdn.marrybaby.vn/wp-content/uploads/2021/10/15/Sau-Sinh@3x-1.png'),
(N'Gia đình', N'Chuyên mục gia đình cung cấp bí quyết xây dựng tổ ấm dài lâu dành cho bạn. Hãy tham khảo những nội dung hữu ích giúp củng cố "điểm neo" cho con thuyền hạnh phúc của gia đình mình!', N'https://cdn.marrybaby.vn/wp-content/uploads/2021/10/15/gia-dinh@3x.png'),
(N'Nuôi dạy con', N'Nuôi dạy con chưa bao giờ là một việc dễ dàng. Ngược lại, nó đòi hỏi kiến thức, kỹ năng và cách vận dụng thông minh từ các bậc phụ huynh. Với chuyên mục này, các thông tin được xây dựng nhằm trở thành một bách khoa toàn thư cung cấp kiến thức cần thiết cho quá trình chăm sóc và nuôi dạy con cái. Tất cả nhằm giúp cha mẹ hiểu rõ về nét tính cách, tư duy, suy nghĩ của con và từ đó áp dụng cho con phương pháp giáo dục, nuôi nấng phù hợp.', N'https://cdn.marrybaby.vn/wp-content/uploads/2021/10/15/nuoi-day-con@3x.png');

-- Content
INSERT INTO Content (CategoryID, Title, [Type], [Description])
VALUES
(1, N'Thực đơn cho mẹ bầu tháng thứ 3', N'Article', N'Bài viết về thực đơn giàu dinh dưỡng cho mẹ bầu'),
(2, N'Các dấu hiệu cần đi khám ngay', N'Article', N'Bài viết hướng dẫn khi nào mẹ bầu cần đi khám');

-- Comment
INSERT INTO Comment (ContentID, UserID, Content)
VALUES
(1, 1, N'Bài viết rất hữu ích, cảm ơn!'),
(1, 3, N'Nên bổ sung thêm phần vitamin tổng hợp'),
(2, 2, N'Mình thấy bài viết rất đúng với thực tế');

-- CommentReport
INSERT INTO CommentReport (CommentID, UserID, Reason, Status)
VALUES
(2, 2, N'Nội dung không phù hợp', N'Đang xem xét');

-- FavoriteContent
INSERT INTO FavoriteContent (UserID, ContentID)
VALUES
(1, 1),
(2, 2);

-- Thêm các nhóm chat
INSERT INTO Conversation (Name, Type, Image, [Description])
VALUES
(N'Chuẩn bị mang thai', 'group', 'https://cdn-together.hellohealthgroup.com/2024/10/1729480091_6715c59be23826.55274785', N'Nhóm hỗ trợ các cặp vợ chồng trong giai đoạn chuẩn bị mang thai, chia sẻ kinh nghiệm dinh dưỡng, luyện tập và tâm lý.'),
(N'Mẹ bầu', 'group', 'https://cdn-together.hellohealthgroup.com/2024/08/1725005246_66d17dbea64a19.62644683', N'Nhóm dành cho các bà bầu để chia sẻ trải nghiệm, hỏi đáp về sức khỏe thai kỳ, dinh dưỡng và các mốc quan trọng.'),
(N'Chăm sóc mẹ sau sinh', 'group', 'https://cdn-together.hellohealthgroup.com/2024/08/1723797418_66bf0faa508073.25492377', N'Nhóm dành cho các bậc cha mẹ có trẻ sơ sinh, chia sẻ kinh nghiệm nuôi dưỡng, chăm sóc, và phát triển sớm cho bé.'),
(N'Bé sơ sinh', 'group', 'https://cdn-together.hellohealthgroup.com/2024/08/1723798789_66bf1505c66e54.32643153', N'Nhóm dành cho các bậc cha mẹ có trẻ sơ sinh, chia sẻ kinh nghiệm nuôi dưỡng, chăm sóc, và phát triển sớm cho bé.'),
(N'Gia đình', 'group', 'https://cdn-together.hellohealthgroup.com/2024/11/1732700158_6746e7fe564c15.19245289', N'Nhóm dành cho tất cả thành viên gia đình để giao lưu, kết nối, chia sẻ hoạt động và kỷ niệm gia đình.');

-- Vaccine
INSERT INTO Vaccine (VaccineName, Pathogen, Description, Benefit, Contraindication)
VALUES
(N'BCG', N'Mycobacterium tuberculosis', 
 N'Vắc xin phòng bệnh lao, thường tiêm trong tháng đầu sau sinh.', 
 N'Giúp trẻ sơ sinh phòng ngừa bệnh lao.', 
 N'Trẻ sinh non, đang sốt cao hoặc bị bệnh nhiễm trùng nặng.'),
 
(N'Viêm gan B', N'Hepatitis B virus',
 N'Phòng bệnh viêm gan B lây qua máu, mẹ truyền sang con.', 
 N'Bảo vệ gan, giảm nguy cơ xơ gan và ung thư gan.', 
 N'Tạm hoãn khi trẻ đang sốt hoặc cân nặng < 2kg.'),
 
(N'Bạch hầu - Ho gà - Uốn ván (DPT)', N'Corynebacterium diphtheriae, Bordetella pertussis, Clostridium tetani',
 N'Vắc xin 3 trong 1 giúp phòng 3 bệnh truyền nhiễm nguy hiểm cho trẻ.', 
 N'Giảm tỷ lệ mắc và tử vong do 3 bệnh này.', 
 N'Chống chỉ định với trẻ có tiền sử phản ứng nặng sau mũi trước.'),
 
(N'Bại liệt (OPV)', N'Poliovirus', 
 N'Vắc xin uống phòng bệnh bại liệt do virus.', 
 N'Ngăn ngừa liệt cơ vĩnh viễn do virus bại liệt gây ra.', 
 N'Trẻ đang bị tiêu chảy nặng.'),
 
(N'MMR (Sởi - Quai bị - Rubella)', N'Measles, Mumps, Rubella viruses',
 N'Vắc xin phối hợp 3 bệnh, tiêm từ 12 tháng tuổi.', 
 N'Phòng tránh biến chứng viêm phổi, viêm não, sảy thai.', 
 N'Không tiêm cho phụ nữ mang thai hoặc đang bị suy giảm miễn dịch.');


 -- BCG: tiêm 1 mũi trong tháng đầu
INSERT INTO VaccineSchedule (VaccineID, TargetGroup, AgeInMonths, TotalDose, DoseNumber, SuggestedDateDays)
VALUES (1, N'Baby', 0, 1, 1, 0);

-- Viêm gan B: 3 mũi (sơ sinh, 2 tháng, 4 tháng)
INSERT INTO VaccineSchedule (VaccineID, TargetGroup, AgeInMonths, TotalDose, DoseNumber, SuggestedDateDays)
VALUES 
(2, N'Baby', 0, 3, 1, 0),
(2, N'Baby', 2, 3, 2, 60),
(2, N'Baby', 4, 3, 3, 120);

-- DPT: 3 mũi cơ bản + 1 nhắc lại
INSERT INTO VaccineSchedule (VaccineID, TargetGroup, AgeInMonths, TotalDose, DoseNumber, SuggestedDateDays)
VALUES
(3, N'Baby', 2, 4, 1, 60),
(3, N'Baby', 3, 4, 2, 90),
(3, N'Baby', 4, 4, 3, 120),
(3, N'Baby', 18, 4, 4, 540);

-- Bại liệt: 3 mũi (2, 3, 4 tháng)
INSERT INTO VaccineSchedule (VaccineID, TargetGroup, AgeInMonths, TotalDose, DoseNumber, SuggestedDateDays)
VALUES
(4, N'Baby', 2, 3, 1, 60),
(4, N'Baby', 3, 3, 2, 90),
(4, N'Baby', 4, 3, 3, 120);

-- MMR: 1 mũi lúc 12 tháng, 1 mũi nhắc lúc 18 tháng
INSERT INTO VaccineSchedule (VaccineID, TargetGroup, AgeInMonths, TotalDose, DoseNumber, SuggestedDateDays)
VALUES
(5, N'Baby', 12, 2, 1, 360),
(5, N'Baby', 18, 2, 2, 540);


INSERT INTO VaccinationRecord (ScheduleID, BabyID, UserID, Status, InjectedDate)
VALUES
(1, 1, 2, N'Completed', '2025-02-01'),  -- BCG
(2, 1, 2, N'Completed', '2025-02-02'),  -- Viêm gan B mũi 1
(3, 1, 2, N'Completed', '2025-04-10'),  -- Viêm gan B mũi 2
(4, 1, 2, N'Pending', NULL),            -- Viêm gan B mũi 3
(5, 1, 2, N'Completed', '2025-04-15'),  -- DPT mũi 1
(6, 1, 2, N'Completed', '2025-05-15'),  -- DPT mũi 2
(7, 1, 2, N'Pending', NULL),            -- DPT mũi 3
(11, 1, 2, N'Pending', NULL);           -- MMR mũi 1 (chưa đến tuổi)
