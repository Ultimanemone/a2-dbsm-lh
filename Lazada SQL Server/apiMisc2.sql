USE Lazada
GO

-- 1. Payment method - Cash - Bank Account
-- 1.1 Payment Method (DELETE) (Hàm dùng chung cho cha)
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

-- 2 Shipper
-- 2.1 Insert
CREATE OR ALTER PROCEDURE insertShipper
    @Name NVARCHAR(200),
    @Phone NVARCHAR(20), 
    @Email NVARCHAR(255), 
    @Address NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    IF LEN(ISNULL(@Name,'')) = 0 
    BEGIN 
        RAISERROR(N'Error: Name is required.', 16, 1); 
        RETURN; 
    END
    
    -- Ki?m tra format Phone ??n gi?n
    IF LEN(@Phone) < 9 
    BEGIN 
        RAISERROR(N'Error: Phone number invalid.', 16, 1); 
        RETURN; 
    END

    -- Database không set Phone là UNIQUE, nh?ng logic này mu?n check trùng
    IF EXISTS (SELECT 1 FROM Sale.Shipper WHERE Phone = @Phone) 
    BEGIN 
        RAISERROR(N'Error: Phone number already exists.', 16, 1); 
        RETURN; 
    END

    INSERT INTO Sale.Shipper(Name, Phone, Email, Address) 
    VALUES (@Name, @Phone, @Email, @Address);
END;
GO
-- 2.2 Update
CREATE OR ALTER PROCEDURE updateShipper
    @ShipperID INT,
    @Name NVARCHAR(200), 
    @Phone NVARCHAR(20), 
    @Email NVARCHAR(255), 
    @Address NVARCHAR(500)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Sale.Shipper WHERE ShipperID = @ShipperID) 
    BEGIN    
        RAISERROR(N'Error: Shipper does not exist.', 16, 1); 
        RETURN; 
    END

    UPDATE Sale.Shipper
    SET Name = @Name, Phone = @Phone, Email = @Email, Address = @Address
    WHERE ShipperID = @ShipperID;
END;
GO

-- 2.3 Delete
CREATE OR ALTER PROCEDURE deleteShipper
    @ShipperID INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Sale.Shipment WHERE ShipperID = @ShipperID)
    BEGIN
        RAISERROR(N'Error: Shipper has associated shipments. Cannot delete!', 16, 1);
        RETURN;
    END
    DELETE FROM Sale.Shipper WHERE ShipperID = @ShipperID;
END;
GO

-- 3. Shipment
-- 3.1 Insert
CREATE OR ALTER PROCEDURE insertShipment
    @ShipperID INT, 
    @OrderID INT,
    @SellerAccountID INT, -- S?a: Tên bi?n cho rõ ngh?a
    @DeliveryStartDate DATETIME, 
    @NumberOfProducts INT, -- S?a: Tên bi?n kh?p c?t
    @EstimatedDeliveryTime DATETIME,
    @RealDeliveryTime DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Sale.Shipper WHERE ShipperID = @ShipperID)
    BEGIN 
        RAISERROR(N'Error: Shipper not found.', 16, 1); 
        RETURN; 
    END

    IF @RealDeliveryTime IS NOT NULL AND @RealDeliveryTime < @DeliveryStartDate
    BEGIN 
        RAISERROR(N'Error: Real delivery time cannot be before start date.', 16, 1); 
        RETURN; 
    END

    -- Check trùng l?p (Logic nghi?p v?)
    IF EXISTS (SELECT 1 FROM Sale.Shipment WHERE ShipperID = @ShipperID AND OrderID = @OrderID)
    BEGIN 
        RAISERROR(N'Error: Shipment already assigned to this shipper.', 16, 1); 
        RETURN; 
    END

    INSERT INTO Sale.Shipment(ShipperID, OrderID, SellerAccountID, DeliveryStartDate, NumberOfProducts, EstimatedDeliveryTime, RealDeliveryTime) 
    VALUES (@ShipperID, @OrderID, @SellerAccountID, @DeliveryStartDate, @NumberOfProducts, @EstimatedDeliveryTime, @RealDeliveryTime);
END; 
GO

