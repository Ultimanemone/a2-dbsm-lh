GO
CREATE OR ALTER FUNCTION dbo.fn_TotalSavingsByCustomer
(
    @CustomerID INT
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @TotalSavings DECIMAL(18,2) = 0;

    ----------------------------------------------------------
    -- 1. Validate: Customer tồn tại?
    ----------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 
        FROM [User].Account 
        WHERE AccountID = @CustomerID 
          AND AccountType = 'Customer'
    )
        RETURN 0;

    ----------------------------------------------------------
    -- 2. Lặp qua tất cả đơn hàng của customer
    ----------------------------------------------------------
    DECLARE @OrderID INT;

    DECLARE curOrder CURSOR FOR
        SELECT OrderID
        FROM Sale.[Order]
        WHERE AccountID = @CustomerID
          AND Status IN ('Delivered','Confirmed','Shipped');

    OPEN curOrder;
    FETCH NEXT FROM curOrder INTO @OrderID;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        ------------------------------------------------------
        -- 3. Tính tiền tiết kiệm từ Order-level Coupon
        ------------------------------------------------------
        DECLARE @OrderCouponID INT;
        DECLARE @OrderDiscountPercent DECIMAL(5,2);
        DECLARE @OrderOriginalPrice DECIMAL(18,2);
        DECLARE @OrderFinalPrice DECIMAL(18,2);

        SELECT @OrderOriginalPrice = SUM(SubTotal)
        FROM Sale.OrderItem
        WHERE OrderID = @OrderID;

        SELECT TOP 1 
            @OrderCouponID = oc.CouponID,
            @OrderDiscountPercent = c.DiscountPercent
        FROM Sale.OrderCoupon oc
        JOIN App.Coupon c 
            ON oc.CouponID = c.CouponID
        WHERE oc.OrderID = @OrderID;

        SET @OrderFinalPrice = @OrderOriginalPrice;

        IF @OrderCouponID IS NOT NULL
            SET @OrderFinalPrice = @OrderOriginalPrice * (1 - @OrderDiscountPercent / 100);

        SET @TotalSavings = @TotalSavings + (@OrderOriginalPrice - @OrderFinalPrice);

        ------------------------------------------------------
        -- 4. Tính tiền tiết kiệm từ Item-level Coupon
        ------------------------------------------------------
        DECLARE @ItemSavings DECIMAL(18,2) = 0;
        DECLARE @OrderItemID INT;
        DECLARE @ItemOriginal DECIMAL(18,2);
        DECLARE @ItemDiscountPercent DECIMAL(5,2);

        DECLARE curItem CURSOR FOR
            SELECT OrderItemID, SubTotal
            FROM Sale.OrderItem
            WHERE OrderID = @OrderID;

        OPEN curItem;
        FETCH NEXT FROM curItem INTO @OrderItemID, @ItemOriginal;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SELECT TOP 1 @ItemDiscountPercent = c.DiscountPercent
            FROM Sale.OrderItemCoupon oic
            JOIN App.Coupon c
                ON oic.CouponID = c.CouponID
            WHERE oic.OrderItemID = @OrderItemID;

            IF @ItemDiscountPercent IS NOT NULL
                SET @ItemSavings += @ItemOriginal * (@ItemDiscountPercent / 100);

            FETCH NEXT FROM curItem INTO @OrderItemID, @ItemOriginal;
        END

        CLOSE curItem;
        DEALLOCATE curItem;

        SET @TotalSavings += @ItemSavings;

        ------------------------------------------------------
        FETCH NEXT FROM curOrder INTO @OrderID;
    END

    CLOSE curOrder;
    DEALLOCATE curOrder;

    RETURN @TotalSavings;
END
GO
