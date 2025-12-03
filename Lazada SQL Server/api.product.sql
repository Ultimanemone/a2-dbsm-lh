USE Lazada
GO

-- 1. Product
-- 1.1 Insert
CREATE OR ALTER PROCEDURE insertProduct
    @categoryId INT,
    @name NVARCHAR(300),
    @price DECIMAL(12,2),
    @imageUrl NVARCHAR(1000),
    @status NVARCHAR(20),
    @stockAmount INT,
    @brand NVARCHAR(200)
AS
BEGIN
    IF (@price < 0)
        THROW 50001, 'Price must be greater than or equal to 0', 1;

    IF (@stockAmount < 0)
        THROW 50002, 'Stock amount must be greater than or equal to 0', 1;

    IF NOT EXISTS (SELECT 1 FROM Product.Category WHERE CategoryID = @categoryId)
        THROW 50003, 'Category does not exist', 1;

    INSERT INTO Product.Product(CategoryID, Name, Price, ImageURL, Status, Stock, Brand)
    VALUES (@categoryId, @name, @price, @imageUrl, @status, @stockAmount, @brand);
END
GO

-- 1.2 Update
CREATE OR ALTER PROCEDURE updateProduct
    @productId INT,
    @categoryId INT,
    @name NVARCHAR(300),
    @price DECIMAL(12,2),
    @imageUrl NVARCHAR(1000),
    @status NVARCHAR(20),
    @stockAmount INT,
    @brand NVARCHAR(200)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Product.Product WHERE ProductID = @productId)
        THROW 50004, 'Product does not exist', 1;

    IF (@price < 0)
        THROW 50001, 'Price must be greater than or equal to 0', 1;

    IF (@stockAmount < 0)
        THROW 50002, 'Stock amount must be greater than or equal to 0', 1;

    UPDATE Product.Product
    SET CategoryID = @categoryId,
        Name = @name,
        Price = @price,
        ImageURL = @imageUrl,
        Status = @status,
        Stock = @stockAmount,
        Brand = @brand
    WHERE ProductID = @productId;
END
GO

-- 1.3 Delete
CREATE OR ALTER PROCEDURE deleteProduct
    @productId INT
AS
BEGIN
    DELETE FROM Product.Product
    WHERE ProductID = @productId;
END
GO

-- 2. Product Review
-- 2.1 Insert
CREATE OR ALTER PROCEDURE insertProductReview
    @productId INT,
    @customerId INT,
    @rating DECIMAL(2,1),
    @reviewDate DATETIME = NULL,
    @comment NVARCHAR(2000),
    @moderated BIT = 0
AS
BEGIN
    IF (@rating < 0.0 OR @rating > 5.0)
        THROW 50005, 'Rating value must be between 0 and 5', 1;

    IF @reviewDate IS NULL SET @reviewDate = GETDATE();

    INSERT INTO Product.ProductReview(ProductID, AccountID, Rating, ReviewDate, Comment, Moderated)
    VALUES (@productId, @customerId, @rating, @reviewDate, @comment, @moderated);
END
GO

-- 2.2 Update
CREATE OR ALTER PROCEDURE updateProductReview
    @productId INT,
    @customerId INT,
    @rating DECIMAL(2,1),
    @reviewDate DATETIME,
    @comment NVARCHAR(2000),
    @moderated BIT
AS
BEGIN
    IF (@rating < 0.0 OR @rating > 5.0)
        THROW 50005, 'Rating value must be between 0 and 5', 1;

    UPDATE Product.ProductReview
    SET Rating = @rating,
        ReviewDate = @reviewDate,
        Comment = @comment,
        Moderated = @moderated
    WHERE ProductID = @productId AND AccountID = @customerId;
END
GO

-- 2.3 Delete
CREATE OR ALTER PROCEDURE deleteProductReview
    @productId INT,
    @customerId INT
AS
BEGIN
    DELETE FROM Product.ProductReview
    WHERE ProductID = @productId AND AccountID = @customerId;
END
GO

-- 3. Seller-Product mapping
-- 3.1 Insert
CREATE OR ALTER PROCEDURE insertSellerHasProduct
    @sellerId INT,
    @productId INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM UserData.SellerProduct WHERE SellerAccountID = @sellerId AND ProductID = @productId)
        RETURN;

    INSERT INTO UserData.SellerProduct(SellerAccountID, ProductID)
    VALUES (@sellerId, @productId);
END
GO

-- 3.2 Delete
CREATE OR ALTER PROCEDURE deleteSellerHasProduct
    @sellerId INT,
    @productId INT
AS
BEGIN
    DELETE FROM UserData.SellerProduct
    WHERE SellerAccountID = @sellerId AND ProductID = @productId;
END
GO
