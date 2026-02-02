from fastapi import APIRouter, Query
from typing import List, Dict, Optional
from data_sources import DataSourceManager

router = APIRouter()

@router.get("/search")
async def search_funds(keyword: str, limit: int = Query(20, ge=1, le=100)) -> List[Dict]:
    """搜索基金"""
    source = DataSourceManager.get_source()
    return source.search_funds(keyword, limit)

@router.get("/{fund_code}/detail")
async def get_fund_detail(fund_code: str) -> Dict:
    """获取基金详情"""
    source = DataSourceManager.get_source()
    return source.get_fund_detail(fund_code)

@router.get("/{fund_code}/estimate")
async def get_fund_estimate(fund_code: str) -> Dict:
    """获取基金实时估值"""
    source = DataSourceManager.get_source()
    return source.get_fund_estimate(fund_code)

@router.get("/{fund_code}/history")
async def get_fund_history(
    fund_code: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> List[Dict]:
    """获取基金历史净值"""
    source = DataSourceManager.get_source()
    return source.get_fund_history(fund_code, start_date, end_date)

@router.get("/{fund_code}/holdings")
async def get_fund_holdings(fund_code: str) -> List[Dict]:
    """获取基金重仓股"""
    source = DataSourceManager.get_source()
    return source.get_fund_holdings(fund_code)

@router.get("/{fund_code}/managers")
async def get_fund_managers(fund_code: str) -> List[Dict]:
    """获取基金经理信息"""
    source = DataSourceManager.get_source()
    return source.get_fund_managers(fund_code)