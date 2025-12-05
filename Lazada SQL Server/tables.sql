IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'Lazada')
BEGIN
    CREATE DATABASE Lazada;
END
GO

USE Lazada
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'User')
BEGIN
    EXEC('CREATE SCHEMA [User]');
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'UserData')
BEGIN
    EXEC('CREATE SCHEMA UserData');
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'App')
BEGIN
    EXEC('CREATE SCHEMA App');
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'AppPayment')
BEGIN
    EXEC('CREATE SCHEMA AppPayment');
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Sale')
BEGIN
    EXEC('CREATE SCHEMA Sale');
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Product')
BEGIN
    EXEC('CREATE SCHEMA Product');
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'ProductCategory')
BEGIN
    EXEC('CREATE SCHEMA ProductCategory');
END
GO

IF OBJECT_ID('[User].Account', 'U') IS NULL
BEGIN
    CREATE TABLE [User].Account (
        AccountID      INT IDENTITY(1,1) PRIMARY KEY,
        Username       NVARCHAR(100) NOT NULL UNIQUE,
        EmailMain      NVARCHAR(255) NOT NULL,
        HashedPassword NVARCHAR(512) NOT NULL,
        CreatedAt      DATETIME NOT NULL DEFAULT GETDATE(),
        Status         NVARCHAR(20) NOT NULL DEFAULT 'Active', -- Active, Suspended, Deleted
        AccountType    NVARCHAR(20) NOT NULL, -- 'Customer','Seller','Admin','Affiliate'
        CONSTRAINT CHK_Account_Status CHECK (Status IN ('Active','Suspended','Deleted')),
        CONSTRAINT CHK_Account_Type CHECK (AccountType IN ('Customer','Seller','Admin','Affiliate'))
    );
END
GO

-- Multivalued emails and phones
IF OBJECT_ID('UserData.AccountEmail', 'U') IS NULL
BEGIN
    CREATE TABLE UserData.AccountEmail (
        AccountID INT NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        PRIMARY KEY (AccountID, Email),
        CONSTRAINT FK_AccountEmail_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('UserData.AccountPhone', 'U') IS NULL
BEGIN
    CREATE TABLE UserData.AccountPhone (
        AccountID INT NOT NULL,
        Phone NVARCHAR(20) NOT NULL,
        PRIMARY KEY (AccountID, Phone),
        CONSTRAINT FK_AccountPhone_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID) ON DELETE CASCADE
    );
END
GO

-- Subtypes
IF OBJECT_ID('[User].Customer', 'U') IS NULL
BEGIN
    CREATE TABLE [User].Customer (
        AccountID INT PRIMARY KEY,
        LoyaltyLevel NVARCHAR(20) DEFAULT 'Bronze',
        RewardPoints INT NOT NULL DEFAULT 0 CHECK (RewardPoints >= 0),
        CONSTRAINT FK_Customer_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('[User].Seller', 'U') IS NULL
BEGIN
    CREATE TABLE [User].Seller (
        AccountID INT PRIMARY KEY,
        ShopName NVARCHAR(200) NOT NULL,
        TaxCode NVARCHAR(20) NOT NULL,
        BusinessLicenseNumber NVARCHAR(50) NOT NULL UNIQUE,
        ShopAddress NVARCHAR(300) NOT NULL,
        Rating DECIMAL(3,2) DEFAULT 0.0 CHECK (Rating >= 0.0 AND Rating <= 5.0),
        CONSTRAINT FK_Seller_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID) ON DELETE CASCADE,
        CONSTRAINT CHK_Seller_TaxCode CHECK ( (LEN(TaxCode) = 10 OR LEN(TaxCode)=13) AND PATINDEX('%[^0-9]%', TaxCode) = 0 )
    );
END
GO

IF OBJECT_ID('[User].Admin', 'U') IS NULL
BEGIN
    CREATE TABLE [User].Admin (
        AccountID INT PRIMARY KEY,
        Role NVARCHAR(50) NOT NULL,
        Department NVARCHAR(100),
        CONSTRAINT FK_Admin_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('[User].Affiliate', 'U') IS NULL
BEGIN
    CREATE TABLE [User].Affiliate (
        AccountID INT PRIMARY KEY,
        AffiliateCode NVARCHAR(50) UNIQUE,
        CommissionRate DECIMAL(5,2) NOT NULL CHECK (CommissionRate >= 0 AND CommissionRate <= 100),
        JoinDate DATETIME NOT NULL DEFAULT GETDATE(),
        TotalEarnings DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (TotalEarnings >= 0),
        CONSTRAINT FK_Affiliate_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID) ON DELETE CASCADE
    );
