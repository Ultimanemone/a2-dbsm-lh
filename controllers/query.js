const queryModel = require('../models/queryModel');

// ============================================================
// 1. Query
// ============================================================

async function getTopShippers(req, res) {
    try {
        const data = await queryModel.getTopShippersINDB();
        res.json(data);

        // res.json({
        //     message: 'Success',
        //     total: data ? data.length : 0,
        //     data: data || []
        // });
    } 
    catch (err) {
        res.status(500).send({ 
            message: 'Error fetching Top Shippers', 
            error: err.message 
        });
    }
}

async function getTopShipper(req, res) {
    try {
        const { ShipperID, ShipperName, Phone, SuccessfulDeliveries } = req.query;

        const data = await queryModel.getTopShipper({
            ShipperID: ShipperID ? Number(ShipperID) : null,
            ShipperName: ShipperName || null,
            Phone: Phone || null,
            SuccessfulDeliveries: SuccessfulDeliveries || null
        });

        res.json(data);
    } catch (err) {
        console.error("Error fetching statisticTopShipper", err);
        res.status(500).json({ message: "Server error" });
    }
}

async function editTopShipper(req, res) {
    try {
        const data = req.body;
        await queryModel.editTopShipper(data);

        res.json({ message: 'Top Shipper updated successfully' });
    } catch (err) {
        console.error("Error updating topShipper", err);
        res.status(500).json({ message: "Error deleting topShipper: " + err.message});
    }
}

async function deleteTopShipper(req, res) {
    try {
        const data = req.params;

        await queryModel.deleteTopShipper(data);

        res.json({ message: 'Top Shipper deleted successfully' });
    } catch (err) {
        console.error("Error deleting topShipper", err);
        res.status(500).json({ message: "Error deleting topShipper: " + err.message});
    }
}
        


async function getCustomerLTV(req, res) {
    try {
        const { CustomerID } = req.query;
        const data = await queryModel.getCustomerLTVINDB(CustomerID);
        res.json(data);

        // res.json({
        //     message: 'Success',
        //     total: data ? data.length : 0,
        //     data: data || []
        // });
    } 
    catch (err) {
        res.status(500).send({ 
            message: 'Error fetching Customer LTV', 
            error: err.message 
        });
    }
}

async function getOrderDetails(req, res) {
    try {
        const data = await queryModel.getOrderWithDetails();
        res.json(data);
    } 
    catch (err) {
        res.status(500).send({ 
            message: 'Error fetching Order details', 
            error: err.message 
        });
    }
}


module.exports = {
    getTopShippers,
    getTopShipper, editTopShipper, deleteTopShipper,
    getCustomerLTV,
    getOrderDetails
};