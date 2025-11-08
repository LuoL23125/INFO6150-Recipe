# 🍳 美味食谱网站

一个基于React和Material-UI构建的现代化食谱分享平台，支持用户认证、食谱搜索、收藏管理等功能。

## 🚀 快速开始

### 1. 安装项目
```bash
# 克隆项目
git clone https://github.com/你的用户名/recipe-website.git
cd recipe-website

# 安装依赖
npm install
```

### 2. 配置API（可选）
在根目录创建 `.env` 文件：
```
VITE_SPOONACULAR_API_KEY=你的API密钥
```

> 提示：不配置API也可以使用，会显示演示数据！

### 3. 启动项目
```bash
npm run dev:all
```

访问：
- 前端：http://localhost:5173
- 后端：http://localhost:3001

## 📱 功能介绍

### 游客功能
- 🔍 搜索食谱
- 📖 查看食谱详情
- 🎲 每日推荐食谱

### 用户功能
- 🔐 注册/登录
- ❤️ 收藏食谱
- 👤 个人资料管理
- 📊 收藏夹管理

## 🔑 测试账号
```
邮箱：demo@example.com
密码：demo123
```

## 📁 项目结构
```
src/
├── components/     # 组件
├── pages/         # 页面
├── services/      # 服务
├── utils/         # 工具
└── App.jsx        # 主应用
```

## 🛠️ 常用命令
```bash
npm run dev        # 启动前端
npm run server     # 启动后端
npm run dev:all    # 同时启动前后端
npm run build      # 构建项目
```

## 🐛 常见问题

### 白屏问题
- 检查控制台错误
- 确认依赖已安装
- 验证文件路径正确

### 登录失败
- 确保JSON Server运行中
- 检查db.json格式
- 使用测试账号

### API限制
- 免费版每天150次
- 超限后使用缓存数据

## 📝 作者
INFO6150 课程项目