// 定时清理 user_data 表中过期坐标数据
// time 列为 varchar，存储格式 'YYYY-MM-DD HH:mm:ss'，用同格式字符串比较最稳妥
const index = require('./index')
const dayjs = require('dayjs')

const EXPIRE_MINUTES = 30          // 超过 30 分钟的数据视为过期
const RUN_INTERVAL = 60 * 1000     // 每分钟执行一次清理

function cleanupOnce() {
    // 删除 time 早于 (现在 - 30 分钟) 的记录
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

// 启动定时清理：先立即跑一次，再按间隔循环
function startCleanup() {
    cleanupOnce()
    const timer = setInterval(cleanupOnce, RUN_INTERVAL)
    if (timer.unref) timer.unref() // 不阻止进程退出
    console.log(`[cleanup] user_data 过期清理已启动：每 ${RUN_INTERVAL / 1000}s 清理一次，保留最近 ${EXPIRE_MINUTES} 分钟数据`)
    return timer
}

module.exports = { startCleanup, cleanupOnce }
