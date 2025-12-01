const { sql, poolPromise } = require('../config/dbConfig');

const login = async (req, res) => {
    try {
        const {
            username, password 
        } = req.body;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('Username', sql.NVarChar, username)
            .query('SELECT AccountType, Username FROM [User].Account WHERE Username = @Username');

        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, message: 'Username does not exist' });
        }
        
        const user = result.recordset[0];

        return res.status(200).json({
            success: true,
            message: 'Success',
            role: user.AccountType
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