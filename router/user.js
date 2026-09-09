
const Router=require('koa-router')
const userHandle=require('../router_handle/user')
const router=new Router({ prefix: '/api' })
const index=require('../db/index')
const dayjs=require('dayjs')
//这些代码跟设备表，错误信息表有关
router.post('/word',userHandle.addword)
router.get('/select',userHandle.selectword)
router.get('/select_date',userHandle.select_date)
router.post('/user_update',userHandle.user_update)
router.post('/user_delete',userHandle.user_delete)
router.get('/start',userHandle.start)
router.get('/yuyue_insert',(ctx) => {
  console.log('技师',ctx.query)
  const insert_mysql=`INSERT INTO reserve (User_id, start, end, status, file) VALUES (${ctx.query.id}, '${ctx.query.ondata}', '${ctx.query.todata}', '${ctx.query.address}', '${ctx.query.name}');`
  console.log(insert_mysql)
  index.query(insert_mysql,(err,results)=>{
    if(err){
      console.log(err)
    }
  })
})
router.get('/yuyue_select',async (ctx) => {
  const select_mysql=`SELECT * FROM reserve;`
  const results = await new Promise((resolve,rejust)=>{
        index.query(select_mysql,(err,results)=>{
            if(err) rejust(err)
                else resolve(results)
            })
        })
    ctx.body=results
})
router.get('/yuyue_select1',async (ctx) => {
  const select_mysql=`SELECT * FROM reserve where file='测试账号';`
  const results = await new Promise((resolve,rejust)=>{
        index.query(select_mysql,(err,results)=>{
            if(err) rejust(err)
                else resolve(results)
            })
        })
    ctx.body=results
})
router.get('/yyy', async (ctx) => {
  console.log('开始查询用户数据');
  try {
    const results = await new Promise((resolve, reject) => {
      const selectSql = `SELECT * FROM user_data;`;
      
      index.query(selectSql, (err, data) => {
        if (err) {
          console.error('查询出错:', err);
          return reject(err);
        }
        resolve(data); 
      });
    });
    
    ctx.body = ['访问成功', results];
  } catch (error) {
    ctx.status = 500;
    ctx.body = '访问失败';
  }
});

module.exports=router