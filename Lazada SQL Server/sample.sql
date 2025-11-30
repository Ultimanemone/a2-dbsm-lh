USE Lazada
GO

DELETE FROM Product.ProductAdvertisement;
DELETE FROM UserData.AffiliateAdvertisement;
DELETE FROM App.Advertisement;
DELETE FROM Product.ProductReview;
DELETE FROM Sale.OrderItemCoupon;
DELETE FROM Sale.OrderCoupon;
DELETE FROM Sale.ProductCoupon;
DELETE FROM UserData.OrderHistory;
DELETE FROM Sale.Shipment;
DELETE FROM Sale.OrderItem;
DELETE FROM Sale.[Order];
DELETE FROM AppPayment.Cash;
DELETE FROM AppPayment.BankAccount;
DELETE FROM App.CartItem;
DELETE FROM App.Cart;
DELETE FROM Product.WishlistItem;
DELETE FROM UserData.Wishlist;
DELETE FROM UserData.SellerProduct;
DELETE FROM [User].Customer;
DELETE FROM [User].Seller;
DELETE FROM [User].Admin;
DELETE FROM [User].Affiliate;
DELETE FROM UserData.AccountEmail;
DELETE FROM UserData.AccountPhone;
DELETE FROM [User].Account;
DELETE FROM App.Coupon;
DELETE FROM Sale.Shipper;
DELETE FROM App.PaymentMethod;
DELETE FROM Product.Product;
DELETE FROM ProductCategory.PortableSpeakerFeature;
DELETE FROM ProductCategory.Brand;
DELETE FROM ProductCategory.ShippedFrom;
DELETE FROM ProductCategory.WooferSize;
DELETE FROM ProductCategory.Color;
DELETE FROM Product.Category;

DBCC CHECKIDENT ('Product.Category', RESEED, 0);
DBCC CHECKIDENT ('Product.Product', RESEED, 0);
DBCC CHECKIDENT ('App.PaymentMethod', RESEED, 0);
DBCC CHECKIDENT ('Sale.Shipper', RESEED, 0);
DBCC CHECKIDENT ('App.Coupon', RESEED, 0);
DBCC CHECKIDENT ('[User].Account', RESEED, 0);
DBCC CHECKIDENT ('UserData.Wishlist', RESEED, 0);
DBCC CHECKIDENT ('App.Cart', RESEED, 0);
DBCC CHECKIDENT ('Sale.[Order]', RESEED, 0);
DBCC CHECKIDENT ('Sale.Shipment', RESEED, 0);
DBCC CHECKIDENT ('Sale.OrderItem', RESEED, 0);
DBCC CHECKIDENT ('UserData.OrderHistory', RESEED, 0);
DBCC CHECKIDENT ('App.Advertisement', RESEED, 0);

PRINT '--- B??C 2: CHÈN D? LI?U M?I (?Ã S?A L?I STOCK) ---'

-- 1. Category
INSERT INTO Product.Category (Name, Description) VALUES 
(N'Smartphones', N'Latest mobile devices'),
(N'Laptops', N'Notebooks for gaming and office'),
(N'Audio', N'Headphones and Speakers'),
(N'Watches', N'Smartwatches and Analog'),
(N'Cameras', N'DSLR and Mirrorless cameras');
GO

-- 2. Sub-tables Category
INSERT INTO ProductCategory.PortableSpeakerFeature (CategoryID, AFeature) VALUES (3, N'Waterproof IPX7'), (3, N'20-hour Battery');
INSERT INTO ProductCategory.Brand (CategoryID, ABrand) VALUES (1, N'Apple'), (1, N'Samsung'), (2, N'Dell'), (3, N'JBL'), (5, N'Canon');
INSERT INTO ProductCategory.ShippedFrom (CategoryID, ALocation) VALUES (1, N'New York'), (1, N'California');
INSERT INTO ProductCategory.WooferSize (CategoryID, Size) VALUES (3, N'10 inch'), (3, N'Mini');
INSERT INTO ProductCategory.Color (CategoryID, AColor) VALUES (1, N'Black'), (1, N'White');
GO

-- 3. Product
INSERT INTO Product.Product (CategoryID, Name, Price, ImageURL, Status, Stock, Brand) VALUES
(1, N'iPhone 15 Pro Max', 1200.00, 'img/ip15.jpg', 'Available', 100, 'Apple'),    -- ID 1
(1, N'Samsung Galaxy S24', 1000.00, 'img/s24.jpg', 'Available', 50, 'Samsung'), -- ID 2
(2, N'Dell XPS 13', 1500.00, 'img/dell.jpg', 'Available', 20, 'Dell'),          -- ID 3
(3, N'JBL Charge 5', 150.00, 'img/jbl.jpg', 'Available', 200, 'JBL'),           -- ID 4
(5, N'Canon EOS R5', 3500.00, 'img/canon.jpg', 'Available', 10, 'Canon');       -- ID 5 (Stock=10)
GO

