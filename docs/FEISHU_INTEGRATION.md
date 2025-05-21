# 飞书多维表格集成文档

本文档详细介绍了业务流程管理平台如何与飞书多维表格集成，用于数据存储和管理。

## 集成架构

业务流程管理平台使用飞书多维表格作为主要数据存储方案，通过飞书开放平台API进行数据读写。整体架构如下：

```
用户界面 (Next.js) <--> API路由 <--> 飞书API <--> 飞书多维表格
```

## 数据表结构

在多维表格 `FssDbi5hoaxcSAsFnMFceab0nde` 中的"业务流程管理平台"文件夹下，需要创建以下三个数据表：

### 1. 业务流

用于存储业务流程数据，建议包含以下字段：

| 字段名 | 字段类型 | 说明 |
|-------|---------|-----|
| id | 文本 | 业务流ID |
| name | 文本 | 业务流名称 |
| description | 文本 | 业务流描述 |
| parent_id | 文本 | 父级业务流ID（用于构建层级关系） |
| projects | 数字 | 关联项目数量 |
| resources | 数字 | 关联资源数量 |
| last_accessed | 日期 | 最后访问时间 |

### 2. 常用网站

用于存储网站链接数据，建议包含以下字段：

| 字段名 | 字段类型 | 说明 |
|-------|---------|-----|
| name | 文本 | 网站名称 |
| category | 单选 | 网站分类（如"资讯类网站", "抖音调研工具"等） |
| subcategory | 单选 | 网站子分类（可选，如"宏观资讯", "企业资讯"等） |
| description | 文本 | 网站描述 |
| url | 文本 | 网站URL |

### 3. 文档助手

用于存储文档助手数据，建议包含以下字段：

| 字段名 | 字段类型 | 说明 |
|-------|---------|-----|
| name | 文本 | 项目名称 |
| category | 单选 | 项目分类（如"快捷方式-创建文档", "项目记录"等） |
| subcategory | 单选 | 项目子分类（可选） |
| description | 文本 | 项目描述 |
| url | 文本 | 项目链接（可选） |

## API 集成

平台使用 Next.js 的 API 路由功能与飞书API集成。主要API路由包括：

1. `/api/feishu/auth.ts` - 认证工具函数
2. `/api/feishu/business-flows/route.ts` - 业务流数据API
3. `/api/feishu/websites/route.ts` - 常用网站数据API
4. `/api/feishu/assistant/route.ts` - 文档助手数据API

每个API路由都实现了基本的 CRUD 操作，包括：
- GET: 获取数据列表
- POST: 创建新数据
- PATCH: 更新现有数据
- DELETE: 删除数据（待实现）

## 环境配置

需要在 `.env.local` 文件中配置以下环境变量：

```
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_BASE_ID=FssDbi5hoaxcSAsFnMFceab0nde
```

## 飞书应用配置

1. 创建企业自建应用
2. 配置应用权限（bitable相关权限）
3. 发布应用到企业

## 扩展与优化建议

1. 添加缓存层减少API调用
2. 实现飞书webhook以支持实时数据更新
3. 添加数据验证层
4. 实现完整的错误处理机制
5. 增加数据迁移工具，支持在本地开发环境使用JSON文件模拟数据 