-- 3.2 Update
CREATE OR ALTER PROCEDURE updateShipment
    @ShipperID INT,
    @OrderID INT,
    @RealDeliveryTime DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Sale.Shipment WHERE ShipperID = @ShipperID AND OrderID = @OrderID)
    BEGIN 
        RAISERROR(N'Error: Shipment not found.', 16, 1); 
        RETURN; 
    END
    UPDATE Sale.Shipment
    SET RealDeliveryTime = @RealDeliveryTime
    WHERE ShipperID = @ShipperID AND OrderID = @OrderID;
END;
GO

-- 3.3 Delete
CREATE OR ALTER PROCEDURE sp_DeleteShipment
    @ShipperID INT,
    @OrderID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Sale.Shipment 
    WHERE ShipperID = @ShipperID AND OrderID = @OrderID;

    IF @@ROWCOUNT = 0
        RAISERROR(N'Error: Shipment not found to delete.', 16, 1);
END;
GO

-- 4. Advertisement
-- 4.1 Insert
CREATE OR ALTER PROCEDURE insertAdvertisement
    @AffiliateAccountID INT,    -- S?a: Dùng ID thay vì Code ?? chính xác
    @ProductID INT,
    @ImageURL NVARCHAR(1000), -- S?a tên c?t, type
    @Budget DECIMAL(14,2),     -- S?a type
    @Content NVARCHAR(2000)   -- S?a: Thêm Content (b?t bu?c)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Budget <= 0 
    BEGIN 
        RAISERROR(N'Error: Budget must be > 0.', 16, 1); 
        RETURN; 
    END

    -- S?a: Insert ?úng tên c?t
    INSERT INTO App.Advertisement (AffiliateAccountID, ProductID, ImageURL, Budget, CreatedAt, Content, Active) 
    VALUES (@AffiliateAccountID, @ProductID, @ImageURL, @Budget, GETDATE(), @Content, 1);
END;
GO

-- 4.2 Update
CREATE OR ALTER PROCEDURE updateAdvertisement
    @AdID INT, -- S?a: Tên bi?n
    @ImageURL NVARCHAR(1000), 
    @Budget DECIMAL(14,2),
    @Content NVARCHAR(2000)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM App.Advertisement WHERE AdID = @AdID)
    BEGIN 
        RAISERROR(N'Error: Advertisement does not exist.', 16, 1); 
        RETURN; 
    END

    IF @Budget <= 0 
    BEGIN 
        RAISERROR(N'Error: Budget must be > 0.', 16, 1); 
        RETURN; 
    END

    UPDATE App.Advertisement
    SET ImageURL = @ImageURL, Budget = @Budget, Content = @Content
    WHERE AdID = @AdID;
END;
GO

-- 4.3 Delete
CREATE OR ALTER PROCEDURE deleteAdvertisement
    @AdID INT
AS
BEGIN
    DELETE FROM App.Advertisement
    WHERE AdID = @AdID;
END;
GO

-- 6. Whistlist
-- 6.1 Insert
CREATE OR ALTER PROCEDURE createWishList
    @AccountID INT, -- S?a: CustomerID -> AccountID
    @Name NVARCHAR(200),
    @NewWishlistID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    IF LEN(ISNULL(@Name,'')) = 0 
    BEGIN 
        RAISERROR(N'Error: Wishlist name cannot be empty.', 16, 1); 
        RETURN; 
    END

    INSERT INTO UserData.Wishlist (AccountID, Name, CreatedDate) 
    VALUES (@AccountID, @Name, GETDATE());
    SET @NewWishlistID = SCOPE_IDENTITY();
END;
GO

-- 6.2 Update
CREATE OR ALTER PROCEDURE updateWishList
    @WishlistID INT, -- S?a: Update theo WishlistID
    @Name NVARCHAR(200)
AS
BEGIN
    UPDATE UserData.Wishlist
    SET Name = @Name
    WHERE WishlistID = @WishlistID;
END;
GO

-- 6.3 Delete
CREATE OR ALTER PROCEDURE deleteWishList
    @WishlistID INT
AS
BEGIN
    DELETE FROM UserData.Wishlist
    WHERE WishlistID = @WishlistID;
