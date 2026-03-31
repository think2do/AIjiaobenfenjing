"""直接调用 image_service 看完整错误信息"""
import asyncio
import sys
import os

# 设置项目路径
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

from app.image_service import generate_one_image

async def main():
    result = await generate_one_image(
        "A young man in a black hoodie standing in front of a convenience store on a rainy night, neon lights reflected in puddles, cinematic lighting",
        "3:4",
    )
    print(f"完整结果: {result}")

asyncio.run(main())
