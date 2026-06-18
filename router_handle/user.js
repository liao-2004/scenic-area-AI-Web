const index=require('../db/index')
const dayjs=require('dayjs')
const { fields } = require('../db/multer')

exports.addword=(ctx)=>{
    const userinfo=ctx.request.body
    const userdata={
        device_name:userinfo.device_name,
        number:userinfo.number,
        value1:userinfo.value1,
        value2:userinfo.value2,
        value3:userinfo.value3,
        c_time:dayjs().format('YYYY-MM-DD HH-mm-ss')
    }
    console.log(userdata)
    const mysql_insert=`insert into t_device set ?`
    index.query(mysql_insert,userdata,(err,results)=>{
        if(err) console.log(err)
    })
}
exports.selectword=async(ctx)=>{
    const offset=parseInt(ctx.query.index,10)||0
    // 搜索：field=id|nickname|dianhua，keyword 为关键字（编号精确，姓名/电话模糊）
    const field=ctx.query.field
    const keyword=(ctx.query.keyword||'').trim()
    let where=''
    const params=[]
    if(keyword){
        if(field==='id'){
            where='where id = ?'
            params.push(keyword)
        }else if(field==='nickname'){
            where='where nickname like ?'
            params.push(`%${keyword}%`)
        }else if(field==='dianhua'){
            where='where dianhua like ?'
            params.push(`%${keyword}%`)
        }
    }
    const mysql=`select id,open_id as no,nickname as username,createdAt as time,dianhua from user ${where} order by id asc limit 9 OFFSET ?`
    params.push(offset)
    const results = await new Promise((resolve,reject)=>{
        index.query(mysql,params,(err,results)=>{
            if(err) reject(err)
                else resolve(results)
            })
        })
    ctx.body=results
}



exports.updataword=async(ctx)=>{
    const mysql_updata=`update t_device set ? where id= ?`
    const formData=ctx.request.body
    const userdata={
        id:formData.formData.id,
        device_name:formData.formData.shebeiData,
        remarks:formData.formData.bianhaoData,
        ctime:formData.formData.timeData,
        number:formData.formData.numberData
    }
    const results=await new Promise((resolve,reject)=>{
        index.query(mysql_updata,[userdata,userdata.id],(err,results)=>{
        if(err)return reject(err.message)
        if(results.affectedRows===1) resolve('更新成功')
     })
    })
    ctx.body=results
}

exports.yieindex=async(ctx)=>{
    const count0=ctx.query.index
    console.log(count0)
    const count = parseInt(count0, 10);
    const mysql_indexselect=`select id,device_name,remarks,date_format(ctime,'%Y-%m-%d %H:%i') as c_time,number from t_device limit 5 OFFSET ?`
    const results=await new Promise((resolve,reject)=>{
        index.query(mysql_indexselect,count,(err,result)=>{
        if(err)return reject(err.message)
        resolve(results)
     })
    })
    ctx.body=results
}

