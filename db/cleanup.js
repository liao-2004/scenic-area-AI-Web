//弃用
const index = require('./index')
const dayjs = require('dayjs')

const EXPIRE_MINUTES = 30        
const RUN_INTERVAL = 60 * 1000     // 每分钟执行一次清理

function cleanupOnce() {
    // 删除 time 半小时前 的记录
    const threshold = dayjs().subtract(EXPIRE_MINUTES, 'minute').format('YYYY-MM-DD HH:mm:ss')
    index.query('DELETE FROM user_data WHERE time < ?', [threshold], (err, result) => {
        if (err) {
            console.error('[cleanup] 清理 user_data 失败:', err.message)
            return
        }
        if (result.affectedRows > 0) {
            console.log(`[cleanup] 已删除 ${result.affectedRows} 条过期坐标(早于 ${threshold})`)
        }
    })
}

function startCleanup() {
    cleanupOnce()
    const timer = setInterval(cleanupOnce, RUN_INTERVAL)
    if (timer.unref) timer.unref() 
    console.log(`[cleanup] user_data 过期清理已启动：每 ${RUN_INTERVAL / 1000}s 清理一次，保留最近 ${EXPIRE_MINUTES} 分钟数据`)
    return timer
}

module.exports = { startCleanup, cleanupOnce }
