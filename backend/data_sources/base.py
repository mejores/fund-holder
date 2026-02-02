from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Optional, Any

class BaseDataSource(ABC):
    @abstractmethod
    def search_funds(self, keyword: str, limit: int = 20) -> List[Dict]:
        """搜索基金"""
        pass

    @abstractmethod
    def get_fund_detail(self, fund_code: str) -> Dict:
        """获取基金详情"""
        pass

    @abstractmethod
    def get_fund_estimate(self, fund_code: str) -> Dict:
        """获取基金实时估值"""
        pass

    @abstractmethod
    def get_fund_history(self, fund_code: str, start_date: str = None, end_date: str = None) -> List[Dict]:
        """获取基金历史净值"""
        pass

    @abstractmethod
    def get_fund_holdings(self, fund_code: str) -> List[Dict]:
        """获取基金重仓股"""
        pass

    @abstractmethod
    def get_fund_managers(self, fund_code: str) -> List[Dict]:
        """获取基金经理信息"""
        pass