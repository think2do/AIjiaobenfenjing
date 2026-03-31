# AI 漫剧分镜脚本助手

*Comic Storyboard AI Assistant*

产品需求文档 PRD（定稿版）

v2.0

2026年3月28日

# 1. 产品概述

## 1.1 产品定位

AI 漫剧分镜脚本助手是一款面向漫剧创作小白的 AI 工具。用户只需输入一句简单文案，AI 自动完成故事拆解、分镜脚本生成、漫画图片生成的全流程。产品同时支持 iOS App 和网页版。

## 1.2 技术架构

| **层级** | **技术选择** | **说明** |
| --- | --- | --- |
| 前端 | React Native | 一套代码同时出 iOS App + 网页版 + 未来 Android |
| 后端 | Python FastAPI | API 服务，REST + SSE |
| AI 编排 | LangGraph | 状态图编排多步骤 AI 工作流 |
| 文本 AI | 通义千问 qwen-plus | 故事拆解、脚本生成 |
| 生图 AI | 通义万相 wan2.5-t2i + Nano Banana | 漫画图片生成 |
| 数据库 | MySQL | 用户、作品、积分等 |
| 图片存储 | 阿里云 OSS | 生成的漫画图片 |
| 部署 | 阿里云 ECS | 2核4G，MVP 阶段 |
| 开发工具 | Claude Code + Figma MCP | 代码生成 + 设计稿读取 |

# 2. 设计规范

## 2.1 视觉风格

| **属性** | **规范** |
| --- | --- |
| 整体风格 | Airbnb 风格：温暖白底、大图卡片、充足留白、图片是主角 |
| 主题 | 浅色主题（白色背景） |
| 强调色 | 创意紫 #7C5CFC（温暖紫罗兰色） |
| 字体 | 系统默认（iOS: SF Pro，中文: 苹方） |
| 卡片圆角 | 12-16px |
| 图片占比 | 卡片中图片占 70%+（Airbnb 房源卡片风格） |
| 设计调性 | 雅致、不抢内容、让用户生成的漫画图片始终是视觉主角 |

## 2.2 iOS 体验优化

| **特性** | **说明** |
| --- | --- |
| 触感反馈 | 点击按钮轻微振动，生成完成成功振动 |
| 手势操作 | 左滑返回上一页，双击图片放大，下拉刷新 |
| 转场动画 | 前进：左右滑动+淡入淡出；回退：右滑手势；生成脚本：向上推出 |
| 加载状态 | 动画 + 随机提示词（"AI 正在拆解你的故事..."） |
| 超时处理 | 30 秒超时 + 后端自动重试 1 次，失败显示友好提示 + 重试按钮 |
| 推送通知 | 生图完成后 App 内提示 + iPhone 系统推送通知 |

# 3. App 结构与页面

## 3.1 底部 Tab 栏

| **序号** | **Tab** | **说明** |
| --- | --- | --- |
| 1 | 创作 | 首页，上半部分创作入口，下半部分推荐作品/灵感 |
| 2 | 探索 | 瀑布流展示优秀作品，支持搜索、分类、点赞、收藏、评论 |
| 3 | 我的 | 个人信息卡片 + 分 Tab（作品/草稿/收藏） |

## 3.2 登录页

- 支持手机号、微信、Apple ID 三种登录方式

- 新用户首次登录自动注册

## 3.3 创作页（首页）

**上半部分：**创作入口按钮，点击进入引导式创作流程

**下半部分：**推荐作品/灵感内容（从探索页拉取）

## 3.4 引导式创作流程（4 步）

顶部显示圆点进度指示器（●○○○），可回退上一步，每步都有默认值。

### 步骤 1/4 — 输入文案

- 大文本输入框，placeholder: "写下你的故事，比如：渣男被前女友报复..."

- 必填，无默认值

- 底部按钮："下一步"

### 步骤 2/4 — 选择时长

- 胶囊按钮：10秒 / 15秒 / 30秒 / 60秒 / 自定义

- 默认值：15秒

- 自定义时弹出数字输入框

### 步骤 3/4 — 选择风格

- 卡片式选择，每张卡片带示例图 + 风格名称

- 8 种风格：悬疑反转 / 搞笑沙雕 / 治愈温情 / 暗黑爆爽 / 古风仙侠 / 超能力奇幻 / 恐怖惊悚 / 甜宠恋爱

- 默认值：悬疑反转

- 用户只能选 1 种

### 步骤 4/4 — 选择镜头数 + 图片比例

- 镜头数胶囊按钮：4 / 6 / 9 / 12，默认 6

- 图片比例选择：3:4 竖版 / 1:1 方形 / 16:9 横版 / 自定义，默认 3:4

- 底部按钮："生成脚本"

