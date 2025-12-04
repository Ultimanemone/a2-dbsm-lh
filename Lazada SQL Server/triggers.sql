USE Lazada
GO

/************************************************
 1) Trigger: trg_ProductReview_Insert
************************************************/
IF OBJECT_ID('Product.trg_ProductReview_Insert', 'TR') IS NOT NULL
    DROP TRIGGER Product.trg_ProductReview_Insert;
GO

CREATE TRIGGER trg_ProductReview_Insert
ON Product.ProductReview
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        LEFT JOIN Sale.[Order] o ON o.AccountID = i.AccountID
        LEFT JOIN Sale.OrderItem oi ON oi.OrderID = o.OrderID AND oi.ProductID = i.ProductID
        WHERE NOT EXISTS (
            SELECT 1
            FROM Sale.[Order] o2
            JOIN Sale.OrderItem oi2 ON oi2.OrderID = o2.OrderID AND oi2.ProductID = i.ProductID
            WHERE o2.AccountID = i.AccountID AND o2.Status = 'Delivered'
        )
    )
    BEGIN
        RAISERROR('Review not allowed: Customer must have purchased and delivered the product before reviewing.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

/************************************************
 2) Trigger: trg_Order_PreventUpdateAfterFinal
************************************************/
IF OBJECT_ID('Sale.trg_Order_PreventUpdateAfterFinal', 'TR') IS NOT NULL
    DROP TRIGGER Sale.trg_Order_PreventUpdateAfterFinal;
GO

CREATE TRIGGER trg_Order_PreventUpdateAfterFinal
ON Sale.[Order]
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN deleted d ON i.OrderID = d.OrderID
        WHERE d.Status IN ('Delivered','Cancelled') AND (
            ISNULL(i.ShippingAddress,'') <> ISNULL(d.ShippingAddress,'')
            OR ISNULL(i.Note,'') <> ISNULL(d.Note,'')
            OR ISNULL(i.TotalPrice,0) <> ISNULL(d.TotalPrice,0)
            OR ISNULL(i.Status,'') <> ISNULL(d.Status,'')
        )
    )
    BEGIN
        RAISERROR('Cannot modify orders after they are Delivered or Cancelled.',16,1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    UPDATE Sale.[Order]
    SET
        AccountID = i.AccountID,
        CreationDate = i.CreationDate,
        OrderDate = i.OrderDate,
        NoOfShipments = i.NoOfShipments,
        LastUpdateDate = i.LastUpdateDate,
        ShippingAddress = i.ShippingAddress,
        Note = i.Note,
        TotalPrice = i.TotalPrice,
        Status = i.Status
    FROM Sale.[Order] o
    JOIN inserted i ON o.OrderID = i.OrderID;
END;
GO

/************************************************
 3) Procedure: sp_RecalcOrderTotal
************************************************/
IF OBJECT_ID('dbo.sp_RecalcOrderTotal', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RecalcOrderTotal;
GO

CREATE PROCEDURE dbo.sp_RecalcOrderTotal @OrderID INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @sum DECIMAL(18,2) = ISNULL((SELECT SUM(SubTotal) FROM Sale.OrderItem WHERE OrderID = @OrderID), 0);
    UPDATE Sale.[Order] SET TotalPrice = @sum, LastUpdateDate = GETDATE() WHERE OrderID = @OrderID;
END;
GO

/************************************************
 4) Trigger: trg_OrderItem_Insert_Update_Delete
************************************************/
IF OBJECT_ID('Sale.trg_OrderItem_Insert_Update_Delete', 'TR') IS NOT NULL
    DROP TRIGGER Sale.trg_OrderItem_Insert_Update_Delete;
GO

CREATE TRIGGER trg_OrderItem_Insert_Update_Delete
ON Sale.OrderItem
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @oid INT;

    -- For inserted rows
    IF EXISTS (SELECT 1 FROM inserted)
    BEGIN
        SELECT TOP 1 @oid = OrderID FROM inserted;
        EXEC dbo.sp_RecalcOrderTotal @oid;
    END

    -- For deleted rows
    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        SELECT TOP 1 @oid = OrderID FROM deleted;
        EXEC dbo.sp_RecalcOrderTotal @oid;
    END
END;
GO

/************************************************
 5) Trigger: trg_OrderItem_CheckStock
************************************************/
IF OBJECT_ID('Sale.trg_OrderItem_CheckStock', 'TR') IS NOT NULL
    DROP TRIGGER Sale.trg_OrderItem_CheckStock;
GO

CREATE TRIGGER trg_OrderItem_CheckStock
ON Sale.OrderItem
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN Product.Product p ON p.ProductID = i.ProductID
        WHERE i.Quantity > p.Stock
    )
    BEGIN
        RAISERROR('Ordered quantity exceeds available stock.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

/************************************************
 6) Trigger: trg_Order_AfterInsert_ClearCart
************************************************/
IF OBJECT_ID('Sale.trg_Order_AfterInsert_ClearCart', 'TR') IS NOT NULL
    DROP TRIGGER Sale.trg_Order_AfterInsert_ClearCart;
GO

CREATE TRIGGER trg_Order_AfterInsert_ClearCart
ON Sale.[Order]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @acc INT;
    SELECT TOP 1 @acc = AccountID FROM inserted;
    DECLARE @cartid INT = (SELECT CartID FROM App.Cart WHERE AccountID = @acc);
    IF @cartid IS NOT NULL
    BEGIN
        DELETE FROM App.CartItem WHERE CartID = @cartid;
        UPDATE App.Cart SET TotalAmount = 0, TotalPrice = 0, UpdatedAt = GETDATE() WHERE CartID = @cartid;
    END;
END;
GO

/************************************************
 7) Trigger: trg_OrderCoupon_Insert
************************************************/
IF OBJECT_ID('Sale.trg_OrderCoupon_Insert', 'TR') IS NOT NULL
    DROP TRIGGER Sale.trg_OrderCoupon_Insert;
GO

CREATE TRIGGER trg_OrderCoupon_Insert
ON Sale.OrderCoupon
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN App.Coupon c ON c.CouponID = i.CouponID
        JOIN Sale.[Order] o ON o.OrderID = i.OrderID
        WHERE o.OrderDate < c.StartDate OR o.OrderDate > c.EndDate
    )
    BEGIN
        RAISERROR('Coupon not valid for the order date.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

/************************************************
 8) Trigger: TriggerCheckShipperLimit
************************************************/
IF OBJECT_ID('Sale.TriggerCheckShipperLimit', 'TR') IS NOT NULL
    DROP TRIGGER Sale.TriggerCheckShipperLimit;
GO

CREATE OR ALTER TRIGGER TriggerCheckShipperLimit
ON Sale.Shipment
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Logic: ??m s? l??ng ??n hàng ch?a hoàn thành (RealDeliveryTime IS NULL) c?a Shipper
    -- N?u > 10 thì ch?n.
    IF EXISTS (
        SELECT S.ShipperID
        FROM Sale.Shipment S
        JOIN inserted I ON S.ShipperID = I.ShipperID
        WHERE S.RealDeliveryTime IS NULL
        GROUP BY S.ShipperID
        HAVING COUNT(S.ShipmentID) > 10
    )
    BEGIN
        RAISERROR (N'L?i nghi?p v?: Shipper này ?ang giao quá 10 ??n hàng ch?a hoàn thành. Không th? nh?n thêm!', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

/************************************************
 9) Trigger: TriggerPreventPriceShock
************************************************/
IF OBJECT_ID('Product.TriggerPreventPriceShock', 'TR') IS NOT NULL
    DROP TRIGGER Product.TriggerPreventPriceShock;
GO
CREATE OR ALTER TRIGGER TriggerPreventPriceShock
ON Product.Product
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Ch? ch?y khi c?t Price b? thay ??i
    IF UPDATE(Price)
    BEGIN
        -- Logic: (Giá M?i - Giá C?) > (Giá C? * 0.5)
        IF EXISTS (
            SELECT 1
            FROM inserted I
            JOIN deleted D ON I.ProductID = D.ProductID
            WHERE I.Price > D.Price -- Ch? xét t?ng giá
              AND (I.Price - D.Price) > (D.Price * 0.5)
        )
        BEGIN
            RAISERROR (N'L?i nghi?p v?: Không ???c t?ng giá s?n ph?m quá 50%% trong m?t l?n c?p nh?t ?? tránh gây s?c cho khách hàng.', 16, 1);
            ROLLBACK TRANSACTION;
        END
    END
END;
GO

/************************************************
 10) Trigger: calcTotalPriceOfAnCart
************************************************/
IF OBJECT_ID('App.calcTotalPriceOfCart', 'TR') IS NOT NULL
    DROP TRIGGER App.calcTotalPriceOfCart;
GO
CREATE OR ALTER TRIGGER calcTotalPriceOfCart 
ON App.CartItem
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CartID INT;
    
    DECLARE cur CURSOR FOR
        SELECT DISTINCT CartID FROM inserted
        UNION 
        SELECT DISTINCT CartID FROM deleted;

    OPEN cur;
    FETCH NEXT FROM cur INTO @CartID;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @TotalPrice DECIMAL(12,2) = ISNULL(
            (SELECT SUM(SubTotal) FROM App.CartItem WHERE CartID = @CartID), 
            0
        );

        DECLARE @TotalAmount INT = ISNULL(
            (SELECT SUM(Quantity) FROM App.CartItem WHERE CartID = @CartID), 
            0
        );

        EXEC dbo.updateCart @CartID, @TotalPrice, @TotalAmount;

        FETCH NEXT FROM cur INTO @CartID;
    END

    CLOSE cur;
    DEALLOCATE cur;
END;
GO

/************************************************
 11) Trigger: TR_Product_Delete_When_No_Sellers
************************************************/
IF OBJECT_ID('App.TR_Product_Delete_When_No_Sellers', 'TR') IS NOT NULL
    DROP TRIGGER TR_Product_Delete_When_No_Sellers;
GO
CREATE TRIGGER TR_Product_Delete_When_No_Sellers
ON UserData.SellerProduct
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DELETE P
    FROM Product.Product P
    WHERE NOT EXISTS (
        SELECT 1
        FROM UserData.SellerProduct SP
        WHERE SP.ProductID = P.ProductID
    )
    AND P.ProductID IN (SELECT DISTINCT ProductID FROM DELETED);
END;
GO