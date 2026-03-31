from enum import Enum

from pydantic import BaseModel, Field


# ── 风格枚举（PRD 4.4）──
class StyleEnum(str, Enum):
    suspense_twist = "suspense_twist"        # 悬疑反转
    comedy_absurd = "comedy_absurd"          # 搞笑沙雕
    healing_warm = "healing_warm"            # 治愈温情
    dark_revenge = "dark_revenge"            # 暗黑爆爽
    wuxia_fantasy = "wuxia_fantasy"          # 古风仙侠
    superpower_fantasy = "superpower_fantasy" # 超能力奇幻
    horror_thriller = "horror_thriller"      # 恐怖惊悚
    sweet_romance = "sweet_romance"          # 甜宠恋爱


STYLE_CN = {
    "suspense_twist": "悬疑反转",
    "comedy_absurd": "搞笑沙雕",
    "healing_warm": "治愈温情",
    "dark_revenge": "暗黑爆爽",
    "wuxia_fantasy": "古风仙侠",
    "superpower_fantasy": "超能力奇幻",
    "horror_thriller": "恐怖惊悚",
    "sweet_romance": "甜宠恋爱",
}


# ── 请求模型（PRD 3.4）──
class ScriptInput(BaseModel):
    story: str = Field(..., min_length=1, description="用户故事文案")
    panels: int = Field(default=6, description="镜头数：4/6/9/12")
    style: StyleEnum = Field(default=StyleEnum.suspense_twist, description="脚本风格")
    duration: int = Field(default=15, description="时长(秒)：10/15/30/60")
    aspect_ratio: str = Field(default="3:4", description="图片比例：3:4/1:1/16:9")


# ── 单格分镜模型（PRD 4.1）──
class PanelScript(BaseModel):
    panel_number: int = Field(..., description="第几格")
    narrative_phase: str = Field(..., description="叙事阶段：Hook/Escalate/Twist/Cliffhanger")
    scene: str = Field(..., description="场景描述（环境、背景）")
    characters: str = Field(..., description="出场角色及动作姿态")
    dialogue: str = Field(..., description="台词/旁白")
    camera_angle: str = Field(..., description="镜头角度")
    mood: str = Field(..., description="氛围/情绪基调")
    image_prompt: str = Field(default="", description="英文生图提示词（refine_script 填充）")
    image_url: str = Field(default="", description="生成的图片 URL")


# ── 响应模型 ──
class ScriptOutput(BaseModel):
    panels: list[PanelScript]
    style: str
    duration: int
    aspect_ratio: str


# ── 生图请求模型 ──
class GenerateImagesInput(BaseModel):
    panels: list[PanelScript] = Field(..., description="分镜脚本列表")
    aspect_ratio: str = Field(default="3:4", description="图片比例")
    style: str = Field(default="suspense_twist", description="风格")


class SingleImageInput(BaseModel):
    panel: PanelScript = Field(..., description="单格分镜脚本")
    aspect_ratio: str = Field(default="3:4", description="图片比例")
    style: str = Field(default="suspense_twist", description="风格")


class RegenerateImageInput(BaseModel):
    panel: PanelScript = Field(..., description="要重新生成的分镜")
    aspect_ratio: str = Field(default="3:4", description="图片比例")
    style: str = Field(default="suspense_twist", description="风格")


class ImageResult(BaseModel):
    panel_number: int
    image_url: str
    status: str


# ── 重写单格请求/响应 ──
class RewritePanelInput(BaseModel):
    panel: PanelScript = Field(..., description="要重写的分镜")
    style: str = Field(default="suspense_twist", description="风格")
    instruction: str = Field(default="", description="用户的修改指令（可选）")


class RewritePanelOutput(BaseModel):
    panel: PanelScript


# ── 积分系统 ──
POINTS_COST = {
    "generate_script": 5,
    "generate_images": 10,
    "regenerate_image": 3,
    "rewrite_panel": 3,
    "export": 2,
}

POINTS_EARN = {
    "register": 100,
    "daily_checkin": 5,
    "invite_friend": 50,
    "share_work": 3,
    "work_liked": 1,
    "work_collected": 2,
}

POINTS_PACKAGES = [
    {"id": "trial", "name": "体验包", "points": 50, "price": 1.0, "label": "1元"},
    {"id": "basic", "name": "基础包", "points": 100, "price": 6.0, "label": "6元"},
    {"id": "pro", "name": "进阶包", "points": 300, "price": 12.0, "label": "12元", "badge": "8折"},
    {"id": "premium", "name": "豪华包", "points": 1000, "price": 30.0, "label": "30元", "badge": "5折"},
]


class PointsBalance(BaseModel):
    balance: int
    today_checkin: bool = False


class PointsLog(BaseModel):
    amount: int
    action: str
    balance: int
    created_at: str


class ConsumePointsInput(BaseModel):
    action: str = Field(..., description="操作类型: generate_script/generate_images/...")
    amount: int | None = Field(None, description="自定义消耗数（为空则按 POINTS_COST 扣）")


class ConsumePointsOutput(BaseModel):
    success: bool
    balance: int
    message: str = ""


class PurchaseInput(BaseModel):
    package_id: str = Field(..., description="套餐ID: trial/basic/pro/premium")
