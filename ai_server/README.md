# AI 接口服务器（Python）

从 Node 后端（`router/ai_api.js` + `router_handle/ai_api.js`）分离出来的独立 AI 接口服务，使用 Flask 实现，调用火山方舟（Volcano Ark）视觉模型。

## 接口

与原 Node 接口契约完全一致：

`POST /ai/chat`

- 请求：`multipart/form-data`
  - `text`：文本字段（可选，默认“你是谁”）
  - `image`：图片文件（可选）
- 响应：`application/json`
  - 成功：`{ "code": 0, "message": "success", "data": { "answer": "..." } }`
  - 失败：`{ "code": 1, "message": "...", "data": null }`（HTTP 500）

另提供 `GET /health` 健康检查。

## 安装与运行

```bash
cd ai_server

# 建议使用虚拟环境
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

pip install -r requirements.txt
python app.py
```

默认监听 `http://127.0.0.1:5000`。

## 配置（环境变量，均可选）

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `ARK_API_KEY` | 方舟 API 密钥 | 代码内置默认值 |
| `ARK_BASE_URL` | 方舟接口地址 | `https://ark.cn-beijing.volces.com/api/v3` |
| `ARK_MODEL` | 模型 endpoint id | `ep-20260612111855-9rkrr` |
| `AI_SERVER_PORT` | 监听端口 | `5000` |

## 前端对接

前端原来请求 `http://127.0.0.1:3000/ai/chat`（Node 服务）。
改用本服务后，将前端的接口地址改为本服务地址即可，例如
`vue_day_5-12/src/views/aiChat.vue` 中的 `API_BASE` 改为 `http://127.0.0.1:5000`。

切换到本服务后，可从 Node 后端 `app.js` 中移除 AI 路由（`AI_api` 相关的 require 与挂载）。
