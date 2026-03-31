"""LangGraph 状态图 —— AI 漫剧分镜脚本助手

链路 1（MVP）：parse_story → refine_script → 返回脚本
链路 2（V2）：generate_image → check_style → compose_comic
"""

import json
import os
from typing import TypedDict

from dotenv import load_dotenv
from langgraph.graph import END, StateGraph

from app.models import STYLE_CN, PanelScript

load_dotenv()


# ── 叙事阶段映射（PRD 4.3）──
NARRATIVE_MAP: dict[int, dict[str, list[int]]] = {
    4:  {"Hook": [1], "Escalate": [2], "Twist": [3], "Cliffhanger": [4]},
    6:  {"Hook": [1], "Escalate": [2, 3, 4], "Twist": [5], "Cliffhanger": [6]},
    9:  {"Hook": [1, 2], "Escalate": [3, 4, 5, 6], "Twist": [7, 8], "Cliffhanger": [9]},
    12: {"Hook": [1, 2], "Escalate": [3, 4, 5, 6, 7, 8, 9], "Twist": [10, 11], "Cliffhanger": [12]},
}


def _get_narrative_phase(panel_num: int, total_panels: int) -> str:
    mapping = NARRATIVE_MAP.get(total_panels)
    if not mapping:
        # 自定义镜头数：按比例分配
        if panel_num == 1:
            return "Hook"
        if panel_num == total_panels:
            return "Cliffhanger"
        if panel_num >= total_panels - 1:
            return "Twist"
        return "Escalate"
    for phase, nums in mapping.items():
        if panel_num in nums:
            return phase
    return "Escalate"


# ── State ──
class StoryboardState(TypedDict):
    story: str
    num_panels: int
    style: str
    duration: int
    aspect_ratio: str
    panels: list[dict]
    images: list[str]


# ──────────────────────────────────────────────
#  mock 数据（无 API Key 时使用）
# ──────────────────────────────────────────────
def _mock_panels(num_panels: int, style: str) -> list[dict]:
    style_cn = STYLE_CN.get(style, style)
    templates = [
        {
            "scene": "夜雨中的便利店门口，霓虹灯倒映在积水中",
            "characters": "一个穿黑色卫衣的年轻男人低头看手机，脸色阴沉",
            "dialogue": "（旁白）一切，从这条消息开始……",
            "camera_angle": "特写",
            "mood": "压抑、悬疑",
        },
        {
            "scene": "逼仄的出租屋，桌上散落着外卖盒和文件",
            "characters": "男人猛地站起来，椅子向后倒去，表情震惊",
            "dialogue": "不可能……她怎么会知道？！",
            "camera_angle": "中景",
            "mood": "紧张、惊恐",
        },
        {
            "scene": "写字楼大厅，人来人往，玻璃幕墙反射冷光",
            "characters": "一个戴墨镜的女人靠在柱子旁微笑，手里转着一张名片",
            "dialogue": "游戏才刚开始呢，亲爱的。",
            "camera_angle": "仰视",
            "mood": "危险、挑衅",
        },
        {
            "scene": "天台边缘，城市灯火在脚下延伸",
            "characters": "男人和女人面对面站着，风吹起两人的头发",
            "dialogue": "你到底……是谁？",
            "camera_angle": "远景",
            "mood": "对峙、紧张到极点",
        },
        {
            "scene": "监控室，密密麻麻的屏幕墙",
            "characters": "一只手按下键盘，屏幕上出现两人的实时画面",
            "dialogue": "（神秘声音）都在计划之中。",
            "camera_angle": "俯视",
            "mood": "阴谋、掌控感",
        },
        {
            "scene": "黑屏，只有一行白色文字浮现",
            "characters": "无",
            "dialogue": "明天，真相揭晓。——未完待续",
            "camera_angle": "字幕卡",
            "mood": "悬念、期待",
        },
    ]
    panels = []
    for i in range(num_panels):
        t = templates[i % len(templates)].copy()
        t["panel_number"] = i + 1
        t["narrative_phase"] = _get_narrative_phase(i + 1, num_panels)
        t["image_prompt"] = ""
        panels.append(t)
    return panels


