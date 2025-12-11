USE Lazada
GO

-- các proc và func liên quan đến tạo order từ Cart
--1/ trả về tổng của Cart bao gồm coupon khi checkout
CREATE FUNCTION App.calcFinalTotalPrice (
    @CartID INT
)
RETURNS TABLE
AS
RETURN
(
    WITH Items AS (
        SELECT 
            ci.ProductID,
            ci.Quantity,
            p.Price AS UnitPrice,
            pc.CouponID,
            c.Type,
            c.DiscountPercent
        FROM App.CartItem ci
        INNER JOIN Product.Product p 
            ON ci.ProductID = p.ProductID
        LEFT JOIN Sale.ProductCoupon pc 
            ON ci.ProductID = pc.ProductID
        LEFT JOIN App.Coupon c 
            ON pc.CouponID = c.CouponID
               AND c.IsActive = 1
               AND GETDATE() BETWEEN c.StartDate AND c.EndDate
        WHERE ci.CartID = @CartID
    ),

    Calculated AS (
        SELECT 
            ProductID,
            Quantity,
            UnitPrice,

            CASE 
                WHEN [Type] = 'PERCENT' THEN 
                    UnitPrice * (1 - DiscountPercent / 100.0)

                WHEN [Type] = 'FIXED' THEN 
                    CASE 
                        WHEN UnitPrice - DiscountPercent < 0 THEN 0 
                        ELSE UnitPrice - DiscountPercent 
                    END

                ELSE UnitPrice
            END AS FinalPrice
        FROM Items i
    )


    SELECT 
    COALESCE(SUM(Quantity * FinalPrice), 0) AS TotalPrice,
    COALESCE(SUM(Quantity * UnitPrice), 0) AS RawTotalPrice,
    COALESCE(SUM(Quantity * (UnitPrice - FinalPrice)), 0) AS TotalDiscount
    FROM Calculated
);
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
    WHERE o.AccountID = @CustomerID
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
        S.Name AS ShipperName, -- S?a: C?t t�n l� Name
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