## 3.5 脚本编辑页

- 纵向卡片列表，上下滑动

- 每格可编辑所有字段：场景、角色、对白、镜头角度、情绪

- 每格有"AI 重写"按钮

- 每格有"单格生图"按钮

- 底部固定按钮："一键生成全部图片"

- 编辑为纯前端操作，不调后端

## 3.6 生图过程

- 留在脚本编辑页，每格卡片上直接显示生成的图片

- SSE 流式推送，每生成完一张立即显示

- 未完成的格子显示加载动画

- 图片上不显示对白文字，但可显示音效文字（如"轰——！"）

## 3.7 生图完成后

- 可修改文字（纯前端）

- 可点单格"重新生成"按钮（调后端）

- 底部出现"导出"按钮

## 3.8 导出

- 单张分开导出（不拼合）

- 生成分享链接

## 3.9 探索页

- 瀑布流布局（类似小红书），大图卡片

- 热门作品推荐（编辑精选）

- 按风格分类浏览（8 种风格 Tab）

- 搜索功能

- 点赞、收藏、评论

## 3.10 我的页

- 顶部：个人信息卡片（头像 + 昵称 + 积分余额）

- 分 Tab：作品 / 草稿 / 收藏

- 功能：我的作品、我的草稿、我的收藏、我的点赞、积分余额+充值、使用记录、设置

# 4. 脚本生成规范

## 4.1 叙事黄金公式

所有脚本必须严格遵循 4 段式叙事结构：

| **阶段** | **名称** | **占比** | **作用** |
| --- | --- | --- | --- |
| 第 1 格 | Hook | 前 20% | 第一秒就抓住注意力，禁止铺垫 |
| 中间 | Escalate | 中间 50% | 快速推进，每格有新信息，情绪递增 |
| 倒数第 2 格 | Twist | 后 20% | 出人意料的反转，打破观众预期 |
| 最后 1 格 | Cliffhanger | 最后 10% | 留钩子，让观众想看下一集 |

## 4.2 禁止项

- 禁止第 1 格用于介绍背景或人物关系

- 禁止连续 2 格情绪强度相同

- 禁止最后一格拊完整结局（必须留悬念）

- 禁止任何一格不含对白或旁白

- 禁止连续 2 格相同镜头角度

## 4.3 镜头数与叙事结构映射

| **镜头数** | **Hook (20%)** | **Escalate (50%)** | **Twist (20%)** | **Cliffhanger (10%)** |
| --- | --- | --- | --- | --- |
| 4 | 第 1 格 | 第 2 格 | 第 3 格 | 第 4 格 |
| 6 | 第 1 格 | 第 2-4 格 | 第 5 格 | 第 6 格 |
| 9 | 第 1-2 格 | 第 3-6 格 | 第 7-8 格 | 第 9 格 |
| 12 | 第 1-2 格 | 第 3-9 格 | 第 10-11 格 | 第 12 格 |

## 4.4 8 种脚本风格

| **编号** | **风格** | **英文标识** | **核心特点** |
| --- | --- | --- | --- |
| 1 | 悬疑反转 | suspense_twist | 每格埋伏笔，结尾大反转 |
| 2 | 搞笑沙雕 | comedy_absurd | 夸张表情，无厨头式反转 |
| 3 | 治愈温情 | healing_warm | 温柔细腻，情感反转 |
| 4 | 暗黑爆爽 | dark_revenge | 快节奏强冲突，复仇爽感 |
| 5 | 古风仙侠 | wuxia_fantasy | 古装场景，江湖气息 |
| 6 | 超能力奇幻 | superpower_fantasy | 科幻/魔法元素，觉醒成长 |
| 7 | 恐怖惊悚 | horror_thriller | 压抑氛围，惊吓结尾 |
| 8 | 甜宠恋爱 | sweet_romance | 快节奏对白，反转甜 |

## 4.5 时长选项

时长和镜头数独立，用户自由搭配。

| **时长** | **说明** |
| --- | --- |
| 10秒 | 超短篇，快节奏冲击 |
| 15秒（默认） | 标准漫剧节奏 |
| 30秒 | 中篇，剧情更完整 |
| 60秒 | 长篇，多线叙事 |
| 自定义 | 用户输入秒数 |

## 4.6 图片比例

| **比例** | **说明** |
| --- | --- |
| 3:4 竖版（默认） | 最适合手机漫剧 |
| 1:1 方形 | 适合社交媒体 |
| 16:9 横版 | 适合横屏展示 |
| 自定义 | 用户输入比例 |

## 4.7 缓存规则

相同文案 + 相同参数（风格、时长、镜头数）的脚本结果缓存 7 天，省省 API 调用成本。过期后重新生成。

## 4.8 AI 脚本生成规则（System Prompt）

