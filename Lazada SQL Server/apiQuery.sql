USE Lazada
GO

CREATE OR ALTER PROCEDURE showOrdersWithDetail
    @customerID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        o.OrderID, --
        o.Status,
        o.OrderDate,
        p.Name AS ProductName, --
        oi.Quantity,
        oi.SubTotal, --
        s.SellerAccountID, --
        s.ShipperID, --
        s.RealDeliveryTime
    FROM Sale.[Order] o
    INNER JOIN Sale.OrderItem oi ON o.OrderID = oi.OrderID
    INNER JOIN Product.Product p ON oi.ProductID = p.ProductID
    LEFT JOIN Sale.Shipment s ON o.OrderID = s.OrderID
    WHERE o.AccountID = @customerID
    ORDER BY o.OrderDate DESC;
END;
GO

--------------------------------------------------------
CREATE OR ALTER PROCEDURE StatisticTopShipper
    @ShipperID INT = NULL,
    @ShipperName NVARCHAR(100) = NULL,
    @Phone NVARCHAR(50) = NULL,
    @SuccessfulDeliveries INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 10
        S.ShipperID,
        S.Name AS ShipperName,
        S.Phone,
        COUNT(Sh.ShipmentID) AS SuccessfulDeliveries
    FROM 
        Sale.Shipper S 
    JOIN 
        Sale.Shipment Sh ON S.ShipperID = Sh.ShipperID
    WHERE 
        Sh.RealDeliveryTime IS NOT NULL
        AND (@ShipperID IS NULL OR S.ShipperID = @ShipperID)
        AND (@ShipperName IS NULL OR S.Name LIKE '%' + @ShipperName + '%')
        AND (@Phone IS NULL OR S.Phone LIKE '%' + @Phone + '%')
    GROUP BY 
        S.ShipperID, S.Name, S.Phone
    HAVING
        @SuccessfulDeliveries IS NULL OR COUNT(Sh.ShipmentID) = @SuccessfulDeliveries
    ORDER BY 
        SuccessfulDeliveries DESC;
END;
GO

CREATE OR ALTER PROCEDURE topShipperDelete
    @ShipperID INT
AS
BEGIN
    SET NOCOUNT ON;
    IF @ShipperID IS NULL
        THROW 50004, 'Invalid ShipperID', 1;
    IF NOT EXISTS (SELECT * FROM Sale.Shipper WHERE ShipperID = @ShipperID)
        THROW 50004, 'Shipper does not exist!', 1;
    DELETE FROM Sale.Shipper WHERE ShipperID = @ShipperID
END
GO

CREATE OR ALTER PROCEDURE topShipperUpdate
    @ShipperID INT,
    @ShipperName NVARCHAR(100) = NULL,
    @Phone NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT * FROM Sale.Shipper WHERE ShipperID = @ShipperID)
        THROW 50004, 'Shipper does not exist!', 1; -- this shouldnt happen, but just in case
    IF @ShipperName IS NOT NULL
        UPDATE Sale.Shipper SET Name = @ShipperName WHERE ShipperID = @ShipperID
    IF @Phone IS NOT NULL
        UPDATE Sale.Shipper SET Phone = @Phone WHERE ShipperID = @ShipperID
END
GO

--------------------------------------------------------

CREATE OR ALTER PROCEDURE CustomerLifetimeValue
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT
        A.AccountID,
        A.Username,
        A.EmailMain AS Email,
        C.LoyaltyLevel,
        SUM(O.TotalPrice) AS TotalSpent
    FROM
        [User].Account A 
        JOIN [User].Customer C ON A.AccountID = C.AccountID
        JOIN Sale.[Order] O ON A.AccountID = O.AccountID
    WHERE
        O.Status = 'Delivered'
    GROUP BY 
        A.AccountID, A.Username, A.EmailMain, C.LoyaltyLevel
    ORDER BY 
        TotalSpent DESC;
END;
GO