"""快速测试所有生图相关 API"""
import urllib.request
import json

BASE = "http://localhost:8000"

def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req, timeout=60)
    return json.loads(resp.read())

def post_stream(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req, timeout=60)
    lines = []
    for line in resp:
        decoded = line.decode().strip()
        if decoded.startswith("data:"):
            lines.append(decoded)
    return lines

# 1. 生成脚本
print("=== 1. POST /api/generate-script ===")
r1 = post("/api/generate-script", {"story": "渣男被前女友报复", "panels": 4, "style": "suspense_twist"})
print(f"  返回 {len(r1['panels'])} 格")
for p in r1["panels"]:
    print(f"  第{p['panel_number']}格 [{p['narrative_phase']}] {p['scene'][:30]}...")

panel = r1["panels"][0]

# 2. 单格生图
print("\n=== 2. POST /api/generate-single-image ===")
r2 = post("/api/generate-single-image", {"panel": panel, "aspect_ratio": "3:4", "style": "suspense_twist"})
print(f"  status={r2['status']}, url={r2['image_url'][:60]}")

# 3. 重新生成
print("\n=== 3. POST /api/regenerate-image ===")
r3 = post("/api/regenerate-image", {"panel": panel, "aspect_ratio": "3:4", "style": "suspense_twist"})
print(f"  status={r3['status']}, url={r3['image_url'][:60]}")

# 4. SSE 全部生图
print("\n=== 4. POST /api/generate-images (SSE) ===")
lines = post_stream("/api/generate-images", {"panels": r1["panels"], "aspect_ratio": "3:4", "style": "suspense_twist"})
for line in lines:
    print(f"  {line}")

print("\n全部测试通过!")
