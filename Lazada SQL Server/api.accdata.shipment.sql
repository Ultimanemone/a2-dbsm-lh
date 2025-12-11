USE Lazada
GO

-- 1. Payment method - Cash - Bank Account
-- 1.1 Payment Method (DELETE)
CREATE OR ALTER PROCEDURE deletePaymentMethod
    @PMID INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM App.PaymentMethod WHERE Pmid = @PMID)
    BEGIN
        RAISERROR(N'Error: PaymentMethod %d does not exist', 16, 1, @PMID);
        RETURN;
    END
    DELETE FROM App.PaymentMethod WHERE Pmid = @PMID;
END;
GO

-- 1.2 Cash (INSERT, UPDATE, DELETE) 
-- 1.2.1 Insert
CREATE OR ALTER PROCEDURE insertCash
    @Method NVARCHAR(50),
    @ActualReceivedMoney DECIMAL(12,2),
    @MoneyBack DECIMAL(12,2),
    @ShipperID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @ActualReceivedMoney < 0 OR @MoneyBack < 0
    BEGIN
        RAISERROR(N'Error: Money cannot be negative', 16, 1);
        RETURN;
    END

    IF @ShipperID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Sale.Shipper WHERE ShipperID = @ShipperID)
    BEGIN
        RAISERROR(N'Error: Shipper ID %d does not exist.', 16, 1, @ShipperID);
        RETURN;
    END

    INSERT INTO App.PaymentMethod (Method) VALUES (@Method);
    DECLARE @NewPMID INT = SCOPE_IDENTITY();

    INSERT INTO AppPayment.Cash (CashPmid, ActualReceivedMoney, MoneyBack, ShipperID) 
    VALUES (@NewPMID, @ActualReceivedMoney, @MoneyBack, @ShipperID);
END;
GO

-- 1.2.2 Update
CREATE OR ALTER PROCEDURE updateCash
    @PMID INT,
    @Method NVARCHAR(50),
    @ActualReceivedMoney DECIMAL(12,2),
    @MoneyBack DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM AppPayment.Cash WHERE CashPmid = @PMID)
    BEGIN
        RAISERROR(N'Error: Cannot find cash info with ID %d', 16, 1, @PMID);
        RETURN;
    END

    IF @ActualReceivedMoney < 0 OR @MoneyBack < 0
    BEGIN
        RAISERROR(N'Error: Money cannot be negative', 16, 1);
        RETURN;
    END

    UPDATE App.PaymentMethod 
    SET Method = @Method 
    WHERE Pmid = @PMID;

    UPDATE AppPayment.Cash
    SET ActualReceivedMoney = @ActualReceivedMoney, MoneyBack = @MoneyBack
    WHERE CashPmid = @PMID;
END;
GO

-- 1.2.3 Delete
CREATE OR ALTER PROCEDURE deleteCash
    @PMID INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM AppPayment.Cash WHERE CashPmid = @PMID)
    BEGIN
        EXEC deletePaymentMethod @PMID = @PMID;
    END
    ELSE
    BEGIN
        RAISERROR(N'Error: Cannot find cash data to delete', 16, 1);
    END
END;
GO

-- 1.3 Bank Account
-- 1.3.1 Insert
CREATE OR ALTER PROCEDURE insertBankAccount
    @Method NVARCHAR(50),
    @AccountID INT,
    @BankName NVARCHAR(200),
    @CardType NVARCHAR(50),
    @CardNumber NVARCHAR(50),
    @ExpirationDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    IF LEN(ISNULL(@BankName, '')) = 0
    BEGIN
        RAISERROR(N'Error: Bank Name is empty.', 16, 1);
        RETURN;
    END

    INSERT INTO App.PaymentMethod (Method) VALUES (@Method);    
    DECLARE @NewPMID INT = SCOPE_IDENTITY();

    INSERT INTO AppPayment.BankAccount (BankPmid, OwnerAccountID, BankName, CardType, CardNumber, ExpirationDate) 
    VALUES (@NewPMID, @AccountID, @BankName, @CardType, @CardNumber, @ExpirationDate);
END;
GO

-- 1.3.2 Update
CREATE OR ALTER PROCEDURE updateBankAccount
    @PMID INT,
    @Method NVARCHAR(50),
    @BankName NVARCHAR(200),
    @CardType NVARCHAR(50),
    @CardNumber NVARCHAR(50),
    @ExpirationDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM AppPayment.BankAccount WHERE BankPmid = @PMID)
    BEGIN
        RAISERROR(N'Error: BankAccount ID %d not found.', 16, 1, @PMID);
        RETURN;
    END

    UPDATE App.PaymentMethod
    SET Method = @Method 
    WHERE Pmid = @PMID;

    UPDATE AppPayment.BankAccount
    SET BankName = @BankName, 
        CardType = @CardType,
        CardNumber = @CardNumber,
        ExpirationDate = @ExpirationDate
    WHERE BankPmid = @PMID;
END;
GO

-- 1.3.3 Delete
CREATE OR ALTER PROCEDURE deleteBankAccount
    @PMID INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM AppPayment.BankAccount WHERE BankPmid = @PMID)
    BEGIN
        EXEC deletePaymentMethod @PMID = @PMID;
    END
    ELSE
    BEGIN
        RAISERROR(N'Error: Data not found to delete.', 16, 1);
    END
END;
GO
