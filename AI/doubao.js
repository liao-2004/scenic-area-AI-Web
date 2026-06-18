// 引入依赖
const OpenAI = require('openai');

// 方舟API密钥
const apiKey = 'ark-09b5b85f-814f-402a-8cec-7dda5a32ba05-26b11';

// 初始化客户端
const client = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://ark.cn-beijing.volces.com/api/v3"
});

async function runVisionChat() {
  console.log('开始调用火山方舟视觉模型');
  try {
    const response = await client.chat.completions.create({
      model: "ep-20260612111855-9rkrr",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "你是谁"
            },
            // {
            //   type: "image_url",
            //   image_url: {
            //     url: imgBase64Uri
            //   }
            // }
          ]
        }
      ]
    });

    // 完整返回体
    console.log(JSON.stringify(response, null, 2));
    // 提取模型回答
    const answer = response.choices[0].message.content;
    console.log("\n模型回复内容：", answer);
  } catch (err) {
    console.error("调用接口失败：", err.message);
    // 打印详细错误对象排查
    if (err.response) {
      console.error("接口返回错误详情：", err.response.data);
    }
  }
}

runVisionChat();