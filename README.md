# AI脚本分镜项目

本项目旨在实现 AI 驱动的漫画/剧本分镜生成与管理，包含前后端完整功能。

## 目录结构

```
ai漫剧脚本分镜/           # 主项目目录
├── comic-storyboard/      # 主要代码目录
│   ├── backend/           # 后端服务（Python FastAPI）
│   │   ├── app/           # 后端核心代码
│   │   ├── requirements.txt # 后端依赖
│   │   └── ...
│   └── frontend/          # 前端（React/TypeScript）
│       ├── screens/       # 页面组件
│       ├── assets/        # 静态资源
│       ├── package.json   # 前端依赖
│       └── ...
├── design/                # 设计文件与主题
│   ├── AI分镜脚本App.lib.pen
│   └── exports/
├── 文档/                  # 产品文档与需求
│   ├── PRD 2.0.md
│   ├── PRD-v3.0.md
│   └── ...
└── LICENSE                # 许可证
```

## 技术栈

- **前端**：React, TypeScript
- **后端**：Python, FastAPI
- **移动端**：React Native (iOS 支持)
- **设计**：Pencil (.pen 文件), Figma

## 快速开始

### 后端

1. 进入后端目录：
   ```bash
   cd ai漫剧脚本分镜/comic-storyboard/backend
   ```
2. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```
3. 启动服务：
   ```bash
   python app/main.py
   ```

### 前端

1. 进入前端目录：
   ```bash
   cd ai漫剧脚本分镜/comic-storyboard/frontend
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发环境：
   ```bash
   npm start
   ```

### iOS

1. 进入 iOS 目录：
   ```bash
   cd ai漫剧脚本分镜/comic-storyboard/frontend/ios
   ```
2. 安装 Pod 依赖：
   ```bash
   pod install
   ```

## 主要功能

- AI 自动生成漫画/剧本分镜
- 分镜脚本管理与编辑
- 图像生成与处理
- 用户认证与权限管理
- 多端支持（Web、iOS）

## 文档

详细需求与产品文档见 `文档/` 目录。

## 许可证

本项目遵循 [MIT License](LICENSE)。