END;
GO

-- 7. WhistList Contain Products
-- 7.1 Insert
CREATE OR ALTER PROCEDURE insertWishlistContainProducts
    @WishlistID INT,
    @ProductID INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM UserData.Wishlist WHERE WishlistID = @WishlistID)
    BEGIN
         RAISERROR(N'Error: Wishlist does not exist', 16, 1);
         RETURN;
    END

    INSERT INTO Product.WishlistItem (WishlistID, ProductID) 
    VALUES (@WishlistID, @ProductID);
END;
GO

-- 7.2 Delete
CREATE OR ALTER PROCEDURE sp_RemoveProductFromWishlist
    @WishlistID INT,
    @ProductID INT
AS
BEGIN
    DELETE FROM Product.WishlistItem
    WHERE WishlistID = @WishlistID AND ProductID = @ProductID;
END;
GO

-- 8. Category
-- 8.1 Insert
CREATE OR ALTER PROCEDURE insertCategory
    @Name NVARCHAR(200),
    @Description NVARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;

    IF LEN(ISNULL(@Name,'')) = 0 
    BEGIN 
        RAISERROR(N'Error: Name of category cannot be empty.', 16, 1); 
        RETURN; 
    END
    
    -- Ki?m tra trùng tên
    IF EXISTS (SELECT 1 FROM Product.Category WHERE Name = @Name)
    BEGIN
        RAISERROR(N'Error: Category name already exists.', 16, 1); 
        RETURN; 
    END

    INSERT INTO Product.Category (Name, Description)
    VALUES (@Name, @Description);

    SELECT SCOPE_IDENTITY() AS NewCategoryID;
END;
GO

-- 8.2 Update
CREATE OR ALTER PROCEDURE updateCategoryInfo
    @CategoryID INT,
    @Name NVARCHAR(200),
    @Description NVARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM Product.Category WHERE CategoryID = @CategoryID)
    BEGIN
        RAISERROR(N'Error: Category does not exist.', 16, 1);
        RETURN;
    END

    UPDATE Product.Category
    SET Name = @Name, Description = @Description
    WHERE CategoryID = @CategoryID;
END;
GO

-- 8.3 Delete
CREATE OR ALTER PROCEDURE deleteCategory
    @CategoryID INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Product.Category WHERE CategoryID = @CategoryID)
    BEGIN 
        RAISERROR(N'Error: Category does not exist', 16, 1); 
        RETURN; 
    END

    DELETE FROM Product.Category WHERE CategoryID = @CategoryID;
END;
GO

-- 8.4.1. Thêm Brand
CREATE OR ALTER PROCEDURE insertCategoryBrand
    @CategoryID INT,
    @ABrand NVARCHAR(100)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Product.Category WHERE CategoryID = @CategoryID)
    BEGIN 
        RAISERROR(N'Error: Category does not exist', 16, 1); 
        RETURN; 
    END
    
    -- Tránh trùng l?p
    IF NOT EXISTS (SELECT 1 FROM ProductCategory.Brand WHERE CategoryID = @CategoryID AND ABrand = @ABrand)
    BEGIN
        INSERT INTO ProductCategory.Brand (CategoryID, ABrand) 
        VALUES (@CategoryID, @ABrand);
    END
END;
GO

-- 8.4.2. Thêm Color
CREATE OR ALTER PROCEDURE insertCategoryColor
    @CategoryID INT,
    @ColorName NVARCHAR(50)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Product.Category WHERE CategoryID = @CategoryID)
    BEGIN 
        RAISERROR(N'Error: Category does not exist', 16, 1); 
        RETURN; 
    END

    IF NOT EXISTS (SELECT 1 FROM ProductCategory.Color WHERE CategoryID = @CategoryID AND AColor = @ColorName)
    BEGIN
        INSERT INTO ProductCategory.Color (CategoryID, AColor) 
        VALUES (@CategoryID, @ColorName);
    END
END;
GO

