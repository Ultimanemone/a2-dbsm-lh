const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const controller = require('./controllers');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());


app.get("/api/tables", async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const result = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM dbo.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);

        const tables = result.recordset.map(r => r.TABLE_NAME);
        res.json(tables);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching tables");
    }
});

// ===================== 1. ACCOUNT =====================
app.post('/api/login', controller.login);

// Customer
app.post('/api/customer', controller.createCustomer);
app.put('/api/customer', controller.editCustomer);
app.delete('/api/customer/:id', controller.removeCustomer);

// Seller
app.post('/api/seller', controller.createSeller);
app.put('/api/seller', controller.editSeller);
app.delete('/api/seller/:id', controller.removeSeller);

// Admin
app.post('/api/admin', controller.createAdmin);
app.put('/api/admin', controller.editAdmin);
app.delete('/api/admin/:id', controller.removeAdmin);

// Affiliate
app.post('/api/affiliate', controller.createAffiliate);
app.put('/api/affiliate', controller.editAffiliate);
app.delete('/api/affiliate/:id', controller.removeAffiliate);


// ===================== 2. PRODUCT & CATEGORY =====================
// Category
app.post('/api/category', controller.createCategory); 
app.put('/api/category', controller.updateCategory);
app.delete('/api/category/:id', controller.removeCategory);

// Product
app.post('/api/product', controller.createProduct);
app.put('/api/product', controller.editProduct);
app.delete('/api/product/:id', controller.removeProduct);

// Review
app.post('/api/review', controller.createReview);
app.put('/api/review', controller.editReview);
app.delete('/api/review', controller.removeReview);

// ===================== 3. ORDER & CART =====================
// Order
app.post('/api/order', controller.createOrder);
app.put('/api/order', controller.editOrder);
app.delete('/api/order/:id', controller.removeOrder);

// Order History
app.post('/api/order-history', controller.createOrderHistory);
app.put('/api/order-history', controller.editOrderHistory);
app.delete('/api/order-history/:id', controller.removeOrderHistory);

// Order Item
app.post('/api/order-item', controller.createOrderItem);

// Cart
app.put('/api/cart', controller.UpdateCart);

// ===================== 4. PAYMENT & SHIPPING =====================
// Shipper
app.post('/api/shipper', controller.createShipper);
app.put('/api/shipper', controller.editShipper);
app.delete('/api/shipper/:id', controller.removeShipper);

// Shipment
app.post('/api/shipment', controller.createShipment);
app.put('/api/shipment', controller.updateShipmentStatus);
app.delete('/api/shipment', controller.removeShipment);

// Payment: Cash
app.post('/api/payment/cash', controller.createCash);
app.put('/api/payment/cash', controller.editCash);
app.delete('/api/payment/cash/:id', controller.removeCash);

// Payment: Bank Account
app.post('/api/payment/bank', controller.createBankAccount);
app.put('/api/payment/bank', controller.editBankAccount);
app.delete('/api/payment/bank/:id', controller.removeBankAccount);


// ===================== 5. MARKETING =====================
// Wishlist
app.post('/api/wishlist', controller.createWishList);
app.put('/api/wishlist', controller.editWishList);
app.delete('/api/wishlist/:id', controller.removeWishList);
app.post('/api/wishlist/product', controller.addProductToWishlist);
app.delete('/api/wishlist/product', controller.removeProductFromWishlist);

// Coupon
app.post('/api/coupon', controller.createCoupon);
app.put('/api/coupon', controller.editCoupon);
app.delete('/api/coupon/:id', controller.removeCoupon);

app.post('/api/coupon/product', controller.addProductCoupon);
app.delete('/api/coupon/product', controller.removeProductCoupon);

app.post('/api/order/coupon', controller.addOrderCoupon);
app.delete('/api/order/coupon', controller.removeOrderCoupon);

app.post('/api/order-item/coupon', controller.addOrderItemCoupon);
app.delete('/api/order-item/coupon', controller.removeOrderItemCoupon);

app.post('/api/advertisement', controller.createAdvertisement);
app.put('/api/advertisement', controller.updateAdvertisment); 
app.delete('/api/advertisement/:id', controller.removeAdvertisment);

app.post('/api/advertisement/product', controller.createProductAdvertisment);
app.delete('/api/advertisement/product', controller.removeProductAdvertisment);


// ===================== 6. STATISTICS =====================
app.get('/api/stats/top-shipper', controller.getTopShippers);
app.get('/api/stats/customer-ltv', controller.getCustomerLTV);


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});