-- 4. PaymentMethod
INSERT INTO App.PaymentMethod (Method) VALUES 
(N'Bank Transfer'), (N'Cash'), (N'Credit Card'), (N'PayPal'), (N'Crypto');
GO

-- 5. Shipper
INSERT INTO Sale.Shipper (Name, Phone, Email, Address) VALUES
(N'DHL Express', '0901111111', 'contact@dhl.com', N'Warehouse A'),
(N'FedEx', '0902222222', 'support@fedex.com', N'Warehouse B'),
(N'UPS', '0903333333', 'help@ups.com', N'Warehouse C'),
(N'USPS', '0904444444', 'info@usps.com', N'Warehouse D'),
(N'FastShip Inc.', '0905555555', 'driver@fastship.com', N'Warehouse E');
GO

-- 6. Coupon
INSERT INTO App.Coupon (Code, StartDate, EndDate, Type, DiscountPercent) VALUES
('SUMMER2024', GETDATE(), GETDATE()+30, 'Percent', 10.0),
('WELCOME', GETDATE(), GETDATE()+30, 'Percent', 20.0),
('FREESHIP', GETDATE(), GETDATE()+15, 'Fixed', 100.0), 
('LOYALTY', GETDATE(), GETDATE()+365, 'Percent', 5.0),
('BLACK24', GETDATE(), GETDATE()+7, 'Percent', 50.0);
GO

-- 7. Account
-- Customer
INSERT INTO [User].Account (Username, EmailMain, HashedPassword, AccountType) VALUES 
('john_doe', 'john@mail.com', 'pass1', 'Customer'),      -- ID 1
('jane_smith', 'jane@mail.com', 'pass2', 'Customer'),    -- ID 2
('mike_ross', 'mike@mail.com', 'pass3', 'Customer'),     -- ID 3
('sarah_connor', 'sarah@mail.com', 'pass4', 'Customer'), -- ID 4
('tony_stark', 'tony@mail.com', 'pass5', 'Customer');    -- ID 5

-- Seller
INSERT INTO [User].Account (Username, EmailMain, HashedPassword, AccountType) VALUES 
('apple_off', 'contact@apple.com', 'pass1', 'Seller'),
('samsung_str', 'sales@samsung.com', 'pass2', 'Seller'),
('dell_auth', 'dell@reseller.com', 'pass3', 'Seller'),
('audio_wld', 'jbl@audio.com', 'pass4', 'Seller'),
('camera_hub', 'canon@cam.com', 'pass5', 'Seller');

-- Admin
INSERT INTO [User].Account (Username, EmailMain, HashedPassword, AccountType) VALUES 
('admin_root', 'root@sys.com', 'pass1', 'Admin'),
('hr_manager', 'hr@sys.com', 'pass2', 'Admin'),
('it_support', 'it@sys.com', 'pass3', 'Admin'),
('marketing', 'marketing@sys.com', 'pass4', 'Admin'),
('sales_head', 'sales@sys.com', 'pass5', 'Admin');

-- Affiliate
INSERT INTO [User].Account (Username, EmailMain, HashedPassword, AccountType) VALUES 
('influencer1', 'mark1@ads.com', 'pass1', 'Affiliate'),
('blogger_tc', 'blog@ads.com', 'pass2', 'Affiliate'),
('youtuber_tp', 'yt@ads.com', 'pass3', 'Affiliate'),
('tiktok_str', 'tt@ads.com', 'pass4', 'Affiliate'),
('insta_mdl', 'ig@ads.com', 'pass5', 'Affiliate');
GO

-- 8. Account Subtables
INSERT INTO UserData.AccountEmail (AccountID, Email) VALUES (1, 'john_backup@mail.com');
INSERT INTO UserData.AccountPhone (AccountID, Phone) VALUES (1, '1234567890');
GO

-- 9. Customer Details
INSERT INTO [User].Customer (AccountID, LoyaltyLevel, RewardPoints) VALUES
(1, 'Bronze', 10), (2, 'Silver', 200), (3, 'Gold', 1500), (4, 'Platinum', 5000), (5, 'Bronze', 0);
GO

-- 10. Seller Details
INSERT INTO [User].Seller (AccountID, ShopName, TaxCode, BusinessLicenseNumber, ShopAddress, Rating) VALUES
(6, 'Apple Store', '0101010101', 'BUS-01', 'USA', 4.9),
(7, 'Samsung KR', '0202020202', 'BUS-02', 'Korea', 4.5),
(8, 'Dell Tech', '0303030303', 'BUS-03', 'Texas', 4.8),
(9, 'Audio Paradise', '0404040404', 'BUS-04', 'LA', 4.7),
(10, 'Camera Zone', '0505050505', 'BUS-05', 'Japan', 4.6);
GO