### 4.8.1 好脚本标准

- 第一格就让人想继续看下去
- 每格之间有因果关系，不是独立的
- 反转出乎意料但在情理之中
- 最后一格让人意犹未尽
- 对白口语化，像短视频里的真人对话，不像作文

### 4.8.2 坏脚本特征（禁止）

- 开头平淡无聊（"从前有一个人..."）
- 剧情拖沓，中间有废话
- 角色行为不合理
- 连续几格场景没变化，视觉无聊

### 4.8.3 创作自由度

- 用户输入模糊时，AI 自主补充细节，直接生成
- 可以添加用户没提到的角色和剧情
- 但必须保留用户文案的核心元素

### 4.8.4 对白规则

- 对白可以为空（纯画面叙事也行）
- 语言风格口语化，像短视频那样直接
- 长度不限制，AI 自己判断

### 4.8.5 内容安全

- 用 AI 自动过滤用户输入的敏感内容（色情/暴力/违法）
- 过滤后返回友好提示，引导用户修改文案
- 这是 App Store 上架必须的安全措施

### 4.8.6 角色一致性

- MVP：通过 Prompt 详细描述角色外貌特征，在每格的 image_prompt 中复用相同描述
- V2：用第 1 格生成的角色图片作为参考图，传入后续格子的生图请求

### 4.8.7 生图 Prompt 规则

- 由 refine_script 节点自动生成英文 image_prompt，用户不可见
- 每种叙事风格自动匹配对应的漫画画风关键词
- 所有 image_prompt 均加入基础约束：comic panel, manga illustration, 2D, clean line art
- 所有 image_prompt 均加入负向约束：no speech bubbles, no dialogue text, no text overlay
- 若该格有音效，则在 image_prompt 中加入音效文字指令

### 4.8.8 8 种风格对应的画风关键词

| **叙事风格** | **画风关键词** |
| --- | --- |
| 悬疑反转 | dark manga, suspense atmosphere, dramatic shadows, noir comic |
| 搞笑沙雕 | chibi manga, exaggerated expressions, comedy manga, sweat drops |
| 治愈温情 | soft manga, warm tones, gentle lighting, shoujo style |
| 暗黑爆爽 | dark manga, intense action, dramatic angles, seinen style |
| 古风仙侠 | chinese manhua, wuxia style, ink wash elements, traditional robes |
| 超能力奇幻 | shounen manga, energy effects, dynamic poses, power aura |
| 恐怖惊悚 | horror manga, dark atmosphere, unsettling, junji ito inspired |
| 甜宠恋爱 | romance manga, sparkles, soft blush, shoujo bubbles, pastel |

# 5. 后端服务设计

## 5.1 LangGraph 状态图

### 链路 1：生成脚本（POST /api/generate-script）

parse_story → refine_script → 返回完整分镜脚本

**parse_story：**接收文案 + 风格 + 时长 + 镜头数，调用通义千问，按黄金公式拆解分镜脚本

**refine_script：**润色每格描述，补充视觉细节，为每格生成英文 image_prompt

### 链路 2：生成图片（POST /api/generate-images，SSE）

对每一格循环执行：generate_image → 上传 OSS → SSE 推送给 App

**generate_image：**根据 image_prompt 调用通义万相或 Nano Banana 生图

MVP 不做风格一致性检查（check_style），V2 再加。

### 链路 3：单格操作（直接调用，不经过 LangGraph）

**rewrite-panel：**直接调用通义千问重写单格脚本

**regenerate-image：**直接调用生图 API 重新生成单格图片

**generate-single-image：**为单格首次生成图片

## 5.2 API 接口完整清单

### MVP（12 个接口）

| **接口** | **方法** | **说明** |
| --- | --- | --- |
| /api/auth/login | POST | 登录（手机号/微信/Apple ID） |
| /api/auth/register | POST | 注册 |
| /api/generate-script | POST | 生成完整分镜脚本 |
| /api/rewrite-panel | POST | AI 重写单格脚本 |
| /api/generate-images | POST (SSE) | 一键生成全部图片，逐张推送 |
| /api/generate-single-image | POST | 单格生图 |
| /api/regenerate-image | POST | 重新生成指定格图片 |
| /api/export | POST | 导出（单张分开 + 生成链接） |
| /api/user/works | GET | 我的作品列表 |
| /api/user/drafts | GET | 我的草稿列表 |
| /api/drafts/save | POST | 保存草稿 |
| /api/user/profile | GET | 个人资料 |

### V2（13 个接口）

