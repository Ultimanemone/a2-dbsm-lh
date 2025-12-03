USE Lazada
GO

-- insert Account email
create or alter procedure insertAccountEmail
    @accountID int,
    @email nvarchar(255)
as
begin
    insert into UserData.AccountEmail
    values(@accountID, @email);
end
go
-- insert Account phone
create or alter procedure insertAccountPhone
    @accountID int,
    @phone nvarchar(20)
as
begin
    insert into UserData.AccountPhone
    values(@accountID, @phone);
end
go

-- 1. Account
-- 1.1 Insert
CREATE OR ALTER PROCEDURE insertAccount
    @hashPass nvarchar(512),
    @username nvarchar(100),
    @emailMain nvarchar(255),
    @createDate datetime,
    @status nvarchar(20),
    @accountType nvarchar(20),
    @NewAccountID INT OUTPUT
AS
BEGIN
    INSERT INTO [User].Account(Username, EmailMain, HashedPassword, CreatedAt, Status, AccountType)
    VALUES (@username, @emailMain, @hashPass, @createDate, @status, @accountType);
    
    SET @NewAccountID = SCOPE_IDENTITY();
END
GO

-- 1.2 Delete 
CREATE OR ALTER PROCEDURE deleteAccount
    @accID INT
AS
BEGIN
    DELETE FROM [User].Account
    WHERE AccountID = @accID;
END
GO

-- 1.3 Update
CREATE OR ALTER PROCEDURE updateAccount
    @accId int,
    @hashPass nvarchar(512),
    @username nvarchar(100),
    @emailMain nvarchar(255),
    @status nvarchar(20),
    @accountType nvarchar(20)
AS
BEGIN
    UPDATE [User].Account
    SET Username = @username, 
        EmailMain = @emailMain, 
        HashedPassword = @hashPass, 
        Status = @status, 
        AccountType = @accountType
    WHERE AccountID = @accId;
END
GO

-- 2. Customer
-- 2.1 Insert
CREATE OR ALTER PROCEDURE insertCustomer
    @username nvarchar(100),
    @emailMain nvarchar(255),
    @hashPass nvarchar(512),
    @createDate datetime,
    @status nvarchar(20),

    @loyaltyLev nvarchar(20),
    @rewardPoints int,
    
    @NewAccountID INT OUTPUT
AS 
BEGIN
    SET NOCOUNT ON;
    IF (@rewardPoints < 0)
    BEGIN
        ;THROW 50004, 'Reward points must be greater than or equal to 0', 1;
    END

    DECLARE @NewID INT;

    EXEC insertAccount 
        @hashPass = @hashPass, 
        @username = @username, 
        @emailMain = @emailMain, 
        @createDate = @createDate, 
        @status = @status, 
        @accountType = 'Customer',
        @NewAccountID = @NewID OUTPUT;

    INSERT INTO [User].Customer(AccountID, LoyaltyLevel, RewardPoints)
    VALUES (@NewID, @loyaltyLev, @rewardPoints);
    SET @NewAccountID = @NewID;
END
GO

-- 2.2 Delete
CREATE OR ALTER PROCEDURE deleteCustomer
    @cusId int
AS 
BEGIN
    EXEC deleteAccount @accID = @cusId;
END
GO

-- 2.3 Update
CREATE OR ALTER PROCEDURE updateCustomer
    @cusId int,
    @loyaltyLevel nvarchar(20),
    @rewardPoints int
AS 
BEGIN
    IF (@rewardPoints < 0)
    BEGIN
        ;THROW 50004, 'Reward points must be greater than or equal to 0', 1;
    END
    UPDATE [User].Customer
    SET LoyaltyLevel = @loyaltyLevel, RewardPoints = @rewardPoints
    WHERE AccountID = @cusId;
END
GO

-- 3. Seller
-- 3.1 Insert
CREATE OR ALTER PROCEDURE insertSeller
    @username nvarchar(100),
    @emailMain nvarchar(255),
    @hashPass nvarchar(512),
    @createDate datetime,
    @status nvarchar(20),

    @shopName nvarchar(200),
    @taxCode nvarchar(20),
    @busLicenseNo nvarchar(50),
    @shopAddr nvarchar(300),
    @rating decimal(3,2),
    
    @NewAccountID INT OUTPUT
AS 
BEGIN
    IF (@rating < 0.0 OR @rating > 5.0)
    BEGIN
        ;THROW 50003, 'Rating value is out of valid range', 1;
    END

    DECLARE @NewID INT;

    EXEC insertAccount 
        @hashPass, @username, @emailMain, @createDate, @status, 'Seller', 
        @NewAccountID = @NewID OUTPUT;

    INSERT INTO [User].Seller(AccountID, ShopName, TaxCode, BusinessLicenseNumber, ShopAddress, Rating)
    VALUES (@NewID, @shopName, @taxCode, @busLicenseNo, @shopAddr, @rating);
    SET @NewAccountID = @NewID;
