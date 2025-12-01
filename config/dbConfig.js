const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=Lazada;Trusted_Connection=yes;TrustServerCertificate=yes;',
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server successfully!');
        return pool;
    })
    .catch(err => {
        console.log('Database Connection Failed!', err);
    });

module.exports = {
    sql,
    poolPromise
};