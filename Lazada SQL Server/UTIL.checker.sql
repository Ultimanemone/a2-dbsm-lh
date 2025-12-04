USE Lazada;
GO

DECLARE @newID INT;
DECLARE @createDate1 datetime = GETDATE();

EXEC insertSeller
    @username = 'test',
    @emailMain = 'x@y.com',
    @hashPass = 'abc',
    @createDate = @createDate1,
    @status = 'Active',
    @shopName = 'Test Shop',
    @taxCode = '1231231231',
    @busLicenseNo = 'BL999',
    @shopAddr = '123 Road',
    @rating = 4.5,
    @NewAccountID = @newID OUTPUT;

SELECT @newID;
GO

SELECT SPECIFIC_NAME, ROUTINE_SCHEMA, ROUTINE_TYPE
FROM INFORMATION_SCHEMA.ROUTINES
WHERE SPECIFIC_NAME = 'insertSeller';
GO

SELECT TOP 25 Username, EmailMain FROM [User].Account;