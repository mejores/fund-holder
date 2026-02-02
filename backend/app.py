from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers.funds import router as funds_router
from routers.data_sources import router as data_sources_router
from routers.auth import router as auth_router
from routers.funds_management import router as funds_management_router
from data_sources import DataSourceManager
from database import init_db

app = FastAPI(title="基金管理系统 API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 默认使用 AkShare 数据源
DataSourceManager.set_source('akshare')

# 初始化数据库
init_db()

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(funds_router, prefix="/api/funds", tags=["funds"])
app.include_router(funds_management_router, prefix="/api/funds-management", tags=["funds-management"])
app.include_router(data_sources_router, prefix="/api/data_sources", tags=["data_sources"])

@app.get("/")
async def read_root():
    return {"message": "基金管理系统 API 正在运行", "version": "1.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)