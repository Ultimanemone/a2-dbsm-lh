const getDataModel = require('../models/getDataModel');

// Helper function: Gom nhóm dữ liệu (Group By)
// Dùng để xử lý trường hợp 1 Order có nhiều dòng do join với nhiều Coupon
const groupCoupons = (data, idField, couponFields) => {
    const map = new Map();
    
    data.forEach(row => {
        if (!map.has(row[idField])) {
            // Tạo object gốc (loại bỏ các trường coupon để add sau)
            const { [couponFields.code]: cCode, [couponFields.discount]: cDisc, ...mainData } = row;
            map.set(row[idField], {
                ...mainData,
                Coupons: [] // Tạo mảng chứa coupon
            });
        }
        
        // Nếu dòng này có coupon (CouponCode không null)
        if (row[couponFields.code]) {
            map.get(row[idField]).Coupons.push({
                Code: row[couponFields.code],
                DiscountPercent: row[couponFields.discount],
                Type: row[couponFields.type], // Optional
                EndDate: row[couponFields.endDate] // Optional
            });
        }
    });
    return Array.from(map.values());
};

// [GET] /api/orders/user/:accountId
async function getUserOrders(req, res) {
    try {
        const { accountId } = req.params;
        const rawOrders = await getDataModel.getOrdersByAccountID(accountId);
        
        if (!rawOrders || rawOrders.length === 0) {
            return res.status(200).json({ message: "Chưa có đơn hàng.", data: [] });
        }

        // Xử lý gom nhóm Coupon vào Order
        const groupedOrders = groupCoupons(rawOrders, 'OrderID', {
            code: 'CouponCode',
            discount: 'DiscountPercent',
            type: 'CouponType',
            endDate: 'CouponEndDate'
        });

        res.status(200).json({ 
            message: "Lấy danh sách đơn hàng thành công.", 
            data: groupedOrders 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
}

// [GET] /api/orders/:orderId/items
async function getOrderItems(req, res) {
    try {
        const { orderId } = req.params;
        const rawItems = await getDataModel.getOrderItems(orderId);

        // Xử lý gom nhóm Coupon vào OrderItem
        // Một Item có thể áp dụng nhiều coupon
        const groupedItems = groupCoupons(rawItems, 'OrderItemID', {
            code: 'CouponCode',
            discount: 'DiscountPercent'
        });

        res.status(200).json({ 
            orderId: orderId,
            items: groupedItems 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
}

// [GET] /api/orders/:orderId/shipment
async function getOrderShipment(req, res) {
    try {
        const { orderId } = req.params;
        const shipments = await getDataModel.getShipmentDetails(orderId);

        if (!shipments || shipments.length === 0) {
            return res.status(404).json({ message: "Đơn hàng chưa có thông tin vận chuyển." });
        }

        // Map lại cấu trúc để Shipper nằm gọn trong object (nếu cần đẹp hơn)
        const formattedShipments = shipments.map(s => ({
            ShipmentID: s.ShipmentID,
            DeliveryStartDate: s.DeliveryStartDate,
            RealDeliveryTime: s.RealDeliveryTime,
            NumberOfProducts: s.NumberOfProducts,
            Shipper: {
                ID: s.ShipperID,
                Name: s.ShipperName,
                Phone: s.ShipperPhone,
                Email: s.ShipperEmail
            }
        }));

        res.status(200).json({ data: formattedShipments });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
}

// [GET] /api/shippers/:id
async function getShipper(req, res) {
    try {
        const { id } = req.params;
        const shipper = await getDataModel.getShipperById(id);
        
        if (!shipper) {
            return res.status(404).json({ message: "Không tìm thấy Shipper" });
        }
        
        res.status(200).json({ data: shipper });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
}

module.exports = {
    getUserOrders,
    getOrderItems,
    getOrderShipment,
    getShipper
};