-- 11. Admin Details
INSERT INTO [User].Admin (AccountID, Role, Department) VALUES
(11, 'SuperAdmin', 'Board'), (12, 'Manager', 'HR'), (13, 'Staff', 'IT'), (14, 'Staff', 'Marketing'), (15, 'Manager', 'Sales');
GO

-- 12. Affiliate Details
INSERT INTO [User].Affiliate (AccountID, AffiliateCode, CommissionRate, TotalEarnings) VALUES
(16, 'AFF01', 5.0, 1000.00), (17, 'AFF02', 7.0, 2000.00), (18, 'AFF03', 3.0, 50.00), (19, 'AFF04', 10.0, 5000.00), (20, 'AFF05', 5.0, 0);
GO

-- 13. SellerProduct
INSERT INTO UserData.SellerProduct (SellerAccountID, ProductID) VALUES
(6, 1), (7, 2), (8, 3), (9, 4), (10, 5);
GO

-- 14. Wishlist
INSERT INTO UserData.Wishlist (AccountID, Name) VALUES (1, N'My Dream List');
INSERT INTO Product.WishlistItem (WishlistID, ProductID) VALUES (1, 1);
GO

-- 15. Cart
INSERT INTO App.Cart (AccountID, TotalPrice, TotalAmount) VALUES (1, 1200.00, 1), (2, 2500.00, 2);
INSERT INTO App.CartItem (CartID, ProductID, Quantity, SubTotal) VALUES (1, 1, 1, 1200.00), (2, 2, 2, 2000.00);
GO

-- 16. BankAccount
INSERT INTO AppPayment.BankAccount (BankPmid, OwnerAccountID, BankName, CardType, CardNumber, ExpirationDate) VALUES
(1, 1, 'Chase Bank', 'Debit', '1111222233334444', '2025-12-31');
INSERT INTO AppPayment.Cash (CashPmid, ActualReceivedMoney, MoneyBack, ShipperID) VALUES
(2, 50.00, 0, 1);
GO

-- 17. Order
INSERT INTO Sale.[Order] (AccountID, ShippingAddress, TotalPrice, Status) VALUES
(1, N'New York', 1200.00, 'Delivered'),   -- ID 1
(2, N'Los Angeles', 1000.00, 'Delivered'), -- ID 2
(3, N'Austin', 150.00, 'Shipped'),         -- ID 3
(4, N'Miami', 1500.00, 'Cancelled'),       -- ID 4
(5, N'Seattle', 3500.00, 'Confirmed');     -- ID 5
GO

-- 18. OrderItem
INSERT INTO Sale.OrderItem (OrderID, ProductID, Quantity, SubTotal) VALUES
(1, 1, 1, 1200.00),
(2, 2, 1, 1000.00),
(3, 4, 1, 150.00),
(4, 3, 1, 1500.00),
(5, 5, 1, 3500.00);
GO

-- 19. Shipment
INSERT INTO Sale.Shipment (OrderID, ShipperID, SellerAccountID, DeliveryStartDate, NumberOfProducts, RealDeliveryTime) VALUES
(1, 1, 6, GETDATE()-5, 1, GETDATE()),
(2, 2, 7, GETDATE()-5, 1, GETDATE()),
(3, 3, 9, GETDATE()-1, 1, NULL),
(4, 4, 8, GETDATE(), 1, NULL),
(5, 5, 10, GETDATE(), 1, NULL);
GO

-- 20. OrderHistory
INSERT INTO UserData.OrderHistory (OrderID, CompletionDate, OrderStatus) VALUES
(1, GETDATE(), 'Delivered'),
(2, GETDATE(), 'Delivered'),
(3, NULL, 'Shipped'),
(4, GETDATE(), 'Cancelled'),
(5, NULL, 'Confirmed');
GO

-- 21. Coupons
INSERT INTO Sale.ProductCoupon (ProductID, CouponID) VALUES (1, 1), (2, 2);
INSERT INTO Sale.OrderCoupon (OrderID, CouponID) VALUES (1, 1), (2, 2);
INSERT INTO Sale.OrderItemCoupon (OrderItemID, CouponID) VALUES (1, 1), (2, 2);
GO

-- 22. Review
INSERT INTO Product.ProductReview (ProductID, AccountID, Rating, Comment, Moderated) VALUES
(1, 1, 5.0, N'Excellent product, fast shipping!', 1),
(2, 2, 4.5, N'Good value for money.', 1);
GO

-- 23. Ads
INSERT INTO App.Advertisement (AffiliateAccountID, ImageURL, Budget, Content) VALUES
(16, 'ad1.jpg', 100.00, N'Summer Sale Ad Campaign');
INSERT INTO UserData.AffiliateAdvertisement (AffiliateAccountID, AdID) VALUES (16, 1);
INSERT INTO Product.ProductAdvertisement (AdID, ProductID, SellerAccountID) VALUES (1, 1, 6);
GO