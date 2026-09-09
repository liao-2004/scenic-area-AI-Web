# -*- coding: utf-8 -*-
"""
独立的 AI 接口服务器（从 Node 后端的 router/ai_api.js 分离而来）。

对外保持与原 Node 接口完全一致的契约：
    POST /ai/chat
        请求体：multipart/form-data
            - text  : 文本字段（可选，默认“你是谁”）
            - image : 图片文件（可选）
        响应体：application/json
            { "code": 0, "message": "success", "data": { "answer": "..." } }
            出错时：{ "code": 1, "message": "...", "data": null }，HTTP 500

调用火山方舟（Volcano Ark）的视觉模型，使用 OpenAI 兼容接口。
"""

import os
import base64
import logging

from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

API_KEY = os.environ.get("ARK_API_KEY", "ark-09b5b85f-814f-402a-8cec-7dda5a32ba05-26b11")
BASE_URL = os.environ.get("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
MODEL = os.environ.get("ARK_MODEL", "ep-20260612111855-9rkrr")
PORT = int(os.environ.get("AI_SERVER_PORT", "5000"))

PROMPT_PREFIX = "回答的字数限制在200字以内"
DEFAULT_TEXT = "你是谁"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ai_server")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

app = Flask(__name__)
CORS(app)


@app.route("/ai/chat", methods=["POST"])
def run_vision_chat():
    user_text = (request.form.get("text") or "").strip() or DEFAULT_TEXT
    text = PROMPT_PREFIX + user_text

    file = request.files.get("image")
    logger.info("开始调用火山方舟视觉模型, text=%s, 是否含图片=%s", text, bool(file))

    content = [{"type": "text", "text": text}]

    if file:
        raw = file.read()
        b64 = base64.b64encode(raw).decode("utf-8")
        mime = file.mimetype or "image/jpeg"
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:{mime};base64,{b64}"},
        })

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": content}],
        )
        answer = response.choices[0].message.content
        logger.info("模型回复内容：%s", answer)

        return jsonify({
            "code": 0,
            "message": "success",
            "data": {"answer": answer},
        })
    except Exception as err:  # 对前端返回错误信息
        logger.error("调用接口失败：%s", err)
        return jsonify({
            "code": 1,
            "message": str(err) or "调用 AI 接口失败",
            "data": None,
        }), 500


@app.route("/health", methods=["GET"])
def health():
    """健康检查。"""
    return jsonify({"code": 0, "message": "ok", "data": {"model": MODEL}})


if __name__ == "__main__":
    logger.info("AI 接口服务器启动：http://127.0.0.1:%d", PORT)
    app.run(host="0.0.0.0", port=PORT)
