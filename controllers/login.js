const { sql, poolPromise } = require('../config/dbConfig');

const login = async (req, res) => {
    try {
        const {
            username, password 
        } = req.body;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('Username', sql.NVarChar, username)
            .input('Password', sql.NVarChar, password)
            .query(`
                SELECT AccountType, Username, AccountID
                FROM [User].Account 
                WHERE (Username = @Username OR EmailMain = @Username) AND HashedPassword = @Password
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, message: 'Incorrect username or password' });
        }
        
        const user = result.recordset[0];

        return res.status(200).json({
            success: true,
            message: 'Success',
            role: user.AccountType,
            accountID: user.AccountID
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error', error: error.message });
    }
}

module.exports = {
    login
}