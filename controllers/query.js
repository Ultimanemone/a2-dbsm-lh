const queryModel = require('../models/queryModel');
const { sql, poolPromise } = require('../config/dbConfig');

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
        const data = await queryModel.getCustomerLTVINDB();
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

async function getTotalSavings(req, res) {
    const customerId = parseInt(req.params.id);

    if (isNaN(customerId)) {
        return res.status(400).json({ error: "Invalid Customer ID" });
    }

    try {
        // Lấy pool từ poolPromise
        const pool = await poolPromise;

        const result = await pool.request()
            .input("CustomerID", sql.Int, customerId)
            .query(`
                SELECT dbo.fn_TotalSavingsByCustomer(@CustomerID) AS TotalSavings;
            `);

        return res.json({
            customerId,
            totalSavings: result.recordset[0].TotalSavings
        });

    } catch (err) {
        console.error("SQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getSellerRank(req, res) {
    const sellerId = parseInt(req.params.id);

    if (isNaN(sellerId)) {
        return res.status(400).json({ error: "Invalid Seller ID" });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("SellerID", sql.Int, sellerId)
            .query(`
                SELECT dbo.fn_RankSeller(@SellerID) AS SellerRank;
            `);

        return res.json({
            sellerId,
            rank: result.recordset[0].SellerRank
        });

    } catch (err) {
        console.error("SQL Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    getTopShippers,
    getTopShipper, editTopShipper, deleteTopShipper,
    getCustomerLTV,
    getTotalSavings,
    getSellerRank
};