# 业务流程管理平台

一个用于创建、管理和监控企业业务流程的综合性平台，支持业务流、项目开发和资源库的统一管理。

## 技术栈

- **前端框架**: Next.js 15.x (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 3.x
- **状态管理**: React Hooks
- **UI组件**: 自定义组件库
- **后端服务**: Supabase (PostgreSQL) 和 飞书多维表格 API
- **部署**: Vercel

## 主要功能

- 仪表盘 - 数据统计与业务流血缘关系图
- 业务流 - 流程设计与可视化编辑
- 项目开发 - 项目进度跟踪与管理
- 资源库 - 资源管理与状态监控
- 数据字典 - 项目与资源数据字段管理
- 常用网站 - 分类快捷链接管理
- 文档助手 - 辅助文档工具

## 开发环境设置

### 前提条件

- Node.js 22.x LTS
- npm 10.x+

### 安装与运行

1. 克隆项目

```bash
git clone [项目仓库地址]
cd business-process-management-platform
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建 `.env.local` 文件，并添加如下配置：

```
# Feishu API credentials for the Business Process Management Platform
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_BASE_ID=FssDbi5hoaxcSAsFnMFceab0nde
```

4. 启动开发服务器

```bash
npm run dev
```

5. 构建项目

```bash
npm run build
```

6. 启动生产服务器

```bash
npm run start
```

## 飞书集成设置

本项目使用飞书多维表格作为数据存储。按照以下步骤配置飞书应用和API访问：

1. 登录[飞书开放平台](https://open.feishu.cn/app)并创建企业自建应用
2. 获取应用的 App ID 和 App Secret
3. 配置应用权限：在"权限管理"中添加以下权限：
   - `bitable:app:read`: 读取多维表格
   - `bitable:app:write`: 写入多维表格
   - `bitable:app_field:read`: 读取字段配置
   - `bitable:app_record:read`: 读取记录
   - `bitable:app_record:write`: 写入记录
   - `bitable:app_table:read`: 读取数据表
4. 将应用发布到企业以获得API访问权限
5. 在多维表格 `FssDbi5hoaxcSAsFnMFceab0nde` 中创建名为 "业务流程管理平台" 的文件夹
6. 在该文件夹下创建如下三个数据表：
   - "业务流": 存储业务流程数据
   - "常用网站": 存储网站链接数据
   - "文档助手": 存储文档助手数据
7. 将飞书应用的 App ID 和 App Secret 添加到 `.env.local` 文件

## 项目结构

```
app/                   # Next.js应用目录
  (main)/              # 主应用路由
    business-flow/     # 业务流模块页面
    project/           # 项目管理页面
    resource/          # 资源库页面
    websites/          # 常用网站页面
    assistant/         # 文档助手页面
    page.tsx           # 仪表盘页面
  api/                 # API路由
    feishu/            # 飞书API集成
  components/          # 组件目录
    layout/            # 布局组件
    ui/                # UI组件
  globals.css          # 全局样式
lib/                   # 工具函数
public/                # 静态资源
docs/                  # 文档
```

## 贡献指南

1. Fork本项目
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个Pull Request

## 许可证

[MIT](LICENSE) 