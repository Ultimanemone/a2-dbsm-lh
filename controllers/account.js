const accountModel = require('../models/accountModel');

// ============================================================
// 1. Customer
// ============================================================

// 1.1 Insert
async function createCustomer(req, res) {
    try {
        const customerData = req.body;

        await accountModel.createCustomerINDB(customerData);

        res.json({ message: 'Creating Customer Successfully' });
    }
    catch (err) {
        res.status(400).send({ message: 'Error: ' + err.message });
    }
}

//1.2 Update
async function editCustomer(req, res) {
    try {
        const customerData = req.body;

        await accountModel.editCustomerINDB(customerData);

        res.json({ message: 'Updating Customer Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

//1.3 Delete
async function removeCustomer(req, res) {
    try {
        const customerData = req.params;

        await accountModel.removeCustomerINDB(customerData);

        res.json({ message: 'Deleting Customer Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

//1.4 Get 
async function getCustomers(req, res) {
    try {
        const data = await accountModel.getCustomersINDB();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// ============================================================
// 2. Seller
// ============================================================

// 2.1 Insert
async function createSeller(req, res) {
    try {
        const sellerData = req.body;

        await accountModel.createSellerINDB(sellerData);

        res.json({ message: 'Create Seller successfully!' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

//2.2 Update
async function editSeller(req, res) {
    try {
        const sellerData = req.body;

        await accountModel.editSellerINDB(sellerData);

        res.json({ message: 'Updating Customer Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

//2.3 Delete
async function removeSeller(req, res) {
    try {
        const sellerData = req.params;

        await accountModel.removeSellerINDB(sellerData);

        res.json({ message: 'Deleting Customer Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

//2.4 Get 
async function getSellers(req, res) {
    try {
        const data = await accountModel.getSellersINDB();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


// ============================================================
// 3. Admin
// ============================================================

// 3.1 Insert
async function createAdmin(req, res) {
    try {
        const adminData = req.body;

        await accountModel.createAdminINDB(adminData);

        res.json({ message: 'Creating Admin Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 3.2 Update
async function editAdmin(req, res) {
    try {
        const adminData = req.body;

        await accountModel.editAdminINDB(adminData);

        res.json({ message: 'Updating Admin Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 3.3 Delete
async function removeAdmin(req, res) {
    try {
        const adminData = req.params;

        await accountModel.removeAdminINDB(adminData);

        res.json({ message: 'Removing Admin Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

//3.4 Get 
async function getAdmins(req, res) {
    try {
        const data = await accountModel.getAdminsINDB();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// ============================================================
// 4. Affiliate
// ============================================================

// 4.1 Insert
async function createAffiliate(req, res) {
    try {
        const affiliateData = req.body;

        await accountModel.createAffiliateINDB(affiliateData);

        res.json({ message: 'Creating Affiliate successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 4.2 Update
async function editAffiliate(req, res) {
    try {
        const affiliateData = req.body;

        await accountModel.editAffiliateINDB(affiliateData);

        res.json({ message: 'Updating Affiliate Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

// 4.3 Delete
async function removeAffiliate(req, res) {
    try {
        const affiliateData = req.params;

        await accountModel.removeAffiliateINDB(affiliateData);

        res.json({ message: 'Deleting Affiliate Successfully' });
    } 
    catch (err) {
        res.status(400).send({ message: err.message });
    }
}

//4.4 Get 
async function getAffiliates(req, res) {
    try {
        const data = await accountModel.getAffiliatesINDB();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

//5 Get ALL Accounts
async function getAccounts(req, res) {
    try {
        const data = await accountModel.getAccountsINDB();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    createAdmin, editAdmin, removeAdmin, getAdmins,
    createAffiliate, editAffiliate, removeAffiliate, getAffiliates,
    createCustomer, editCustomer, removeCustomer, getCustomers,
    createSeller, editSeller, removeSeller, getSellers,
    
    getAccounts
};
