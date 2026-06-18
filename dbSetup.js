const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

// 数据库配置 - 请根据实际情况修改
const config = {
  host: 'localhost',
  user: 'root',         // 你的MySQL用户名
  password: '123456', // 你的MySQL密码
  database: 'vue_beidou4'   // 目标数据库名称
};

function readSqlFile(filePath) {
  try {
    let sql = fs.readFileSync(filePath, 'utf8');
    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '') 
             .replace(/--.*$/gm, '') 
             .replace(/\n+/g, ' ') 
             .trim();
    const statements = [];
    let inString = false;
    let currentStatement = '';
    let quoteChar = '';

    for (const char of sql) {
      if (char === "'" || char === '"') {
        if (inString && quoteChar === char) {
          inString = false;
        } else if (!inString) {
          inString = true;
          quoteChar = char;
        }
      }
      if (char === ';' && !inString) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      } else {
        currentStatement += char;
      }
    }
    return statements.filter(Boolean); 
  } catch (error) {
    console.error(`读取SQL文件失败: ${error.message}`);
    return [];
  }
}

function executeSql(connection, statements) {
  return new Promise((resolve, reject) => {
    if (statements.length === 0) return resolve();

    const statement = statements.shift();
    console.log(`执行SQL: ${statement.substring(0, 60)}...`);

    connection.query(statement, (error) => {
      if (error) {
        console.error(`SQL执行错误: ${error.message}`);
        console.error(`错误语句: ${statement}`);
        return reject(error);
      }
      executeSql(connection, statements).then(resolve).catch(reject);
    });
  });
}

async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const serverConn = mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      multipleStatements: true 
    });

    serverConn.connect(error => {
      if (error) {
        console.error(`连接服务器失败: ${error.message}`);
        serverConn.end();
        return reject(error);
      }

      serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``, (error) => {
        serverConn.end(); 
        if (error) {
          console.error(`创建数据库失败: ${error.message}`);
          return reject(error);
        }

        const dbConn = mysql.createConnection({ ...config, multipleStatements: true });
        dbConn.connect(error => {
          if (error) {
            console.error(`连接数据库失败: ${error.message}`);
            dbConn.end();
            return reject(error);
          }

          const sqlPath = path.join(__dirname, 'schema.sql');
          const statements = readSqlFile(sqlPath);

          if (statements.length === 0) {
            dbConn.end();
            return resolve(false);
          }

          executeSql(dbConn, statements)
            .then(() => {
              console.log('数据库初始化成功！');
              dbConn.end();
              resolve(true);
            })
            .catch(error => {
              dbConn.end();
              reject(error);
            });
        });
      });
    });
  });
}

module.exports = { setupDatabase };