END
GO

-- 3.2 Delete
CREATE OR ALTER PROCEDURE deleteSeller
    @sellerID int
AS
BEGIN
    EXEC deleteAccount @accID = @sellerID;
END
GO

-- 3.3 Update
CREATE OR ALTER PROCEDURE updateSeller
    @sellerID int,
    @shopName nvarchar(200),
    @taxCode nvarchar(20),
    @busLicenseNo nvarchar(50),
    @shopAddr nvarchar(300),
    @rating decimal(3,2)
AS
BEGIN
    IF (@rating < 0.0 OR @rating > 5.0)
    BEGIN
        ;THROW 50003, 'Rating value is out of valid range', 1;
    END
    UPDATE [User].Seller
    SET ShopName = @shopName, TaxCode = @taxCode, BusinessLicenseNumber = @busLicenseNo, 
        ShopAddress = @shopAddr, Rating = @rating
    WHERE AccountID = @sellerID;
END
GO

-- 4. Admin
-- 4.1 Insert
CREATE OR ALTER PROCEDURE insertAdmin
    @username nvarchar(100),
    @emailMain nvarchar(255),
    @hashPass nvarchar(512),
    @createDate datetime,
    @status nvarchar(20),

    @Role nvarchar(50),
    @Department nvarchar(100),
    
    @NewAccountID INT OUTPUT
AS 
BEGIN
    DECLARE @NewID INT;

    EXEC insertAccount 
        @hashPass, @username, @emailMain, @createDate, @status, 'Admin', 
        @NewAccountID = @NewID OUTPUT;

    INSERT INTO [User].Admin(AccountID, Role, Department)
    VALUES (@NewID, @Role, @Department);
    SET @NewAccountID = @NewID;
END 
GO

-- 4.2 Update 
CREATE OR ALTER PROCEDURE updateAdmin
    @admId int,
    @role nvarchar(50),
    @department nvarchar(100)
AS
BEGIN
    UPDATE [User].Admin
    SET Role = @role, Department = @department
    WHERE AccountID = @admId;
END
GO

-- 4.3 Delete
CREATE OR ALTER PROCEDURE deleteAdmin
    @admId int
AS
BEGIN
    EXEC deleteAccount @accID = @admId;
END
GO

-- 5. Affiliate
-- 5.1 Insert
CREATE OR ALTER PROCEDURE insertAffiliate
    @username nvarchar(100),
    @emailMain nvarchar(255),
    @hashPass nvarchar(512),
    @createDate datetime,
    @status nvarchar(20),

    @afCode nvarchar(50),
    @commissionRate decimal(5, 2),
    @joinDate datetime,
    @totalEarnings decimal(12, 2),
    
    @NewAccountID INT OUTPUT
AS
BEGIN
    IF (@totalEarnings < 0) 
    BEGIN
        ;THROW 50005, 'Total Earnings must be >= 0', 1;
    END

    IF (@commissionRate < 0 OR @commissionRate > 100) 
    BEGIN
        ;THROW 50006, 'Commission Rate invalid', 1;
    END

    DECLARE @NewID INT;
    EXEC insertAccount 
        @hashPass, @username, @emailMain, @createDate, @status, 'Affiliate', 
        @NewAccountID = @NewID OUTPUT;

    INSERT INTO [User].Affiliate(AccountID, AffiliateCode, CommissionRate, JoinDate, TotalEarnings)
    VALUES(@NewID, @afCode, @commissionRate, @joinDate, @totalEarnings);
    SET @NewAccountID = @NewID;
END
GO

-- 5.2 Update
CREATE OR ALTER PROCEDURE updateAffiliate
    @afId int,
    @afCode nvarchar(50),
    @commissionRate decimal(5, 2),
    @joinDate datetime,
    @totalEarnings decimal(12,2)
AS
BEGIN
    IF (@totalEarnings < 0) 
    BEGIN
        ;THROW 50005, 'Total Earnings must be >= 0', 1;
    END

    IF (@commissionRate < 0 OR @commissionRate > 100) 
    BEGIN
        ;THROW 50006, 'Commission Rate invalid', 1;
    END

    UPDATE [User].Affiliate
    SET AffiliateCode = @afCode, CommissionRate = @commissionRate, JoinDate = @joinDate,
        TotalEarnings = @totalEarnings
    WHERE AccountID = @afId;
END
GO

-- 5.3 Delete
CREATE OR ALTER PROCEDURE deleteAffiliate
    @afId int
AS
BEGIN
    EXEC deleteAccount @accID = @afId;
END
GO