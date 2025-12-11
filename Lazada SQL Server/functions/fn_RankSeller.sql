GO
CREATE OR ALTER FUNCTION dbo.fn_RankSeller
(
    @SellerID INT
)
RETURNS NVARCHAR(20)
AS
BEGIN
    DECLARE @Revenue     DECIMAL(18,2) = 0;
    DECLARE @AvgRating   DECIMAL(5,2) = 0;
    DECLARE @OrderCount  INT = 0;
    DECLARE @Rank        NVARCHAR(20);

    ----------------------------------------------------------
    -- Validate seller
    ----------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 
        FROM [User].Seller 
        WHERE AccountID = @SellerID
    )
        RETURN 'INVALID';

    ----------------------------------------------------------
    -- 1. TỔNG DOANH THU (OrderItem.SubTotal)
    ----------------------------------------------------------
    SELECT @Revenue = SUM(oi.SubTotal)
    FROM Sale.OrderItem oi
    JOIN Product.Product p 
        ON oi.ProductID = p.ProductID
    JOIN UserData.SellerProduct sp
        ON sp.ProductID = p.ProductID
    WHERE sp.SellerAccountID = @SellerID;

    IF @Revenue IS NULL SET @Revenue = 0;

    ----------------------------------------------------------
    -- 2. SỐ ĐƠN HÀNG CỦA SELLER
    ----------------------------------------------------------
    SELECT @OrderCount =
        COUNT(DISTINCT o.OrderID)
    FROM Sale.[Order] o
    JOIN Sale.OrderItem oi ON oi.OrderID = o.OrderID
    JOIN UserData.SellerProduct sp 
        ON sp.ProductID = oi.ProductID
    WHERE sp.SellerAccountID = @SellerID;

    ----------------------------------------------------------
    -- 3. AVG RATING của các sản phẩm của seller
    ----------------------------------------------------------
    SELECT @AvgRating = AVG(r.Rating)
    FROM Product.ProductReview r
    JOIN Product.Product p ON p.ProductID = r.ProductID
    JOIN UserData.SellerProduct sp ON sp.ProductID = p.ProductID
    WHERE sp.SellerAccountID = @SellerID;

    IF @AvgRating IS NULL SET @AvgRating = 0;

    ----------------------------------------------------------
    -- 4. XẾP HẠNG SELLER
    ----------------------------------------------------------
    IF (@Revenue > 100000 AND @AvgRating >= 4.5 AND @OrderCount > 200)
        SET @Rank = 'PLATINUM';
    ELSE IF (@Revenue > 50000 AND @AvgRating >= 4.0 AND @OrderCount > 100)
        SET @Rank = 'GOLD';
    ELSE IF (@Revenue > 20000 AND @AvgRating >= 3.5 AND @OrderCount > 50)
        SET @Rank = 'SILVER';
    ELSE
        SET @Rank = 'BRONZE';

    RETURN @Rank;
END
GO