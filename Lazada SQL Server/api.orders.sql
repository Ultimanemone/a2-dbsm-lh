USE Lazada
GO

-- 1. Order
-- 1.1 Insert
CREATE OR ALTER PROCEDURE insertOrders
    @accID int,
    @creationDate datetime,
    @orderDate datetime,
    @noOfShipments int,
    @shippingAddr nvarchar(500),
    @note nvarchar(1000),
    @totalPrice decimal(12,2)
AS
BEGIN
    IF (@noOfShipments < 0)
    BEGIN
        ;THROW 50007, 'Number of shipments must be greater than or equal to 0', 1;
    END
    IF (@totalPrice < 0)
    BEGIN
        ;THROW 50008, 'Total Price must be greater or equal to 0', 1;
    END

    INSERT INTO Sale.[Order] 
        (AccountID, CreationDate, OrderDate, NoOfShipments, LastUpdateDate, ShippingAddress, Note, TotalPrice, Status)
    VALUES 
        (@accID, @creationDate, @orderDate, @noOfShipments, GETDATE(), @shippingAddr, @note, @totalPrice, 'Pending');
END
GO

-- 1.2 Update
CREATE OR ALTER PROCEDURE updateOrders
    @orderId int,
    @creationDate datetime,
    @orderDate datetime,
    @noOfShipments int,
    @shippingAddr nvarchar(500),
    @note nvarchar(1000),
    @totalPrice decimal(12,2),
    @status nvarchar(30)
AS
BEGIN
    IF (@noOfShipments < 0)
    BEGIN
        ;THROW 50007, 'Number of shipments must be greater than or equal to 0', 1;
    END
    IF (@totalPrice < 0)
    BEGIN
        ;THROW 50008, 'Total Price must be greater or equal to 0', 1;
    END

    UPDATE Sale.[Order]
    SET 
        CreationDate = @creationDate, 
        OrderDate = @orderDate, 
        NoOfShipments = @noOfShipments, 
        LastUpdateDate = GETDATE(), 
        ShippingAddress = @shippingAddr, 
        Note = @note, 
        TotalPrice = @totalPrice,
        Status = @status
    WHERE OrderID = @orderId;
END
GO

-- 1.3 Delete
CREATE OR ALTER PROCEDURE deleteOrders
    @orderId int
AS
BEGIN
    DELETE FROM Sale.[Order] 
    WHERE OrderID = @orderId;
END
GO

-- 2. OrderHistory
-- 2.1 Insert
CREATE OR ALTER PROCEDURE insertOrderHistory
    @orderId int,
    @completionDate datetime,
    @orderStatus nvarchar(30)
AS
BEGIN
    INSERT INTO UserData.OrderHistory(OrderID, CompletionDate, OrderStatus)
    VALUES(@orderId, @completionDate, @orderStatus);
END
GO

-- 2.2 Update
CREATE OR ALTER PROCEDURE updateOrderHistory
    @orderHistoryId int,
    @orderId int,
    @completionDate datetime,
    @orderStatus nvarchar(30)
AS
BEGIN
    UPDATE UserData.OrderHistory
    SET CompletionDate = @completionDate, OrderStatus = @orderStatus
    WHERE OrderHistoryID = @orderHistoryId;
END
GO

-- 2.3 Delete
CREATE OR ALTER PROCEDURE deleteOrderHistory
    @orderHistoryId int
AS
BEGIN
    DELETE FROM UserData.OrderHistory
    WHERE OrderHistoryID = @orderHistoryId;
END
GO

-- 3. OrderItem
-- 3.1 Insert
CREATE OR ALTER PROCEDURE insertOrderItem
    @orderId int,
    @prodId int,
    @quantity int,
    @subTotal decimal(12,2)
AS
BEGIN
    IF (@quantity <= 0)
    BEGIN
        ;THROW 50009, 'Quantity of an order item must be greater than 0', 1;
    END

    INSERT INTO Sale.OrderItem (OrderID, ProductID, Quantity, SubTotal)
    VALUES(@orderId, @prodId, @quantity, @subTotal);
END
GO

-- 4. Cart
-- 4.1 Insert Cart
CREATE OR ALTER PROCEDURE App.createCart
    @AccountID INT -- Đã bỏ dấu phẩy thừa ở đây
AS
BEGIN
    IF EXISTS (SELECT 1 FROM App.Cart WHERE AccountID = @AccountID)
    BEGIN
        THROW 51000, 'User already has a cart.', 1;
    END

    INSERT INTO App.Cart (AccountID, TotalPrice, TotalAmount)
    VALUES (@AccountID, 0, 0);
END
GO

-- 4.2 Update Cart
CREATE OR ALTER PROCEDURE updateCart
    @cartID int,
    @totalPrice decimal(12,2),
    @totalAmount int
AS
BEGIN
    IF (@totalPrice < 0)
    BEGIN
        ;THROW 50008, 'Total Price must be greater than or equal to 0', 1;
    END
    IF (@totalAmount < 0)
    BEGIN
        ;THROW 50010, 'Total Amount must be greater than or equal to 0', 1;
    END
    IF (@totalAmount = 0 AND @totalPrice > 0)
    BEGIN
        ;THROW 50011, 'Total Amount must be greater than 0 if Price > 0', 1;
    END

    UPDATE App.Cart
    SET TotalPrice = @totalPrice, 
        TotalAmount = @totalAmount,
        UpdatedAt = GETDATE()
    WHERE CartID = @cartID;
END
GO