-- 8.4.3. Thêm Feature
CREATE OR ALTER PROCEDURE insertCategoryProtableSpeakerFeature
    @CategoryID INT,
    @AFeature NVARCHAR(100)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Product.Category WHERE CategoryID = @CategoryID)
    BEGIN 
        RAISERROR(N'Error: Category does not exist', 16, 1); 
        RETURN; 
    END
    
    IF NOT EXISTS (SELECT 1 FROM ProductCategory.PortableSpeakerFeature WHERE CategoryID = @CategoryID AND AFeature = @AFeature)
    BEGIN
        INSERT INTO ProductCategory.PortableSpeakerFeature (CategoryID, AFeature) 
        VALUES (@CategoryID, @AFeature);
    END
END;
GO

-- 8.4.4 Thêm Shipped From
CREATE OR ALTER PROCEDURE insertCategoryShippedFrom
    @CategoryID INT,
    @ALocation NVARCHAR(100)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Product.Category WHERE CategoryID = @CategoryID)
    BEGIN 
        RAISERROR(N'Error: Category does not exist', 16, 1); 
        RETURN; 
    END

    IF NOT EXISTS (SELECT 1 FROM ProductCategory.ShippedFrom WHERE CategoryID = @CategoryID AND ALocation = @ALocation)
    BEGIN
        INSERT INTO ProductCategory.ShippedFrom (CategoryID, ALocation) 
        VALUES (@CategoryID, @ALocation);
    END
END;
GO

-- 8.4.5 Thêm Woofer Size
CREATE OR ALTER PROCEDURE insertCategoryWooferSize
    @CategoryID INT,
    @ASize NVARCHAR(50)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Product.Category WHERE CategoryID = @CategoryID)
    BEGIN 
        RAISERROR(N'Error: Category does not exist', 16, 1); 
        RETURN; 
    END

    IF NOT EXISTS (SELECT 1 FROM ProductCategory.WooferSize WHERE CategoryID = @CategoryID AND Size = @ASize)
    BEGIN
        INSERT INTO ProductCategory.WooferSize (CategoryID, Size) 
        VALUES (@CategoryID, @ASize);
    END
END;
GO

-- 8.5.1. Xóa Brand
CREATE OR ALTER PROCEDURE deleteCategoryBrand
    @CategoryID INT,
    @BrandName NVARCHAR(100)
AS
BEGIN
    DELETE FROM ProductCategory.Brand
    WHERE CategoryID = @CategoryID AND ABrand = @BrandName;
END;
GO

-- 8.5.2. Xóa Color
CREATE OR ALTER PROCEDURE deleteCategoryColor
    @CategoryID INT,
    @ColorName NVARCHAR(50)
AS
BEGIN
    DELETE FROM ProductCategory.Color 
    WHERE CategoryID = @CategoryID AND AColor = @ColorName;
END;
GO

-- 8.5.3. Xóa Feature
CREATE OR ALTER PROCEDURE deleteCategoryFeature
    @CategoryID INT,
    @Feature NVARCHAR(100)
AS
BEGIN
    DELETE FROM ProductCategory.PortableSpeakerFeature
    WHERE CategoryID = @CategoryID AND AFeature = @Feature;
END;
GO

-- 8.5.4. Xóa Shipped From
CREATE OR ALTER PROCEDURE deleteCategoryShippedFrom
    @CategoryID INT,
    @Location NVARCHAR(100)
AS
BEGIN
    DELETE FROM ProductCategory.ShippedFrom
    WHERE CategoryID = @CategoryID AND ALocation = @Location;
END;
GO

-- 8.5.5. Xóa Woofer Size
CREATE OR ALTER PROCEDURE deleteCategoryWooferSize
    @CategoryID INT,
    @Size NVARCHAR(50)
AS
BEGIN
    DELETE FROM ProductCategory.WooferSize
    WHERE CategoryID = @CategoryID AND Size = @Size;
END;
GO

