USE Lazada;
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
    DECLARE @OrderDate DATETIME;

    DECLARE curOrder CURSOR FAST_FORWARD FOR
        SELECT OrderID, OrderDate
        FROM Sale.[Order]
        WHERE AccountID = @CustomerID
          AND Status IN ('Delivered','Confirmed','Shipped');

    OPEN curOrder;
    FETCH NEXT FROM curOrder INTO @OrderID, @OrderDate;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        ------------------------------------------------------
        -- 3. Tính tiền tiết kiệm từ Order-level Coupon
        ------------------------------------------------------
        DECLARE @OrderOriginalPrice DECIMAL(18,2);
        -- DECLARE @OrderCouponID INT;
        -- DECLARE @OrderDiscountType NVARCHAR(50);
        -- DECLARE @OrderDiscountValue DECIMAL(18,2);
        -- DECLARE @OrderSavings DECIMAL(18,2) = 0;

        -- Tổng tiền trước giảm của order
        -- SELECT @OrderOriginalPrice = SUM(SubTotal)
        -- FROM Sale.OrderItem
        -- WHERE OrderID = @OrderID;

        -- IF @OrderOriginalPrice IS NULL SET @OrderOriginalPrice = 0;

        -- Cursor qua các coupon áp dụng cho toàn order
        -- DECLARE curOrderCoupon CURSOR FAST_FORWARD FOR
        --     SELECT c.CouponID, c.Type, c.DiscountPercent
        --     FROM Sale.OrderCoupon oc
        --     JOIN App.Coupon c 
        --         ON oc.CouponID = c.CouponID
        --     WHERE oc.OrderID = @OrderID
        --       AND @OrderDate BETWEEN c.StartDate AND c.EndDate;

        -- OPEN curOrderCoupon;
        -- FETCH NEXT FROM curOrderCoupon INTO 
        --     @OrderCouponID, @OrderDiscountType, @OrderDiscountValue;

        -- WHILE @@FETCH_STATUS = 0
        -- BEGIN
        --     IF @OrderDiscountType = 'Percent'
        --     BEGIN
        --         SET @OrderSavings += @OrderOriginalPrice * (@OrderDiscountValue / 100.0);
        --     END
        --     ELSE IF @OrderDiscountType = 'Fixed'
        --     BEGIN
        --         -- Giảm số tiền cố định, không vượt quá giá trị order
        --         IF @OrderDiscountValue > @OrderOriginalPrice
        --             SET @OrderSavings += @OrderOriginalPrice;
        --         ELSE
        --             SET @OrderSavings += @OrderDiscountValue;
        --     END

        --     FETCH NEXT FROM curOrderCoupon INTO 
        --         @OrderCouponID, @OrderDiscountType, @OrderDiscountValue;
        -- END

        -- CLOSE curOrderCoupon;
        -- DEALLOCATE curOrderCoupon;

        ------------------------------------------------------
        -- tính tiền tiết kiệm từ Item-level Coupon
        ------------------------------------------------------
        DECLARE @OrderItemID INT;
        DECLARE @ItemOriginal DECIMAL(18,2);

        DECLARE @ItemCouponID INT;
        DECLARE @ItemDiscountType NVARCHAR(50);
        DECLARE @ItemDiscountValue DECIMAL(18,2);

        DECLARE curItem CURSOR FAST_FORWARD FOR
            SELECT OrderItemID, SubTotal
            FROM Sale.OrderItem
            WHERE OrderID = @OrderID;

        OPEN curItem;
        FETCH NEXT FROM curItem INTO @OrderItemID, @ItemOriginal;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            DECLARE curItemCoupon CURSOR FAST_FORWARD FOR
                SELECT c.Type, c.DiscountPercent
                FROM Sale.OrderItem oi
                JOIN Product.Product P
                    ON oi.ProductID = P.ProductID
                JOIN Sale.ProductCoupon pc
                    ON P.ProductID = pc.ProductID
                JOIN App.Coupon c
                    ON pc.CouponID = c.CouponID
                WHERE oi.OrderItemID = @OrderItemID
                  AND @OrderDate BETWEEN c.StartDate AND c.EndDate;

            OPEN curItemCoupon;
            FETCH NEXT FROM curItemCoupon INTO 
                 @ItemDiscountType, @ItemDiscountValue;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                IF @ItemDiscountType = 'Percent'
                BEGIN
                    SET @TotalSavings += @ItemOriginal * (@ItemDiscountValue / 100.0);
                END
                ELSE IF @ItemDiscountType = 'Fixed'
                BEGIN
                    IF @ItemDiscountValue > @ItemOriginal
                        SET @TotalSavings += @ItemOriginal;
                    ELSE
                        SET @TotalSavings += @ItemDiscountValue;
                END

                FETCH NEXT FROM curItemCoupon INTO 
                    @ItemDiscountType, @ItemDiscountValue;
            END

            CLOSE curItemCoupon;
            DEALLOCATE curItemCoupon;

            FETCH NEXT FROM curItem INTO @OrderItemID, @ItemOriginal;
        END

        CLOSE curItem;
        DEALLOCATE curItem;

        FETCH NEXT FROM curOrder INTO @OrderID, @OrderDate;
    END

    CLOSE curOrder;
    DEALLOCATE curOrder;

    RETURN @TotalSavings;
END
GO