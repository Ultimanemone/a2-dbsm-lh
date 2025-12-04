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

CREATE OR ALTER PROCEDURE StatisticTopShipper
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP 10
        S.ShipperID,
        S.Name AS ShipperName, -- S?a: C?t tên là Name
        S.Phone,
        COUNT(Sh.ShipmentID) AS SuccessfulDeliveries
    FROM 
        Sale.Shipper S 
    JOIN 
        Sale.Shipment Sh ON S.ShipperID = Sh.ShipperID
    WHERE 
        -- ?ã giao và giao ?úng h?n (ho?c s?m h?n)
        Sh.RealDeliveryTime IS NOT NULL 
    GROUP BY 
        S.ShipperID, S.Name, S.Phone
    ORDER BY 
        SuccessfulDeliveries DESC;
END;
GO

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