// 引入依赖
const OpenAI = require('openai');

// 方舟API密钥
const apiKey = 'ark-09b5b85f-814f-402a-8cec-7dda5a32ba05-26b11';

// 初始化客户端
const client = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://ark.cn-beijing.volces.com/api/v3"
});

const MODEL = "ep-20260612111855-9rkrr";

// 接收前端 FormData（text 文本 + image 图片文件），调用视觉模型并返回结果
exports.runVisionChat = async (ctx) => {
  // multer 解析后：文本字段在 ctx.request.body，文件在 ctx.file
  const text = '回答的字数限制在200字以内'+(ctx.request.body && ctx.request.body.text) || '你是谁';
  const file = ctx.file;
  console.log('开始调用火山方舟视觉模型, text=', text, ', 是否含图片=', !!file);

  // 组装消息内容
  const content = [{ type: "text", text }];

  // 若前端上传了图片，转成 base64 data URI 一并发送
  if (file) {
    const base64 = file.buffer.toString('base64');
    const mime = file.mimetype || 'image/jpeg';
    content.push({
      type: "image_url",
      image_url: { url: `data:${mime};base64,${base64}` }
    });
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content }]
    });

    const answer = response.choices[0].message.content;
    console.log("\n模型回复内容：", answer);

    // 返回数据给前端
    ctx.body = {
      code: 0,
      message: 'success',
      data: { answer }
    };
  } catch (err) {
    console.error("调用接口失败：", err.message);
    if (err.response) {
      console.error("接口返回错误详情：", err.response.data);
    }
    ctx.status = 500;
    ctx.body = {
      code: 1,
      message: err.message || '调用 AI 接口失败',
      data: null
    };
  }
};
