import asyncio
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.graph import build_script_graph
from app.image_service import generate_one_image
from app.models import (
    GenerateImagesInput,
    ImageResult,
    RegenerateImageInput,
    RewritePanelInput,
    RewritePanelOutput,
    ScriptInput,
    ScriptOutput,
    SingleImageInput,
    STYLE_CN,
    PanelScript,
)

from app.auth import router as auth_router
from app.points import router as points_router

app = FastAPI(title="AI 漫剧分镜脚本助手", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router)
app.include_router(points_router)
script_graph = build_script_graph()


# ──────────────────────────────────────────────
#  链路 1：生成脚本
# ──────────────────────────────────────────────
@app.post("/api/generate-script", response_model=ScriptOutput)
async def generate_script(input: ScriptInput):
    result = await script_graph.ainvoke(
        {
            "story": input.story,
            "num_panels": input.panels,
            "style": input.style.value,
            "duration": input.duration,
            "aspect_ratio": input.aspect_ratio,
            "panels": [],
            "images": [],
        }
    )
    return ScriptOutput(
        panels=result["panels"],
        style=input.style.value,
        duration=input.duration,
        aspect_ratio=input.aspect_ratio,
    )


# ──────────────────────────────────────────────
#  链路 2：一键生成全部图片（SSE 流式推送）
# ──────────────────────────────────────────────
@app.post("/api/generate-images")
async def generate_images(input: GenerateImagesInput):
    """SSE 流式推送，每生成一张图立即发送给前端"""

    async def event_stream():
        for panel in input.panels:
            prompt = panel.image_prompt or f"{panel.scene}, {panel.characters}, {panel.mood}"

            result = await generate_one_image(prompt, input.aspect_ratio)

            event_data = {
                "panel_number": panel.panel_number,
                "image_url": result.get("url", ""),
                "status": result.get("status", "failed"),
                "error": result.get("error", ""),
            }

            yield f"data: {json.dumps(event_data, ensure_ascii=False)}\n\n"

        # 发送完成信号
        yield f"data: {json.dumps({'event': 'done', 'message': '全部图片生成完成'}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ──────────────────────────────────────────────
#  单格首次生图
# ──────────────────────────────────────────────
@app.post("/api/generate-single-image", response_model=ImageResult)
async def generate_single_image(input: SingleImageInput):
    prompt = input.panel.image_prompt or f"{input.panel.scene}, {input.panel.characters}, {input.panel.mood}"
    result = await generate_one_image(prompt, input.aspect_ratio)
    return ImageResult(
        panel_number=input.panel.panel_number,
        image_url=result.get("url", ""),
        status=result.get("status", "failed"),
    )


# ──────────────────────────────────────────────
#  重新生成指定格图片
# ──────────────────────────────────────────────
# ──────────────────────────────────────────────
#  AI 重写单格脚本
# ──────────────────────────────────────────────
@app.post("/api/rewrite-panel", response_model=RewritePanelOutput)
async def rewrite_panel(input: RewritePanelInput):
    import json
    import os
    api_key = os.getenv("LLM_API_KEY", "").strip()
    panel = input.panel
    style_cn = STYLE_CN.get(input.style, input.style)

    if not api_key:
        # mock: 简单修改对白
        panel_dict = panel.model_dump()
        panel_dict["dialogue"] = f"（AI 重写）{panel_dict['dialogue']}"
        return RewritePanelOutput(panel=PanelScript(**panel_dict))

    from langchain_openai import ChatOpenAI
    llm = ChatOpenAI(
        api_key=api_key,
        base_url=os.getenv("LLM_BASE_URL"),
        model=os.getenv("LLM_MODEL", "qwen-plus"),
        temperature=0.7,
    )

    instruction = input.instruction or "让这一格更有张力和画面感"
    panel_json = json.dumps(panel.model_dump(), ensure_ascii=False, indent=2)

    prompt = f"""你是一位专业的漫剧分镜编剧。请重写以下这一格分镜脚本。

## 风格：{style_cn}
## 用户要求：{instruction}

## 当前脚本
{panel_json}

## 要求
1. 保持 panel_number 和 narrative_phase 不变
2. 重写 scene、characters、dialogue、camera_angle、mood
3. 让描写更生动、更有画面感
4. 同时更新 image_prompt（英文，适合 AI 生图）

## 输出格式（严格 JSON，不要输出其他内容）
{{
  "panel_number": {panel.panel_number},
  "narrative_phase": "{panel.narrative_phase}",
  "scene": "...",
  "characters": "...",
  "dialogue": "...",
  "camera_angle": "...",
  "mood": "...",
  "image_prompt": "..."
}}"""

    response = await llm.ainvoke(prompt)
    content = response.content.strip()
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()

    parsed = json.loads(content)
    rewritten = PanelScript(**parsed)
    return RewritePanelOutput(panel=rewritten)


@app.post("/api/regenerate-image", response_model=ImageResult)
async def regenerate_image(input: RegenerateImageInput):
    prompt = input.panel.image_prompt or f"{input.panel.scene}, {input.panel.characters}, {input.panel.mood}"
    result = await generate_one_image(prompt, input.aspect_ratio)
    return ImageResult(
        panel_number=input.panel.panel_number,
        image_url=result.get("url", ""),
        status=result.get("status", "failed"),
    )
