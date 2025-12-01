const { sql, poolPromise } = require('../config/dbConfig');

// ============================================================
// 1. Shipper
// ============================================================

// 1.1 Insert
async function createShipper(req, res) {
    try {
        await shipmentModel.createShipperINDB(req.body);
        res.json({ message: 'Inserting Shipper Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.2 Update
async function editShipper(req, res) {
    try {
        await shipmentModel.editShipperINDB(req.body);
        res.json({ message: 'Updating Shipper Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.3 Deleting
async function removeShipper(req, res) {
    try {
        const { id } = req.params; // Lấy ID từ URL
        await shipmentModel.removeShipperINDB(id);
        res.json({ message: 'Deleting Shipper Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// ============================================================
// 2. Shipment
// ============================================================

// 2.1 Insert
async function createShipment(req, res) {
    try {
        await shipmentModel.createShipmentINDB(req.body);
        res.json({ message: 'Inserting Shipment Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.2 Update
async function updateShipmentStatus(req, res) {
    try {
        await shipmentModel.updateShipmentStatusINDB(req.body);
        res.json({ message: 'Updating Shipment Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.3 Delete
async function removeShipment(req, res) {
    try {
        // Shipment dùng Composite Key (ShipperID + OrderID) nên lấy từ body
        await shipmentModel.removeShipmentINDB(req.body);
        res.json({ message: 'Deleting Shipment Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

module.exports = {
    createShipper, editShipper, removeShipper,
    createShipment, updateShipmentStatus, removeShipment
};