END
GO

-- Category & Product
IF OBJECT_ID('Product.Category', 'U') IS NULL
BEGIN
    CREATE TABLE Product.Category (
        CategoryID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(1000),
        CONSTRAINT UQ_Category_Name UNIQUE (Name)
    );
END
GO

IF OBJECT_ID('ProductCategory.PortableSpeakerFeature', 'U') IS NULL
BEGIN
    CREATE TABLE ProductCategory.PortableSpeakerFeature (
        CategoryID INT NOT NULL,
        AFeature NVARCHAR(100) NOT NULL,
        PRIMARY KEY (CategoryID, AFeature),
        CONSTRAINT FK_CategoryFeature_Category FOREIGN KEY (CategoryID) REFERENCES Product.Category(CategoryID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('ProductCategory.Brand', 'U') IS NULL
BEGIN
    CREATE TABLE ProductCategory.Brand (
        CategoryID INT NOT NULL,
        ABrand NVARCHAR(100) NOT NULL,
        PRIMARY KEY (CategoryID, ABrand),
        CONSTRAINT FK_CategoryBrand_Category FOREIGN KEY (CategoryID) REFERENCES Product.Category(CategoryID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('ProductCategory.ShippedFrom', 'U') IS NULL
BEGIN
    CREATE TABLE ProductCategory.ShippedFrom (
        CategoryID INT NOT NULL,
        ALocation NVARCHAR(100) NOT NULL,
        PRIMARY KEY (CategoryID, ALocation),
        CONSTRAINT FK_CategoryShippedFrom_Category FOREIGN KEY (CategoryID) REFERENCES Product.Category(CategoryID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('ProductCategory.WooferSize', 'U') IS NULL
BEGIN
    CREATE TABLE ProductCategory.WooferSize (
        CategoryID INT NOT NULL,
        Size NVARCHAR(50) NOT NULL,
        PRIMARY KEY (CategoryID, Size),
        CONSTRAINT FK_CategoryWooferSize_Category FOREIGN KEY (CategoryID) REFERENCES Product.Category(CategoryID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('ProductCategory.Color', 'U') IS NULL
BEGIN
    CREATE TABLE ProductCategory.Color (
        CategoryID INT NOT NULL,
        AColor NVARCHAR(50) NOT NULL,
        PRIMARY KEY (CategoryID, AColor),
        CONSTRAINT FK_CategoryColor_Category FOREIGN KEY (CategoryID) REFERENCES Product.Category(CategoryID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID('Product.Product', 'U') IS NULL
BEGIN
    CREATE TABLE Product.Product (
        ProductID INT IDENTITY(1,1) PRIMARY KEY,
        CategoryID INT NOT NULL,
        Name NVARCHAR(300) NOT NULL,
        Price DECIMAL(12,2) NOT NULL CHECK (Price >= 0),
        ImageURL NVARCHAR(1000),
        Status NVARCHAR(20) NOT NULL DEFAULT 'Available', -- Available, Discontinued, OutOfStock
        Stock INT NOT NULL DEFAULT 0 CHECK (Stock >= 0),
        Brand NVARCHAR(200),
        CONSTRAINT FK_Product_Category FOREIGN KEY (CategoryID) REFERENCES Product.Category(CategoryID)
    );
END
GO

-- Seller-Product mapping (seller may have many products)
IF OBJECT_ID('UserData.SellerProduct', 'U') IS NULL
BEGIN
    CREATE TABLE UserData.SellerProduct (
        SellerAccountID INT NOT NULL,
        ProductID INT NOT NULL,
        PRIMARY KEY (SellerAccountID, ProductID),
        CONSTRAINT FK_SellerProduct_Seller FOREIGN KEY (SellerAccountID) REFERENCES [User].Seller(AccountID),
        CONSTRAINT FK_SellerProduct_Product FOREIGN KEY (ProductID) REFERENCES Product.Product(ProductID)
    );
END
GO

-- Wishlist (a customer can have multiple wishlists)
IF OBJECT_ID('UserData.Wishlist', 'U') IS NULL
BEGIN
    CREATE TABLE UserData.Wishlist (
        WishlistID INT IDENTITY(1,1) PRIMARY KEY,
        AccountID INT NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Wishlist_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID)
    );
END
GO

IF OBJECT_ID('Product.WishlistItem', 'U') IS NULL
BEGIN
    CREATE TABLE Product.WishlistItem (
        WishlistID INT NOT NULL,
        ProductID INT NOT NULL,
        PRIMARY KEY (WishlistID, ProductID),
        CONSTRAINT FK_WishlistItem_Wishlist FOREIGN KEY (WishlistID) REFERENCES UserData.Wishlist(WishlistID) ON DELETE CASCADE,
        CONSTRAINT FK_WishlistItem_Product FOREIGN KEY (ProductID) REFERENCES Product.Product(ProductID)
    );
END
GO

-- Cart and CartItem (Customer has 1 cart; we won't enforce 1:1 here but sample will)
IF OBJECT_ID('App.Cart', 'U') IS NULL
BEGIN
    CREATE TABLE App.Cart (
        CartID INT IDENTITY(1,1) PRIMARY KEY,
        AccountID INT NOT NULL UNIQUE, -- enforce one cart per account
        TotalPrice DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (TotalPrice >= 0),
        TotalAmount INT NOT NULL DEFAULT 0 CHECK (TotalAmount >= 0),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        ShippingAddress NVARCHAR(500),
        CONSTRAINT FK_Cart_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID)
    );
END
GO

IF OBJECT_ID('App.CartItem', 'U') IS NULL
BEGIN
    CREATE TABLE App.CartItem (
        CartID INT NOT NULL,
        ProductID INT NOT NULL,
        Quantity INT NOT NULL CHECK (Quantity > 0),
        SubTotal DECIMAL(12,2) NOT NULL CHECK (SubTotal >= 0),
        PRIMARY KEY (CartID, ProductID),
        CONSTRAINT FK_CartItem_Cart FOREIGN KEY (CartID) REFERENCES App.Cart(CartID) ON DELETE CASCADE,
        CONSTRAINT FK_CartItem_Product FOREIGN KEY (ProductID) REFERENCES Product.Product(ProductID)
    );
END
GO

-- Payment method supertype and subtypes
IF OBJECT_ID('App.PaymentMethod', 'U') IS NULL
BEGIN
    CREATE TABLE App.PaymentMethod (
        Pmid INT IDENTITY(1,1) PRIMARY KEY,
        Method NVARCHAR(50) NOT NULL -- 'BankAccount' or 'Cash'
    );
END
GO

IF OBJECT_ID('AppPayment.BankAccount', 'U') IS NULL
BEGIN
    CREATE TABLE AppPayment.BankAccount (
        BankPmid INT PRIMARY KEY,
        OwnerAccountID INT NOT NULL,
        BankName NVARCHAR(200) NOT NULL,
        CardType NVARCHAR(50),
        CardNumber NVARCHAR(50) NOT NULL,
        ExpirationDate DATE NOT NULL,
        CONSTRAINT FK_BankAccount_PM FOREIGN KEY (BankPmid) REFERENCES App.PaymentMethod(Pmid) ON DELETE CASCADE,
        CONSTRAINT FK_BankAccount_Owner FOREIGN KEY (OwnerAccountID) REFERENCES [User].Account(AccountID)
    );
END
GO

-- Shipper & Shipment
IF OBJECT_ID('Sale.Shipper', 'U') IS NULL
BEGIN
    CREATE TABLE Sale.Shipper (
        ShipperID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        Phone NVARCHAR(20),
        Email NVARCHAR(255),
        Address NVARCHAR(500)
    );
END
GO

IF OBJECT_ID('AppPayment.Cash', 'U') IS NULL
BEGIN
    CREATE TABLE AppPayment.Cash (
        CashPmid INT PRIMARY KEY,
        ActualReceivedMoney DECIMAL(12,2) NOT NULL CHECK (ActualReceivedMoney >= 0),
        MoneyBack DECIMAL(12,2) NOT NULL CHECK (MoneyBack >= 0),
        ShipperID INT NULL, -- who received the cash
        CONSTRAINT FK_Cash_PM FOREIGN KEY (CashPmid) REFERENCES App.PaymentMethod(Pmid) ON DELETE CASCADE,
        CONSTRAINT FK_Cash_Shipper FOREIGN KEY (ShipperID) REFERENCES Sale.Shipper(ShipperID) ON DELETE CASCADE -- note: Shipper created later, so will be nullable initially
    );
END
GO

-- Orders, OrderItems, OrderHistory
IF OBJECT_ID('Sale.Order', 'U') IS NULL
BEGIN
    CREATE TABLE Sale.[Order] (
        OrderID INT IDENTITY(1,1) PRIMARY KEY,
        AccountID INT NOT NULL,
        CreationDate DATETIME NOT NULL DEFAULT GETDATE(),
        OrderDate DATETIME NOT NULL DEFAULT GETDATE(),
        NoOfShipments INT NOT NULL DEFAULT 1 CHECK (NoOfShipments >= 0),
        LastUpdateDate DATETIME NOT NULL DEFAULT GETDATE(),
        ShippingAddress NVARCHAR(500) NOT NULL,
        Note NVARCHAR(1000),
        TotalPrice DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (TotalPrice >= 0),
        Status NVARCHAR(30) NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Shipped, Delivered, Cancelled
        CONSTRAINT FK_Order_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID)
    );
END
GO

IF OBJECT_ID('Sale.Shipment', 'U') IS NULL
BEGIN
CREATE TABLE Sale.Shipment (
    ShipmentID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    ShipperID INT NOT NULL,
    SellerAccountID INT NULL,
    DeliveryStartDate DATETIME NOT NULL,
    NumberOfProducts INT NOT NULL CHECK (NumberOfProducts >= 0),
    EstimatedDeliveryTime DATETIME,
    RealDeliveryTime DATETIME NULL,
    CONSTRAINT FK_Shipment_Order FOREIGN KEY (OrderID) REFERENCES Sale.[Order](OrderID) ON DELETE CASCADE, -- Order table created later; will adjust with ALTER after Order created
    CONSTRAINT FK_Shipment_Shipper FOREIGN KEY (ShipperID) REFERENCES Sale.Shipper(ShipperID) ON DELETE CASCADE,
    CONSTRAINT FK_Shipment_Seller FOREIGN KEY (SellerAccountID) REFERENCES [User].Seller(AccountID) ON DELETE CASCADE
);
-- FK to [Order] will be added later because [Order] is created below
END
GO

IF OBJECT_ID('Sale.OrderItem', 'U') IS NULL
BEGIN
    CREATE TABLE Sale.OrderItem (
        OrderItemID INT IDENTITY(1,1) PRIMARY KEY,
        OrderID INT NOT NULL,
        ProductID INT NOT NULL,
        Quantity INT NOT NULL CHECK (Quantity > 0),
        SubTotal DECIMAL(12,2) NOT NULL CHECK (SubTotal >= 0),
        CONSTRAINT FK_OrderItem_Order FOREIGN KEY (OrderID) REFERENCES Sale.[Order](OrderID) ON DELETE CASCADE,
        CONSTRAINT FK_OrderItem_Product FOREIGN KEY (ProductID) REFERENCES Product.Product(ProductID)
    );
END
GO

IF OBJECT_ID('UserData.OrderHistory', 'U') IS NULL
BEGIN
    CREATE TABLE UserData.OrderHistory (
        AccountID INT NOT NULL,
        OrderHistoryID INT IDENTITY(1,1) PRIMARY KEY,
        OrderID INT NOT NULL UNIQUE,
        CompletionDate DATETIME NULL,
        OrderStatus NVARCHAR(30) NOT NULL,
        CONSTRAINT FK_OrderHistory_Order FOREIGN KEY (OrderID) REFERENCES Sale.[Order](OrderID) ON DELETE CASCADE,
        CONSTRAINT FK_Account_OrderHistory FOREIGN KEY (AccountID) REFERENCES [User].Customer(AccountID) ON DELETE CASCADE
    );
END
GO

-- Coupons and M:N relations
IF OBJECT_ID('App.Coupon', 'U') IS NULL
BEGIN
    CREATE TABLE App.Coupon (
        CouponID INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(100) NOT NULL UNIQUE,
        StartDate DATETIME NOT NULL,
        EndDate DATETIME NOT NULL,
        Type NVARCHAR(50),
        DiscountPercent DECIMAL(5,2) CHECK (DiscountPercent >= 0 AND DiscountPercent <= 100),
        IsActive int not null default 1,
        CONSTRAINT CHK_Coupon_DateRange CHECK (StartDate < EndDate)
    );
END
GO

-- Mã giảm giá của system
IF OBJECT_ID('App.SystemCoupon', 'U') IS NULL
BEGIN
    CREATE TABLE App.SystemCoupon (
        CouponID INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(100) NOT NULL UNIQUE,
        StartDate DATETIME NOT NULL,
        EndDate DATETIME NOT NULL,
        Type NVARCHAR(50),
        DiscountPercent DECIMAL(5,2) CHECK (DiscountPercent >= 0 AND DiscountPercent <= 100),
        IsActive int not null default 1,
        CONSTRAINT CHK_Coupon_DateRange CHECK (StartDate < EndDate)
    );
END
GO

-- join tables for coupon application
IF OBJECT_ID('Sale.ProductCoupon', 'U') IS NULL
BEGIN
    CREATE TABLE Sale.ProductCoupon (
        ProductID INT NOT NULL,
        CouponID INT NOT NULL,
        PRIMARY KEY (ProductID, CouponID),
        CONSTRAINT FK_ProductCoupon_Product FOREIGN KEY (ProductID) REFERENCES Product.Product(ProductID),
        CONSTRAINT FK_ProductCoupon_Coupon FOREIGN KEY (CouponID) REFERENCES App.Coupon(CouponID)
    );
END
GO

IF OBJECT_ID('Sale.OrderCoupon', 'U') IS NULL
BEGIN
    CREATE TABLE Sale.OrderCoupon (
        OrderID INT NOT NULL,
        CouponID INT NOT NULL,
        PRIMARY KEY (OrderID, CouponID),
        CONSTRAINT FK_OrderCoupon_Order FOREIGN KEY (OrderID) REFERENCES Sale.[Order](OrderID) ON DELETE CASCADE,
        CONSTRAINT FK_OrderCoupon_Coupon FOREIGN KEY (CouponID) REFERENCES App.Coupon(CouponID)
    );
END
GO

-- IF OBJECT_ID('Sale.OrderItemCoupon', 'U') IS NULL
-- BEGIN
--     CREATE TABLE Sale.OrderItemCoupon (
--         OrderItemID INT NOT NULL,
--         CouponID INT NOT NULL,
--         PRIMARY KEY (OrderItemID, CouponID),
--         CONSTRAINT FK_OrderItemCoupon_Item FOREIGN KEY (OrderItemID) REFERENCES Sale.OrderItem(OrderItemID) ON DELETE CASCADE,
--         CONSTRAINT FK_OrderItemCoupon_Coupon FOREIGN KEY (CouponID) REFERENCES App.Coupon(CouponID)
--     );
-- END
-- GO

-- Product Reviews (weak entity mapped to product+account)
IF OBJECT_ID('Product.ProductReview', 'U') IS NULL
BEGIN
    CREATE TABLE Product.ProductReview (
        ProductID INT NOT NULL,
        AccountID INT NOT NULL,
        Rating DECIMAL(2,1) NOT NULL CHECK (Rating >= 0.0 AND Rating <= 5.0),
        ReviewDate DATETIME NOT NULL DEFAULT GETDATE(),
        Comment NVARCHAR(2000),
        Moderated BIT NOT NULL DEFAULT 0,
        PRIMARY KEY (ProductID, AccountID),
        CONSTRAINT FK_ProductReview_Product FOREIGN KEY (ProductID) REFERENCES Product.Product(ProductID),
        CONSTRAINT FK_ProductReview_Account FOREIGN KEY (AccountID) REFERENCES [User].Account(AccountID)
    );
END
GO

-- Advertisements & mapping (affiliate -> advertisement -> products)
IF OBJECT_ID('App.Advertisement', 'U') IS NULL
BEGIN
    CREATE TABLE App.Advertisement (
        AdID INT IDENTITY(1,1) PRIMARY KEY,
        AffiliateAccountID INT NOT NULL,
        ProductID INT NOT NULL,
        ImageURL NVARCHAR(1000),
        Budget DECIMAL(14,2) NOT NULL CHECK (Budget > 0),
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        Active BIT NOT NULL DEFAULT 1,
        Content NVARCHAR(2000) NOT NULL,
        CONSTRAINT FK_Advertisement_Affiliate FOREIGN KEY (AffiliateAccountID) REFERENCES [User].Affiliate(AccountID) ON DELETE CASCADE,
        CONSTRAINT FK_Product_Advertisement FOREIGN KEY (ProductID) REFERENCES Product.Product(ProductID) ON DELETE CASCADE
    );
END
GO