exports.stop=async(ctx)=>{
    const t_value=ctx.query.t_value
    const time=ctx.query.time
    console.log(t_value,time)
    const result_select=await new Promise((resolve,reject)=>{
        index.query(`select avg(field1) as field1,avg(field2) as field2,avg(field3) as field3,avg(field4) as field4,avg(field5) as field5,avg(field6) as field6,avg(field7) as field7 FROM t_data WHERE d_no = ${t_value} and c_time>'${time}';`,(err,result)=>{
        if(err)return reject(err)
        resolve(result)
     })})
     console.log(`select avg(field1) as field1,avg(field2) as field2,avg(field3) as field3,avg(field4) as field4,avg(field5) as field5,avg(field6) as field6,avg(field7) as field7 FROM t_data WHERE d_no = ${t_value} and c_time>'${time}';`)
     console.log(result_select)
    ctx.body=''
}
exports.start=async(ctx)=>{
    const select_count1=`SELECT 
        period,
        COUNT(*) AS record_count
        FROM (
        SELECT 
            t1.*,
            CASE 
            WHEN HOUR(t1.time) BETWEEN 6 AND 11 THEN '6点-10点'
            WHEN HOUR(t1.time) BETWEEN 12 AND 13 THEN '10点-14点'
            WHEN HOUR(t1.time) BETWEEN 14 AND 16 THEN '14点-18点'
            WHEN HOUR(t1.time) BETWEEN 17 AND 18 THEN '18点-22点'
            ELSE '其他时间段'
            END AS period
        FROM user_data t1
        INNER JOIN (
            SELECT 
            no, 
            MIN(time) AS first_time
            FROM user_data
            WHERE time BETWEEN '${dayjs().subtract(2, 'day').format('YYYY-MM-DD')}' AND '${dayjs().subtract(1, 'day').format('YYYY-MM-DD')}'
            GROUP BY no
        ) t2 ON t1.no = t2.no AND t1.time = t2.first_time
        ) AS earliest_records_with_period
        GROUP BY period
        ORDER BY 
        CASE period 
            WHEN '6点-10点' THEN 1
            WHEN '10点-14点' THEN 2
            WHEN '14点-18点' THEN 3
            WHEN '18点-22点' THEN 4
            ELSE 5
        END;`
    const select_count2=`SELECT 
        period,
        COUNT(*) AS record_count
        FROM (
        SELECT 
            t1.*,
            CASE 
            WHEN HOUR(t1.time) BETWEEN 6 AND 11 THEN '6点-10点'
            WHEN HOUR(t1.time) BETWEEN 12 AND 13 THEN '10点-14点'
            WHEN HOUR(t1.time) BETWEEN 14 AND 16 THEN '14点-18点'
            WHEN HOUR(t1.time) BETWEEN 17 AND 18 THEN '18点-22点'
            ELSE '其他时间段'
            END AS period
        FROM user_data t1
        INNER JOIN (
            SELECT 
            no, 
            MIN(time) AS first_time
            FROM user_data
            WHERE time BETWEEN '${dayjs().subtract(3, 'day').format('YYYY-MM-DD')}' AND '${dayjs().subtract(2, 'day').format('YYYY-MM-DD')}'
            GROUP BY no
        ) t2 ON t1.no = t2.no AND t1.time = t2.first_time
        ) AS earliest_records_with_period
        GROUP BY period
        ORDER BY 
        CASE period 
            WHEN '6点-10点' THEN 1
            WHEN '10点-14点' THEN 2
            WHEN '14点-18点' THEN 3
            WHEN '18点-22点' THEN 4
            ELSE 5
        END;`
    const select_count3=`SELECT 
        period,
        COUNT(*) AS record_count
        FROM (
        SELECT 
            t1.*,
            CASE 
            WHEN HOUR(t1.time) BETWEEN 6 AND 11 THEN '6点-10点'
            WHEN HOUR(t1.time) BETWEEN 12 AND 13 THEN '10点-14点'
            WHEN HOUR(t1.time) BETWEEN 14 AND 16 THEN '14点-18点'
            WHEN HOUR(t1.time) BETWEEN 17 AND 18 THEN '18点-22点'
            ELSE '其他时间段'
            END AS period
        FROM user_data t1
        INNER JOIN (
            SELECT 
            no, 
            MIN(time) AS first_time
            FROM user_data
            WHERE time BETWEEN '${dayjs().subtract(4, 'day').format('YYYY-MM-DD')}' AND '${dayjs().subtract(3, 'day').format('YYYY-MM-DD')}'
            GROUP BY no
        ) t2 ON t1.no = t2.no AND t1.time = t2.first_time
        ) AS earliest_records_with_period
        GROUP BY period
        ORDER BY 
        CASE period 
            WHEN '6点-10点' THEN 1
            WHEN '10点-14点' THEN 2
            WHEN '14点-18点' THEN 3
            WHEN '18点-22点' THEN 4
            ELSE 5
        END;`
    const select_count4=`SELECT 
        period,
        COUNT(*) AS record_count
        FROM (
        SELECT 
            t1.*,
            CASE 
            WHEN HOUR(t1.time) BETWEEN 6 AND 11 THEN '6点-10点'
            WHEN HOUR(t1.time) BETWEEN 12 AND 13 THEN '10点-14点'
            WHEN HOUR(t1.time) BETWEEN 14 AND 16 THEN '14点-18点'
            WHEN HOUR(t1.time) BETWEEN 17 AND 18 THEN '18点-22点'
            ELSE '其他时间段'
            END AS period
        FROM user_data t1
        INNER JOIN (
            SELECT 
            no, 
            MIN(time) AS first_time
            FROM user_data
            WHERE time BETWEEN '${dayjs().subtract(5, 'day').format('YYYY-MM-DD')}' AND '${dayjs().subtract(4, 'day').format('YYYY-MM-DD')}'
            GROUP BY no
        ) t2 ON t1.no = t2.no AND t1.time = t2.first_time
        ) AS earliest_records_with_period
        GROUP BY period
        ORDER BY 
        CASE period 
            WHEN '6点-10点' THEN 1
            WHEN '10点-14点' THEN 2
            WHEN '14点-18点' THEN 3
            WHEN '18点-22点' THEN 4
            ELSE 5
        END;`
    const result_select1=await new Promise((resolve,reject)=>{
        index.query(select_count1,(err,result)=>{
        if(err)return reject(err)
        resolve(result)
     })})
     const result_select2=await new Promise((resolve,reject)=>{
        index.query(select_count2,(err,result)=>{
        if(err)return reject(err)
        resolve(result)
     })})
     const result_select3=await new Promise((resolve,reject)=>{
        index.query(select_count3,(err,result)=>{
        if(err)return reject(err)
        resolve(result)
     })})
     const result_select4=await new Promise((resolve,reject)=>{
        index.query(select_count4,(err,result)=>{
        if(err)return reject(err)
        resolve(result)
     })})
     const count=`SELECT COUNT(*) AS total_distinct_no
        FROM (
        SELECT no
        FROM user_data
        WHERE time BETWEEN '${dayjs().subtract(1, 'day').format('YYYY-MM-DD')}' AND '${dayjs().subtract(0, 'day').format('YYYY-MM-DD')}'
        GROUP BY no
        ) AS grouped_no;`
     // 近7天每天的去重旅客人数（旅客人数统计折线图数据）
     const dayKeys=[]
     const dayLabels=[]
     for(let i=7;i>=1;i--){
        dayKeys.push(dayjs().subtract(i,'day').format('YYYY-MM-DD'))
        dayLabels.push(dayjs().subtract(i,'day').format('MM月DD日'))
     }
     const img2_rows=await new Promise((resolve,reject)=>{
        index.query(`SELECT DATE(time) AS day, COUNT(DISTINCT no) AS cnt
            FROM user_data
            WHERE time >= '${dayKeys[0]}'
            GROUP BY DATE(time);`,(err,result)=>{
        if(err)return reject(err)
        resolve(result)
     })})
     const countMap={}
     img2_rows.forEach(row=>{
        countMap[dayjs(row.day).format('YYYY-MM-DD')]=row.cnt
     })
     const img2_data=dayKeys.map(k=>countMap[k]||0)
     console.log({
        value1:result_select1,
        value2:result_select2,
        value3:result_select3,
        value4:result_select4
     },'==============================',select_count4)
    ctx.body={
        img1:[
            result_select1,
            result_select2,
            result_select3,
            result_select4
        ],
        img2:{
            list:dayLabels,
            data:img2_data
        }
     }
}

