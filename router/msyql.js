const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// 数据库配置 - 请根据你的MySQL服务修改
const config = {
    host: 'localhost',
    user: 'root',         // 你的MySQL用户名
    password: '123456', // 你的MySQL密码
    database: 'vue_liao',  // 要创建的数据库名称
    port: 3306
};

// 读取SQL文件内容
function readSqlFile() {
    const sqlPath = path.join(__dirname, 'schema.sql');
    return fs.readFileSync(sqlPath, 'utf8');
}

// 初始化数据库
function setupDatabase(callback) {
    // 1. 先连接到MySQL服务器（不指定数据库）
    const connection = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port
    });

    connection.connect((err) => {
        if (err) {
            console.error('连接MySQL服务器失败:', err.message);
            return callback(err);
        }

        console.log('成功连接到MySQL服务器');

        // 2. 创建数据库（如果不存在）
        connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`, (err) => {
            if (err) {
                console.error('创建数据库失败:', err.message);
                connection.end();
                return callback(err);
            }

            console.log(`数据库 ${config.database} 已准备就绪`);

            // 3. 连接到目标数据库
            const dbConnection = mysql.createConnection({
                ...config,
                database: config.database
            });

            dbConnection.connect((err) => {
                if (err) {
                    console.error('连接到目标数据库失败:', err.message);
                    dbConnection.end();
                    return callback(err);
                }

                console.log(`成功连接到数据库 ${config.database}`);

                // 4. 读取并执行建表语句
                const sql = readSqlFile();
                dbConnection.query(sql, (err) => {
                    dbConnection.end();
                    
                    if (err) {
                        console.error('执行建表语句失败:', err.message);
                        return callback(err);
                    }

                    console.log('所有表创建成功');
                    callback(null, true);
                });
            });
        });
    });
}

module.exports = { setupDatabase };
    