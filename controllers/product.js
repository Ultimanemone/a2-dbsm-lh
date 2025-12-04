const { sql, poolPromise } = require('../config/dbConfig');
const productModel = require('../models/productModel');
const { get } = require('../routes/login');

// ============================================================
// 1. Product
// ============================================================

// 1.1 Inserting
async function createProduct(req, res) {
    try {
        await productModel.createProductINDB(req.body);
        res.json({ message: 'Inserting Product Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.2 Updating
async function editProduct(req, res) {
    try {
        await productModel.editProductINDB(req.body);
        res.json({ message: 'Updating Product Successfully' });
    } 
    catch (err) {
        // Bắt lỗi từ TriggerPreventPriceShock nếu có
        res.status(400).send({ message: err.message });
    }
}

// 1.3 Deleting
async function removeProduct(req, res) {
    try {
        const { id } = req.params; // Lấy ID từ URL
        await productModel.removeProductINDB(id);
        res.json({ message: 'Deleting Product Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.4 Get
async function getProducts(req, res) {
    try {
        const products = await productModel.getProductsINDB();
        res.json(products);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

// ============================================================
// 2. Product review
// ============================================================

// 2.1 Inserting
async function createReview(req, res) {
    try {
        await productModel.createReviewINDB(req.body);
        res.json({ message: 'Inserting Product Review Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.2 Update
async function editReview(req, res) {
    try {
        await productModel.editReviewINDB(req.body);
        res.json({ message: 'Updating Product Review Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.3 Delete
async function removeReview(req, res) {
    try {
        const { ProductID, AccountID } = req.query;

        if (!ProductID || !AccountID) {
            return res.status(400).json({ message: "Missing composite key" });
        }

        await productModel.removeReviewINDB(ProductID, AccountID);

        res.json({ message: 'Deleting Product Review Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.4 Get
async function getReviews(req, res) {
    try {
        const reviews = await productModel.getReviewsINDB();
        res.json(reviews);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

// ============================================================
// 3. Category
// ============================================================

// 3.1 Insert
async function createCategory(req, res) {
    try {
        const result = await productModel.createCategoryINDB(req.body);
        
        res.json({ 
            message: 'Inserting Category Successfully!', 
            newCategoryID: result.newCategoryID 
        });
    } 
    catch (err) {
        res.status(400).send({ message: 'Error Insert Category: ' + err.message });
    }
}

// 3.2 Update
async function updateCategory(req, res) {
    try {
        await productModel.updateCategoryINDB(req.body);
        res.json({ message: 'Updating Category Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: 'Error Category: ' + err.message });
    }
}

// 3.3 Delete
async function removeCategory(req, res) {
    try {
        const { id } = req.params; // Lấy ID từ URL
        await productModel.removeCategoryINDB(id);
        res.json({ message: 'Deleting Category Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 3.4 Get
async function getCategory(req, res) {
    try {
        const { id } = req.params; // Lấy ID từ URL
        const result = await productModel.getCategoryINDB(id);
        res.json(result);
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

module.exports = {
    createProduct, editProduct, removeProduct, getProducts,
    createReview, editReview, removeReview, getReviews,
    createCategory, updateCategory, removeCategory, getCategory
};