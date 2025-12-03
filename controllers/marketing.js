const marketingModel = require('../models/marketingModel');

// ============================================================
// 1. Advertisement
// ============================================================

// 1.1 Insert
async function createAdvertisement(req, res) {
    try {
        await marketingModel.createAdvertisementINDB(req.body);
        res.json({ message: 'Inserting Advertisement Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.2 Update
async function updateAdvertisement(req, res) {
    try {
        await marketingModel.updateAdvertisementINDB(req.body);
        res.json({ message: 'Updating Advertisement Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.3 Delete
async function removeAdvertisement(req, res) {
    try {
        const { id } = req.params; 
        await marketingModel.deleteAdvertisementINDB(id);
        res.json({ message: 'Deleting Advertisement Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 1.4 Get
async function getAdvertisement(req, res) {
    try {
        const advertisements = await marketingModel.getAdvertisementINDB();
        res.json(advertisements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// ============================================================
// 2. Product Advertisment
// ============================================================

// 2.1 Insert
async function createProductAdvertisement(req, res) {
    try {
        await marketingModel.addProductToAdvertisementINDB(req.body);
        res.json({ message: 'Inserting Product Advertisement Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 2.2 Delete
async function removeProductAdvertisement(req, res) {
    try {
        await marketingModel.removeProductFromAdvertisementINDB(req.body);
        res.json({ message: 'Deleting Product Advertisement Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// ============================================================
// 3. Whistlist
// ============================================================

// 3.1 Insert
async function createWishList(req, res) {
    try {
        await marketingModel.createWishListINDB(req.body);
        res.json({ message: 'Inserting WishListing Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 3.2 Update
async function editWishList(req, res) {
    try {
        await marketingModel.updateWishListINDB(req.body);
        res.json({ message: 'Updating Wishlist Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 3.3 Delete
async function removeWishList(req, res) {
    try {
        const { id } = req.params;
        await marketingModel.deleteWishListINDB(id);
        res.json({ message: 'Deleting Wishlist Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 3.4 Get
async function getWishList(req, res) {
    try {
        const wishlists = await marketingModel.getWishListINDB();
        res.json(wishlists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// ============================================================
// 4. Whistlist Contain Product
// ============================================================

// 4.1 Insert
async function addProductToWishlist(req, res) {
    try {
        await marketingModel.addProductToWishlistINDB(req.body);
        res.json({ message: 'Inserting Wishlist Product Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 4.2 Delete
async function removeProductFromWishlist(req, res) {
    try {
        await marketingModel.removeProductFromWishlistINDB(req.body);
        res.json({ message: 'Deleting Wishlist Product Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// ============================================================
// 5. Coupon
// ============================================================

// 5.1 Insert
async function createCoupon(req, res) {
    try {
        await marketingModel.createCouponINDB(req.body);
        res.json({ message: 'Inserting Coupon Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 5.2 Update
async function editCoupon(req, res) {
    try {
        await marketingModel.updateCouponINDB(req.body);
        res.json({ message: 'Updating Coupon Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 5.3 Delete
async function removeCoupon(req, res) {
    try {
        const { id } = req.params;
        await marketingModel.deleteCouponINDB(id);
        res.json({ message: 'Deleting Coupon Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}
// ============================================================
// 6. Product Has Coupon
// ============================================================

// 6.1 Insert
async function addProductCoupon(req, res) {
    try {
        const { ProductID, CouponID } = req.body;
        await marketingModel.manageCouponRelation('insertProductHasCoupon', { ProductID, CouponID });
        res.json({ message: 'Applied Coupon Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 6.2 Delete
async function removeProductCoupon(req, res) {
    try {
        const { ProductID, CouponID } = req.body;
        await marketingModel.manageCouponRelation('deleteProductHasCoupon', { ProductID, CouponID });
        res.json({ message: 'Removed Coupon from Product' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// ============================================================
// 7. OrderCoupon
// ============================================================

// 7.1 Insert
async function addOrderCoupon(req, res) {
    try {
        const { OrderID, CouponID } = req.body;
        await marketingModel.manageCouponRelation('insertOrderCoupon', { OrderID, CouponID });
        res.json({ message: 'Applied Coupon Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 7.2 Remove
async function removeOrderCoupon(req, res) {
    try {
        const { OrderID, CouponID } = req.body;
        await marketingModel.manageCouponRelation('deleteOrderCoupon', { OrderID, CouponID });
        res.json({ message: 'Remove Coupon Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}
// ============================================================
// 8 Order Item Has Coupon
// ============================================================

// 8.1 Insert
async function addOrderItemCoupon(req, res) {
    try {
        const { OrderItemID, CouponID } = req.body;
        await marketingModel.manageCouponRelation('insertOrderItemHasCoupon', { OrderItemID, CouponID });
        res.json({ message: 'Applied Coupon Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 8.2 Remove
async function removeOrderItemCoupon(req, res) {
    try {
        const { OrderItemID, CouponID } = req.body;
        await marketingModel.manageCouponRelation('deleteOrderItemHasCoupon', { OrderItemID, CouponID });
        res.json({ message: 'Remove Coupon Successfully' });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}

module.exports = {
    createAdvertisement, updateAdvertisement, removeAdvertisement, getAdvertisement,
    createProductAdvertisement, removeProductAdvertisement,
    createWishList, editWishList, removeWishList, getWishList,
    addProductToWishlist, removeProductFromWishlist,
    createCoupon, editCoupon, removeCoupon,
    addProductCoupon, removeProductCoupon,
    addOrderCoupon, removeOrderCoupon,
    addOrderItemCoupon, removeOrderItemCoupon
};