const mysql=require('mysql2')

const db=mysql.createPool({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'vue_beidou4',
    waitForConnections: true,
    connectionLimit: 10,
})

module.exports=db