from fastapi import APIRouter
from typing import Dict
from data_sources import DataSourceManager

router = APIRouter()

@router.get("/")
async def get_available_sources() -> Dict:
    """获取所有可用数据源"""
    return DataSourceManager.get_available_sources()

@router.get("/current")
async def get_current_source() -> Dict:
    """获取当前数据源"""
    return {
        'current_source': DataSourceManager.get_source_name()
    }

@router.post("/set/{source_name}")
async def set_source(source_name: str) -> Dict:
    """切换数据源"""
    try:
        DataSourceManager.set_source(source_name)
        return {
            'message': f'Successfully switched to {source_name}',
            'current_source': source_name
        }
    except ValueError as e:
        return {
            'error': str(e)
        }