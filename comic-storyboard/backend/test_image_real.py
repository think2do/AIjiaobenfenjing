"""测试真实通义万相 API 单格生图"""
import urllib.request
import json

BASE = "http://localhost:8000"

# 构造一个带英文 image_prompt 的 panel
panel = {
    "panel_number": 1,
    "narrative_phase": "Hook",
    "scene": "夜雨中的便利店门口",
    "characters": "穿黑色卫衣的年轻男人",
    "dialogue": "一切从这条消息开始",
    "camera_angle": "特写",
    "mood": "压抑悬疑",
    "image_prompt": "A young man in a black hoodie standing in front of a convenience store on a rainy night, neon lights reflected in puddles, dark moody atmosphere, cinematic lighting, manga style",
    "image_url": "",
}

body = {"panel": panel, "aspect_ratio": "3:4", "style": "suspense_twist"}
data = json.dumps(body).encode()
req = urllib.request.Request(
    f"{BASE}/api/generate-single-image",
    data=data,
    headers={"Content-Type": "application/json"},
)

print("正在调用通义万相 API 生图（可能需要 30-60 秒）...")
resp = urllib.request.urlopen(req, timeout=180)
result = json.loads(resp.read())
print(f"status = {result['status']}")
print(f"image_url = {result['image_url']}")