| **接口** | **方法** | **说明** |
| --- | --- | --- |
| /api/user/profile | PUT | 修改个人资料 |
| /api/explore/recommend | GET | 热门推荐作品 |
| /api/explore/latest | GET | 最新作品 |
| /api/explore/category | GET | 按风格分类 |
| /api/explore/search | GET | 搜索 |
| /api/works/{id}/like | POST | 点赞 |
| /api/works/{id}/collect | POST | 收藏 |
| /api/user/collections | GET | 我的收藏 |
| /api/user/likes | GET | 我的点赞 |
| /api/user/history | GET | 使用记录 |
| /api/user/works/{id} | DELETE | 删除作品 |
| /api/user/points | GET | 积分余额 |
| /api/points/consume | POST | 消耗积分 |

### V3（3 个接口）

| **接口** | **方法** | **说明** |
| --- | --- | --- |
| /api/works/{id}/comment | POST | 评论 |
| /api/works/{id}/comments | GET | 获取评论列表 |
| /api/report | POST | 举报/反馈 |

# 6. 环境变量配置

| **变量名** | **用途** | **示例** |
| --- | --- | --- |
| LLM_API_KEY | 通义千问 API Key | sk-xxxxx |
| LLM_BASE_URL | 通义千问 API 地址 | https://dashscope.aliyuncs.com/compatible-mode/v1 |
| LLM_MODEL | 文本模型 | qwen-plus |
| IMAGE_API_KEY | 通义万相 API Key | sk-xxxxx |
| IMAGE_BASE_URL | 通义万相 API 地址 | https://dashscope.aliyuncs.com/api/v1/... |
| IMAGE_MODEL | 生图模型 | wan2.5-t2i |
| GOOGLE_API_KEY | Gemini API Key（Nano Banana） | 可选 |
| OSS_ACCESS_KEY | 阿里云 OSS Access Key |  |
| OSS_SECRET_KEY | 阿里云 OSS Secret Key |  |
| OSS_BUCKET | OSS Bucket 名称 | comic-storyboard |
| DB_URL | MySQL 连接地址 | mysql://user:pass@host/db |

- API Key 不得提交到 Git，确保 .env 在 .gitignore 中

- 未配置 API Key 时后端返回 mock 数据

# 7. 开发路线图

## 7.1 第 1 周：后端核心 + 脚本生成

- 初始化 FastAPI + LangGraph 项目

- 实现 parse_story + refine_script 节点

- 实现 generate-script API（含 mock 回退）

- curl 测试跑通

## 7.2 第 2 周：生图 + 存储

- 对接通义万相 API

- 对接阿里云 OSS

- 实现 generate-images SSE 接口

- 实现单格生图 + 重新生成

## 7.3 第 3 周：用户系统 + 数据库

- MySQL 表结构设计

- 登录/注册 API

- 我的作品 + 草稿 API

- 导出 API

## 7.4 第 4 周：React Native 前端

- 初始化 React Native 项目

- 实现引导式创作流程（4 步）

- 实现脚本编辑页

- 实现生图 + SSE 实时显示

## 7.5 第 5 周：联调 + 优化 + 上架

- 前后端联调

- iOS 体验优化（触感反馈、动画、手势）

- 测试、修 bug

- App Store 审核提交

# 8. 确认汇总表

| **决策项** | **最终结果** |
| --- | --- |
| 前端技术 | React Native（iOS + 网页 + 未来 Android） |
| 后端框架 | Python FastAPI + LangGraph |
| 数据库 | MySQL |
| 图片存储 | 阿里云 OSS |
| 部署 | 阿里云 ECS（2核4G） |
| 文本 AI | 通义千问 qwen-plus |
| 生图 AI | 通义万相 wan2.5-t2i + Nano Banana |
| 登录方式 | 手机号 / 微信 / Apple ID |
| 底部 Tab | 创作 / 探索 / 我的 |
| 创作流程 | 引导式 4 步（文案→时长→风格→镜头数） |
| 时长选项 | 10s / 15s / 30s / 60s / 自定义 |
| 风格 | 8 种（悬疑/搞笑/治愈/暗黑/仙侠/奇幻/恐怖/甜宠） |
| 镜头数 | 4 / 6 / 9 / 12，默认 6 |
| 图片比例 | 3:4 / 1:1 / 16:9 / 自定义，默认 3:4 |
| 叙事结构 | Hook → Escalate → Twist → Cliffhanger |
| 生图方式 | SSE 流式推送，边生边看 |
| 脚本缓存 | 7 天过期 |
| 超时处理 | 30秒超时 + 自动重试 1 次 |
| 导出 | 单张分开 + 分享链接 |
| 设计风格 | Airbnb 风格，浅色主题，强调色创意紫 #7C5CFC |
| MVP 接口数 | 12 个 |
| V2 接口数 | 13 个 |
| V3 接口数 | 3 个 |
| 风格检查 | MVP 不做 |
| 积分系统 | MVP 不做 |
