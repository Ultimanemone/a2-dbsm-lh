const paymentModel = require('../models/paymentModel');

// ============================================================
// 1. Cash
// ============================================================

// 1.1 Insert
async function createCash(req, res) {
    try {
        await paymentModel.createCashINDB(req.body);
        res.json({ message: 'Inserting Cash Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.2 Update
async function editCash(req, res) {
    try {
        await paymentModel.editCashINDB(req.body);
        res.json({ message: 'Updating Cash Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}
// 1.3 Delete
async function removeCash(req, res) {
    try {
        const { id } = req.params; // Lấy ID từ URL
        await paymentModel.removeCashINDB(id);
        res.json({ message: 'Deleting Cash Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.4 Get
async function getCash(req, res) {
    try {
        const cashRecords = await paymentModel.getCashINDB();
        res.json(cashRecords);
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// ============================================================
// 2. Bank Account
// ============================================================

// 2.1 Insert
async function createBankAccount(req, res) {
    try {
        await paymentModel.createBankAccountINDB(req.body);
        res.json({ message: 'Inserting Bank Account Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.2 Update
async function editBankAccount(req, res) {
    try {
        await paymentModel.editBankAccountINDB(req.body);
        res.json({ message: 'Updating Bank Account Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.3 Delete
async function removeBankAccount(req, res) {
    try {
        const { id } = req.params; // Lấy ID từ URL
        await paymentModel.removeBankAccountINDB(id);
        res.json({ message: 'Deleting Bank Account Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.4 Get
async function getBankAccount(req, res) {
    try {
        const bankAccountRecords = await paymentModel.getBankAccountINDB();
        res.json(bankAccountRecords);
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

module.exports = {
    createCash, editCash, removeCash, getCash,
    createBankAccount, editBankAccount, removeBankAccount, getBankAccount
};