// 下载今日入园旅客信息：user_data 中今日 dwzl=1 的记录判定为“入园”，
// 取这些去重后的 no 关联 user 表（user.id = user_data.no），
// 返回旅客基本信息及今日首次入园时间
exports.select_date=async(ctx)=>{
    const today=dayjs().format('YYYY-MM-DD')
    // 子查询：今日（按日期）dwzl=1 的去重旅客编号及其今日最早入园时间
    const mysql=`
        SELECT
            u.nickname AS username,
            u.id       AS no,
            u.dianhua  AS dianhua,
            d.enter_time AS time
        FROM (
            SELECT no, MIN(time) AS enter_time
            FROM user_data
            WHERE DATE(time) = ? AND dwzl = 1
            GROUP BY no
        ) d
        INNER JOIN user u ON u.id = d.no
        ORDER BY d.enter_time ASC`
    const results = await new Promise((resolve, reject) => {
        index.query(mysql, [today], (err, result) => {
            if (err) return reject(err.message);
            resolve(result);
        });
    });

    ctx.body = results;
}

// 编辑用户：更新昵称、电话
exports.user_update=async(ctx)=>{
    const { id, nickname, dianhua }=ctx.request.body||{}
    if(!id){
        ctx.body={ code:1, message:'缺少 id 参数' }
        return
    }
    try{
        const now=dayjs().format('YYYY-MM-DD HH:mm:ss')
        await new Promise((resolve,reject)=>{
            index.query(
                'update user set nickname=?, dianhua=?, updatedAt=? where id=?',
                [nickname||null, dianhua||null, now, id],
                (err,result)=>{ if(err) reject(err); else resolve(result) }
            )
        })
        ctx.body={ code:0, message:'更新成功' }
    }catch(err){
        console.error('更新用户失败:', err.message)
        ctx.status=500
        ctx.body={ code:1, message:'更新失败' }
    }
}

// 删除用户
exports.user_delete=async(ctx)=>{
    const { id }=ctx.request.body||{}
    if(!id){
        ctx.body={ code:1, message:'缺少 id 参数' }
        return
    }
    try{
        await new Promise((resolve,reject)=>{
            index.query('delete from user where id=?',[id],(err,result)=>{
                if(err) reject(err); else resolve(result)
            })
        })
        ctx.body={ code:0, message:'删除成功' }
    }catch(err){
        console.error('删除用户失败:', err.message)
        ctx.status=500
        ctx.body={ code:1, message:'删除失败' }
    }
}