-- tạo Order
CREATE PROCEDURE Sale.createOrder
    @CustomerID INT, @CartID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        ---------------------------------------------------------------------
        -- 2) Lấy lại CartItem từ DB + kiểm tra rỗng
        ---------------------------------------------------------------------
        IF NOT EXISTS (SELECT 1 FROM App.CartItem WHERE CartID = @CartID)
        BEGIN
            RAISERROR('Cart is empty!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        ---------------------------------------------------------------------
        -- 3) Kiểm tra stock từng sản phẩm
        ---------------------------------------------------------------------
        IF EXISTS (
            SELECT 1
            FROM App.CartItem ci
            JOIN Product.Product p ON ci.ProductID = p.ProductID
            WHERE ci.CartID = @CartID
              AND ci.Quantity > p.Stock
        )
        BEGIN
            RAISERROR('Some items are out of stock or not enough quantity!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        ---------------------------------------------------------------------
        -- 4) Tính lại total dựa vào function calcFinalTotalPrice
        ---------------------------------------------------------------------
        DECLARE 
            @FinalTotal DECIMAL(12,2),
            @RawTotal   DECIMAL(12,2),
            @Discount   DECIMAL(12,2);

        SELECT 
            @FinalTotal = TotalPrice
        FROM App.calcFinalTotalPrice(@CartID);

        -- tạo temp table để nhận resultset của proc
        CREATE TABLE #NewOrderResult (NewOrderID INT);

        INSERT INTO #NewOrderResult (NewOrderID)
        EXEC insertOrders
            @accID = @CustomerID,
            @creationDate = GETDATE(),
            @orderDate = GETDATE(),
            @noOfShipments = 1,
            @shippingAddr = NULL,
            @note = NULL,
            @totalPrice = @FinalTotal;
        
        DECLARE @OrderID INT;
        SELECT TOP 1 @OrderID = NewOrderID FROM #NewOrderResult;
        DROP TABLE #NewOrderResult;
        IF @OrderID IS NULL
        BEGIN
            ;THROW 54004, 'Failed to create order (no OrderID returned)!', 1;
        END

        -- ;WITH ItemApplied AS (
        --     SELECT
        --         ci.ProductID,
        --         ci.Quantity,
        --         p.Price AS UnitPrice,
        --         c.Type,
        --         c.DiscountPercent,
        --         CASE
        --             WHEN c.Type = 'PERCENT' THEN p.Price * (1 - c.DiscountPercent / 100.0)
        --             WHEN c.Type = 'FIXED' THEN 
        --                 CASE WHEN p.Price - c.DiscountPercent < 0 THEN 0 ELSE p.Price - c.DiscountPercent END
        --             ELSE p.Price
        --         END AS FinalUnitPrice
        --     FROM App.CartItem ci
        --     JOIN Product.Product p ON ci.ProductID = p.ProductID
        --     LEFT JOIN Sale.ProductCoupon pc ON ci.ProductID = pc.ProductID
        --     LEFT JOIN App.Coupon c 
        --         ON pc.CouponID = c.CouponID
        --        AND c.IsActive = 1
        --        AND GETDATE() BETWEEN c.StartDate AND c.EndDate
        --     WHERE ci.CartID = @CartID
        -- )
        ;WITH ItemApplied AS (
            SELECT
                ci.ProductID,
                ci.Quantity,
                p.Price AS UnitPrice
            FROM App.CartItem ci
            JOIN Product.Product p ON ci.ProductID = p.ProductID
            WHERE ci.CartID = @CartID
        )
        SELECT *
        INTO #ItemApplied
        FROM ItemApplied;
        -- DÙNG CURSOR ĐỂ INSERT TỪNG ORDER ITEM
        DECLARE 
            @ProdID INT,
            @Qty INT,
            @Price DECIMAL(12,2);

        DECLARE cur CURSOR FOR
            SELECT ProductID, Quantity, UnitPrice
            FROM #ItemApplied;

        OPEN cur;
        FETCH NEXT FROM cur INTO @ProdID, @Qty, @UnitPrice;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC insertOrderItem @OrderID, @ProdID, @Qty, @UnitPrice;
        END

        CLOSE cur;
        DEALLOCATE cur;
    
    -- update stock của Products
        DECLARE cur CURSOR FOR
        SELECT 
            p.ProductID,
            p.CategoryID,
            p.Name,
            p.Price,
            p.ImageURL,
            p.Status,
            p.Brand,
            (p.Stock - ci.Quantity) AS NewStock
        FROM Product.Product p
        JOIN App.CartItem ci 
            ON p.ProductID = ci.ProductID
        WHERE ci.CartID = @CartID;

        DECLARE 
            @pid INT,
            @cid INT,
            @pname NVARCHAR(300),
            @price DECIMAL(12,2),
            @img NVARCHAR(1000),
            @status NVARCHAR(20),
            @brand NVARCHAR(200),
            @newStock INT;

        OPEN cur;
        FETCH NEXT FROM cur INTO 
            @pid, @cid, @pname, @price, @img, @status, @brand, @newStock;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Gọi procedure updateProduct
            EXEC updateProduct
                @productId = @pid,
                @categoryId = @cid,
                @name = @pname,
                @price = @price,
                @imageUrl = @img,
                @status = @status,
                @stockAmount = @newStock,
                @brand = @brand;

            FETCH NEXT FROM cur INTO 
                @pid, @cid, @pname, @price, @img, @status, @brand, @newStock;
        END

        CLOSE cur;
        DEALLOCATE cur;

        ---------------------------------------------------------------------
        -- 8) Clear CartItem
        ---------------------------------------------------------------------
        EXEC deleteCartItem @CartID;

        ---------------------------------------------------------------------
        -- 9) Update Cart totals về 0
        ---------------------------------------------------------------------
        EXEC updateCart @CartID, 0, 0;

        ---------------------------------------------------------------------
        COMMIT
        ---------------------------------------------------------------------
        COMMIT TRANSACTION;

        SELECT @OrderID AS OrderID, @FinalTotal AS FinalPaidAmount;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0 
            ROLLBACK TRANSACTION;

        DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
    END CATCH
END
