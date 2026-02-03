# 基金管理系统

一个基于React和FastAPI的web版基金管理系统。

## 功能特点

- 基金搜索（支持代码和名称）
- 基金详情展示（估值、净值、重仓股等）
- 历史净值走势图
- 可插拔的数据源（支持AkShare和Mock数据）

## 技术栈

### 后端
- Python 3.8+
- FastAPI
- AkShare（数据源）

### 前端
- React 18
- Vite
- React Router
- Axios
- ECharts（数据可视化）

## 项目结构

```
fund-holder/
├── backend/                 # FastAPI后端
│   ├── app.py              # 主应用
│   ├── routers/            # API路由
│   ├── data_sources/       # 数据源抽象层
│   │   ├── base.py         # 基类
│   │   ├── akshare.py      # AkShare实现
│   │   └── mock.py         # Mock数据
│   └── requirements.txt     # 依赖
└── frontend/               # React前端
    ├── src/
    │   ├── components/     # 组件
    │   ├── pages/          # 页面
    │   ├── services/       # API服务
    │   └── utils/          # 工具函数
    └── package.json
```

## 快速开始

### 1. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 运行后端服务

```bash
cd backend
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

后端服务将在 `http://localhost:8001` 运行。

### 3. 安装前端依赖

```bash
cd frontend
npm install
```

### 4. 运行前端服务

```bash
cd frontend
npm run dev
```

前端服务将在 `http://localhost:3000` 运行。

## 手机访问

如果需要在手机上访问应用：

1. 确保手机和电脑连接到**同一个路由器**
2. 获取电脑的局域网IP地址：`ipconfig`（Windows）或 `ifconfig`（Mac/Linux）
3. 在手机浏览器中输入：`http://电脑IP地址:3000/`
4. 就可以访问应用了

例如：`http://192.168.5.58:3000/`

## API接口

### 基金接口
- `GET /api/funds/search` - 搜索基金
- `GET /api/funds/{fund_code}/detail` - 获取基金详情
- `GET /api/funds/{fund_code}/estimate` - 获取基金实时估值
- `GET /api/funds/{fund_code}/history` - 获取基金历史净值
- `GET /api/funds/{fund_code}/holdings` - 获取基金重仓股
- `GET /api/funds/{fund_code}/managers` - 获取基金经理信息

### 数据源接口
- `GET /api/data_sources` - 获取可用数据源
- `GET /api/data_sources/current` - 获取当前数据源
- `POST /api/data_sources/set/{name}` - 切换数据源

## 数据源

目前支持以下数据源：

1. **Mock** - 模拟数据（默认）
2. **AkShare** - 真实基金数据

可以在前端页面顶部的下拉菜单中切换数据源。

## 开发说明

### 添加新的数据源

1. 在 `backend/data_sources/` 目录下创建新的数据源类
2. 继承 `BaseDataSource` 基类
3. 实现所有必需的方法
4. 在 `data_sources/__init__.py` 中注册新数据源

### 前端组件

- `FundSearch.jsx` - 基金搜索组件
- `FundDetail.jsx` - 基金详情组件

## 注意事项

1. AkShare数据源需要网络连接
2. Mock数据仅供演示使用
3. 建议在生产环境中使用真实的数据源

## License

MIT