-- 9. Coupon
-- 9.1 Insert
CREATE OR ALTER PROCEDURE insertCoupon
    @Code NVARCHAR(100),
    @Type NVARCHAR(50),
    @DiscountPercent DECIMAL(5,2),
    @StartDate DATETIME,
    @EndDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    IF @EndDate <= @StartDate
    BEGIN
        RAISERROR(N'Error: EndDate must be > StartDate', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM App.Coupon WHERE Code = @Code)
    BEGIN
        RAISERROR(N'Error: Coupon Code exists', 16, 1);
        RETURN;
    END

    INSERT INTO App.Coupon (Code, Type, DiscountPercent, StartDate, EndDate) 
    VALUES (@Code, @Type, @DiscountPercent, @StartDate, @EndDate);
END;
GO

-- 9.2 Update
CREATE OR ALTER PROCEDURE updateCoupon
    @CouponID INT,
    @Type NVARCHAR(50),
    @DiscountPercent DECIMAL(5,2)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM App.Coupon WHERE CouponID = @CouponID)
    BEGIN 
        RAISERROR(N'Error: Coupon does not exist', 16, 1); 
        RETURN; 
    END

    UPDATE App.Coupon
    SET Type = @Type, DiscountPercent = @DiscountPercent
    WHERE CouponID = @CouponID;
END;
GO

-- 9.3 Delete
CREATE OR ALTER PROCEDURE deleteCoupon
    @CouponID INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Sale.ProductCoupon WHERE CouponID = @CouponID) 
        OR EXISTS (SELECT 1 FROM Sale.OrderCoupon WHERE CouponID = @CouponID)
    BEGIN
        RAISERROR(N'Error: Coupon is in use. Cannot delete', 16, 1);
        RETURN;
    END
    DELETE FROM App.Coupon
    WHERE CouponID = @CouponID;
END;
GO

-- 10. Product has Coupon
-- 10.1 Insert
CREATE OR ALTER PROCEDURE insertProductHasCoupon
    @ProductID INT,
    @CouponID INT
AS
BEGIN
    -- S?a: ProductCoupon
    IF EXISTS (SELECT 1 FROM Sale.ProductCoupon WHERE CouponID = @CouponID AND ProductID = @ProductID)
    BEGIN
        RAISERROR(N'Error: Product already has this coupon', 16, 1);
        RETURN;
    END

    INSERT INTO Sale.ProductCoupon (ProductID, CouponID) 
    VALUES (@ProductID, @CouponID);
END;
GO

-- 10.2 Delete
CREATE OR ALTER PROCEDURE deleteProductHasCoupon
    @ProductID INT,
    @CouponID INT
AS
BEGIN
    DELETE FROM Sale.ProductCoupon
    WHERE CouponID = @CouponID AND ProductID = @ProductID;
END;
GO

-- 11. OrderItemHasCoupon
-- 11.1 Insert
CREATE OR ALTER PROCEDURE insertOrderItemHasCoupon
    @OrderItemID INT,
    @CouponID INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Sale.OrderItemCoupon WHERE CouponID = @CouponID AND OrderItemID = @OrderItemID)
    BEGIN
        PRINT N'Item already has this coupon';
        RETURN;
    END

    INSERT INTO Sale.OrderItemCoupon (OrderItemID, CouponID) 
    VALUES (@OrderItemID, @CouponID);
END;
GO

-- 11.2 Delete
CREATE OR ALTER PROCEDURE deleteOrderItemHasCoupon
    @OrderItemID INT,
    @CouponID INT
AS
BEGIN
    DELETE FROM Sale.OrderItemCoupon
    WHERE CouponID = @CouponID AND OrderItemID = @OrderItemID;
END;
GO

-- 12. OrderCoupon
-- 12.1 Insert
CREATE OR ALTER PROCEDURE insertOrderCoupon
    @OrderID INT,
    @CouponID INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Sale.OrderCoupon WHERE CouponID = @CouponID AND OrderID = @OrderID)
    BEGIN
        PRINT N'Order already has this coupon';
        RETURN;
    END

    INSERT INTO Sale.OrderCoupon (OrderID, CouponID) 
    VALUES (@OrderID, @CouponID);
END;
GO

-- 12.2 Delete
CREATE OR ALTER PROCEDURE deleteOrderCoupon
    @OrderID INT,
    @CouponID INT
AS
BEGIN
    DELETE FROM Sale.OrderCoupon
    WHERE CouponID = @CouponID AND OrderID = @OrderID;
END;
GO