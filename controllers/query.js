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

module.exports = {
    getTopShippers, getCustomerLTV
};