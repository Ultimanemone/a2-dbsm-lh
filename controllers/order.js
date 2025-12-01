const orderModel = require('../models/orderModel');

// ============================================================
// 1. Order
// ============================================================

// 1.1 Insert
async function createOrder(req, res) {
    try {
        await orderModel.createOrderINDB(req.body);
        res.json({ message: 'Inserting Order Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.2 Update
async function editOrder(req, res) {
    try {
        await orderModel.editOrderINDB(req.body);
        res.json({ message: 'Updating Order Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.3 Delete
async function removeOrder(req, res) {
    try {
        const { id } = req.params; // Lấy ID từ URL
        await orderModel.removeOrderINDB(id);
        res.json({ message: 'Deleting Order Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// ============================================================
// 2. OrderHistory
// ============================================================

// 2.1 Insert
async function createOrderHistory(req, res) {
    try {
        await orderModel.createOrderHistoryINDB(req.body);
        res.json({ message: 'Inserting Order History Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.2 Update
async function editOrderHistory(req, res) {
    try {
        await orderModel.editOrderHistoryINDB(req.body);
        res.json({ message: 'Updating OrderHistory Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.3 Delete
async function removeOrderHistory(req, res) {
    try {
        const { id } = req.params; // Lấy ID từ URL
        await orderModel.removeOrderHistoryINDB(id);
        res.json({ message: 'Deleting OrderHistory Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// ============================================================
// 3. Order Item
// ============================================================

async function createOrderItem(req, res) {
    try {
        await orderModel.createOrderItemINDB(req.body);
        // Khi insert xong, Trigger 'trg_OrderItem_Insert_Update_Delete' trong SQL sẽ tự động tính lại tổng tiền.
        res.json({ message: 'Inserting Order Item Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}
// ============================================================
// 4. Cart
// ============================================================

async function UpdateCart(req, res) {
    try {
        await orderModel.updateCartINDB(req.body);
        res.json({ message: 'Updating Cart Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

module.exports = {
    createOrder, editOrder, removeOrder, 
    createOrderHistory, editOrderHistory, removeOrderHistory,
    createOrderItem, 
    UpdateCart
};