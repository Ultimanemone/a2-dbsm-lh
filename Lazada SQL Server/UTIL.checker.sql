USE Lazada;
GO

EXEC StatisticTopShipper;
GO

SELECT TOP 25 Username, EmailMain FROM [User].Account;