"""通义万相 文生图 服务

DashScope text2image API（异步模式）：
1. POST 提交生图任务 → 拿到 task_id
2. GET 轮询任务状态 → 拿到图片 URL
"""

import asyncio
import os
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

# 图片比例 → 像素尺寸映射
ASPECT_RATIO_MAP = {
    "3:4": "768*1024",
    "1:1": "1024*1024",
    "16:9": "1024*576",
    "9:16": "576*1024",
    "4:3": "1024*768",
}

# 提交任务的 URL
SUBMIT_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"
# 查询任务的 URL 模板
TASK_URL = "https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"

# mock 图片（无 API Key 时返回）
MOCK_IMAGE_URLS = [
    "https://via.placeholder.com/768x1024/2D1B69/FFFFFF?text=Panel+{n}+Mock",
]


async def generate_one_image(
    prompt: str,
    aspect_ratio: str = "3:4",
    negative_prompt: str = "lowres, bad anatomy, bad hands, text, watermark, blurry, deformed",
) -> dict:
    """为单格生成一张图片

    Returns: {"url": "...", "status": "success"} 或 {"url": "", "status": "failed", "error": "..."}
    """
    api_key = os.getenv("IMAGE_API_KEY", "").strip()

    if not api_key:
        # mock 模式
        return {
            "url": f"https://via.placeholder.com/768x1024/7C5CFC/FFFFFF?text=Mock+Image",
            "status": "mock",
        }

    size = ASPECT_RATIO_MAP.get(aspect_ratio, "768*1024")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
    }

    body = {
        "model": os.getenv("IMAGE_MODEL", "wanx2.1-t2i-turbo"),
        "input": {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
        },
        "parameters": {
            "size": size,
            "n": 1,
        },
    }

    async with httpx.AsyncClient(timeout=30) as client:
        # 第 1 步：提交任务
        resp = await client.post(SUBMIT_URL, json=body, headers=headers)
        if resp.status_code != 200:
            return {"url": "", "status": "failed", "error": f"提交失败: {resp.status_code} {resp.text}"}

        result = resp.json()
        task_id = result.get("output", {}).get("task_id")
        if not task_id:
            return {"url": "", "status": "failed", "error": f"未获取到 task_id: {result}"}

        # 第 2 步：轮询任务状态（最多等 120 秒）
        poll_headers = {"Authorization": f"Bearer {api_key}"}
        poll_url = TASK_URL.format(task_id=task_id)

        for _ in range(60):  # 每 2 秒查一次，最多 120 秒
            await asyncio.sleep(2)
            poll_resp = await client.get(poll_url, headers=poll_headers)
            if poll_resp.status_code != 200:
                continue

            poll_data = poll_resp.json()
            task_status = poll_data.get("output", {}).get("task_status")

            if task_status == "SUCCEEDED":
                results = poll_data.get("output", {}).get("results", [])
                if results and results[0].get("url"):
                    return {"url": results[0]["url"], "status": "success"}
                return {"url": "", "status": "failed", "error": "任务成功但无图片 URL"}

            if task_status == "FAILED":
                error_msg = poll_data.get("output", {}).get("message", "未知错误")
                return {"url": "", "status": "failed", "error": f"生图失败: {error_msg}"}

            # PENDING / RUNNING → 继续等
            continue

        return {"url": "", "status": "failed", "error": "生图超时（120秒）"}
