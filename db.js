
const sql = require("mssql/msnodesqlv8");

const config = {
    server: "localhost\\SQLEXPRESS",
    database: "AuthDB",
    driver: "ODBC Driver 18 for SQL Server",
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("Connected to SQL Server successfully!");
        return pool;
    })
    .catch(err => {
        console.error("Database connection failed:", err.message);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};