# ──────────────────────────────────────────────
#  节点：parse_story（完整实现）
# ──────────────────────────────────────────────
def parse_story(state: StoryboardState) -> StoryboardState:
    """调用通义千问，按黄金公式把故事拆成分镜脚本；无 Key 时回退 mock"""
    api_key = os.getenv("LLM_API_KEY", "").strip()

    if not api_key:
        print("[parse_story] 未配置 LLM_API_KEY，使用 mock 数据")
        state["panels"] = _mock_panels(state["num_panels"], state["style"])
        return state

    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(
        api_key=api_key,
        base_url=os.getenv("LLM_BASE_URL"),
        model=os.getenv("LLM_MODEL", "qwen-plus"),
        temperature=0.7,
    )

    num = state["num_panels"]
    style_cn = STYLE_CN.get(state["style"], state["style"])

    # 生成叙事阶段说明
    phase_desc = []
    for i in range(1, num + 1):
        phase = _get_narrative_phase(i, num)
        phase_desc.append(f"第 {i} 格 → {phase}")
    phase_text = "\n".join(phase_desc)

    prompt = f"""你是一位专业的漫剧分镜编剧。请将以下故事拆解成 {num} 格漫剧分镜脚本。

## 基本信息
- 风格：{style_cn}
- 时长：{state['duration']} 秒
- 镜头数：{num}

## 故事内容
{state['story']}

## 叙事黄金公式（必须严格遵循）
每格的叙事阶段分配如下：
{phase_text}

各阶段要求：
- Hook（前 20%）：第一秒就抓住注意力，禁止铺垫，禁止介绍背景或人物关系
- Escalate（中间 50%）：快速推进，每格有新信息，情绪递增
- Twist（后 20%）：出人意料的反转，打破观众预期
- Cliffhanger（最后 10%）：留钩子，让观众想看下一集，禁止给出完整结局

## 禁止项
1. 禁止第 1 格用于介绍背景或人物关系
2. 禁止连续 2 格情绪强度相同
3. 禁止最后一格给完整结局（必须留悬念）
4. 禁止任何一格不含对白或旁白
5. 禁止连续 2 格相同镜头角度

## 输出格式（严格 JSON，不要输出其他内容）
{{
  "panels": [
    {{
      "panel_number": 1,
      "narrative_phase": "Hook",
      "scene": "场景描述（环境、背景、光影）",
      "characters": "出场角色及动作姿态、外貌特征、表情",
      "dialogue": "台词或旁白",
      "camera_angle": "镜头角度（特写/中景/远景/俯视/仰视/全景）",
      "mood": "氛围/情绪基调"
    }}
  ]
}}"""

    response = llm.invoke(prompt)
    content = response.content.strip()

    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()

    parsed = json.loads(content)
    panels_raw = parsed.get("panels", [])

    validated = []
    for p in panels_raw:
        if "image_prompt" not in p:
            p["image_prompt"] = ""
        panel = PanelScript(**p)
        validated.append(panel.model_dump())

    state["panels"] = validated
    return state


# ──────────────────────────────────────────────
#  节点：refine_script（完整实现）
# ──────────────────────────────────────────────
def refine_script(state: StoryboardState) -> StoryboardState:
    """润色每格描述，为每格生成英文 image_prompt"""
    api_key = os.getenv("LLM_API_KEY", "").strip()

    if not api_key:
        print("[refine_script] 未配置 LLM_API_KEY，跳过润色")
        return state

    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(
        api_key=api_key,
        base_url=os.getenv("LLM_BASE_URL"),
        model=os.getenv("LLM_MODEL", "qwen-plus"),
        temperature=0.5,
    )

    style_cn = STYLE_CN.get(state["style"], state["style"])

    panels_json = json.dumps(state["panels"], ensure_ascii=False, indent=2)
    prompt = f"""你是一位漫画视觉指导。下面是一组分镜脚本，风格为「{style_cn}」。

请为每一格：
1. 润色 scene 和 characters 的描述，补充视觉细节（光影、色调、构图）
2. 生成一段英文 image_prompt，用于 AI 生图（要具体、适合 text-to-image 模型）

## 当前脚本
{panels_json}

## 输出格式（严格 JSON，与输入结构相同，新增/更新 image_prompt 字段）
{{
  "panels": [ ... ]
}}"""

    response = llm.invoke(prompt)
    content = response.content.strip()

    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()

    try:
        parsed = json.loads(content)
        refined = []
        for p in parsed.get("panels", []):
            panel = PanelScript(**p)
            refined.append(panel.model_dump())
        state["panels"] = refined
    except (json.JSONDecodeError, Exception) as e:
        print(f"[refine_script] 润色失败，保留原始脚本: {e}")

    return state


# ──────────────────────────────────────────────
#  节点：generate_image（完整实现）
# ──────────────────────────────────────────────
async def generate_image(state: StoryboardState) -> StoryboardState:
    """遍历每格脚本，调用生图 API 生成漫画图片"""
    from app.image_service import generate_one_image

    aspect_ratio = state.get("aspect_ratio", "3:4")
    images = []

    for panel in state["panels"]:
        prompt = panel.get("image_prompt", "")
        if not prompt:
            prompt = f"{panel.get('scene', '')}, {panel.get('characters', '')}, {panel.get('mood', '')}"

        result = await generate_one_image(prompt, aspect_ratio)
        images.append(result.get("url", ""))
        panel["image_url"] = result.get("url", "")

    state["images"] = images
    return state


def check_style(state: StoryboardState) -> StoryboardState:
    """风格一致性检查（待实现）"""
    return state


def compose_comic(state: StoryboardState) -> StoryboardState:
    """排版输出（待实现）"""
    return state


# ──────────────────────────────────────────────
#  构建状态图
# ──────────────────────────────────────────────
def build_script_graph():
    """链路 1：生成脚本 parse_story → refine_script"""
    graph = StateGraph(StoryboardState)
    graph.add_node("parse_story", parse_story)
    graph.add_node("refine_script", refine_script)
    graph.set_entry_point("parse_story")
    graph.add_edge("parse_story", "refine_script")
    graph.add_edge("refine_script", END)
    return graph.compile()


def build_image_graph():
    """链路 2：生成图片（V2）"""
    graph = StateGraph(StoryboardState)
    graph.add_node("generate_image", generate_image)
    graph.add_node("check_style", check_style)
    graph.add_node("compose_comic", compose_comic)
    graph.set_entry_point("generate_image")
    graph.add_edge("generate_image", "check_style")
    graph.add_edge("check_style", "compose_comic")
    graph.add_edge("compose_comic", END)
    return graph.compile()
