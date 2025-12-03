const { sql, poolPromise } = require('../config/dbConfig');

// 1. Lấy Orders kèm Coupon (dựa trên AccountID)
async function getOrdersByAccountID(accountID) {
    try {
        const pool = await poolPromise;
        // JOIN bảng Order -> OrderCoupon -> Coupon
        const query = `
            SELECT 
                O.OrderID, O.TotalPrice, O.Status, O.ShippingAddress, O.OrderDate,
                C.Code as CouponCode, C.DiscountPercent, C.Type as CouponType, C.EndDate as CouponEndDate
            FROM Sale.[Order] O
            LEFT JOIN Sale.OrderCoupon OC ON O.OrderID = OC.OrderID
            LEFT JOIN App.Coupon C ON OC.CouponID = C.CouponID
            WHERE O.AccountID = @accID
            ORDER BY O.OrderID DESC
        `;
        
        const request = pool.request();
        request.input("accID", sql.Int, accountID);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.log("Error in getOrdersByAccountID:", error);
        throw error;
    }
}

// 2. Lấy OrderItems kèm Coupon của Item đó
async function getOrderItems(orderID) {
    try {
        const pool = await poolPromise;
        // JOIN bảng OrderItem -> OrderItemCoupon -> Coupon
        // JOIN thêm bảng Product để lấy tên sản phẩm
        const query = `
            SELECT 
                I.OrderItemID, I.OrderID, I.Quantity, I.SubTotal,
                P.Name as ProductName, P.Price as UnitPrice, P.ImageURL,
                C.Code as CouponCode, C.DiscountPercent
            FROM Sale.OrderItem I
            JOIN Product.Product P ON I.ProductID = P.ProductID
            LEFT JOIN Sale.OrderItemCoupon IC ON I.OrderItemID = IC.OrderItemID
            LEFT JOIN App.Coupon C ON IC.CouponID = C.CouponID
            WHERE I.OrderID = @ordID
        `;

        const request = pool.request();
        request.input("ordID", sql.Int, orderID);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.log("Error in getOrderItems:", error);
        throw error;
    }
}

// 3. Lấy Shipment kèm thông tin Shipper
async function getShipmentDetails(orderID) {
    try {
        const pool = await poolPromise;
        // JOIN Shipment với Shipper
        const query = `
            SELECT 
                S.ShipmentID, S.DeliveryStartDate, S.RealDeliveryTime, S.NumberOfProducts, S.Status,
                SP.ShipperID, SP.Name as ShipperName, SP.Phone as ShipperPhone, SP.Email as ShipperEmail
            FROM Sale.Shipment S
            JOIN Sale.Shipper SP ON S.ShipperID = SP.ShipperID
            WHERE S.OrderID = @ordID
        `;

        const request = pool.request();
        request.input("ordID", sql.Int, orderID);
        const result = await request.query(query);
        
        // Vì 1 Order có thể có nhiều Shipment (dù thường là 1), ta trả về mảng
        return result.recordset; 
    } catch (error) {
        console.log("Error in getShipmentDetails:", error);
        throw error;
    }
}

// 4. Lấy thông tin Shipper riêng lẻ
async function getShipperById(shipperID) {
    try {
        const pool = await poolPromise;
        const query = `
            SELECT ShipperID, Name, Phone, Email, Address
            FROM Sale.Shipper
            WHERE ShipperID = @id
        `;
        const request = pool.request();
        request.input("id", sql.Int, shipperID);
        const result = await request.query(query);
        return result.recordset[0];
    } catch (error) {
        console.log("Error in getShipperById:", error);
        throw error;
    }
}

module.exports = {
    getOrdersByAccountID,
    getOrderItems,
    getShipmentDetails,
    getShipperById
};