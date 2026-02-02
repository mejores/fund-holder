from datetime import datetime
from typing import List, Dict
from .base import BaseDataSource

class MockDataSource(BaseDataSource):
    def search_funds(self, keyword: str, limit: int = 20) -> List[Dict]:
        mock_funds = [
            {'code': '161725', 'name': '招商中证白酒', 'full_name': '招商中证白酒指数(LOF)A', 'type': '指数型'},
            {'code': '159995', 'name': '华夏国证半导体芯片ETF', 'full_name': '华夏国证半导体芯片ETF', 'type': 'ETF'},
            {'code': '515050', 'name': '华夏中证500ETF', 'full_name': '华夏中证500ETF', 'type': 'ETF'},
            {'code': '164205', 'name': '中海中证50指数增强', 'full_name': '中海中证50指数增强型证券投资基金', 'type': '增强型'},
        ]
        
        if keyword:
            mock_funds = [f for f in mock_funds if keyword in f['name'] or keyword == f['code']]
        
        return mock_funds[:limit]

    def get_fund_detail(self, fund_code: str) -> Dict:
        return {
            'code': fund_code,
            'name': '招商中证白酒指数(LOF)A',
            'full_name': '招商中证白酒指数(LOF)A',
            'type': '指数型-股票',
            'manager': '侯昊',
            'establish_date': '2015-05-27',
            'scale': '813.17亿元',
            'rating': '5星',
            'benchmark': '中证白酒指数',
            'risk_level': '高风险'
        }

    def get_fund_estimate(self, fund_code: str) -> Dict:
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M')
        return {
            'code': fund_code,
            'name': '招商中证白酒指数(LOF)A',
            'estimate_value': 1.4567,
            'estimate_change': 2.34,
            'estimate_time': current_time,
            'unit_nav': 1.4256,
            'yesterday_nav': 1.4256,
            'nav_date': datetime.now().strftime('%Y-%m-%d')
        }

    def get_fund_history(self, fund_code: str, start_date: str = None, end_date: str = None) -> List[Dict]:
        history_list = []
        base_value = 1.40
        current_date = datetime.now()
        
        for i in range(30):
            date = current_date - datetime.timedelta(days=i)
            value = base_value + (i % 10 - 5) * 0.01
            history_list.append({
                'date': date.strftime('%Y-%m-%d'),
                'unit_nav': round(value, 4),
                'accumulated_nav': round(value * 1.2, 4),
                'change_pct': round((value - base_value) / base_value * 100, 2)
            })
        
        return history_list

    def get_fund_holdings(self, fund_code: str) -> List[Dict]:
        return [
            {'stock_code': '600519', 'stock_name': '贵州茅台', 'holdings_ratio': 15.23, 'holdings_count': 12345678},
            {'stock_code': '000858', 'stock_name': '五粮液', 'holdings_ratio': 14.89, 'holdings_count': 23456789},
            {'stock_code': '000568', 'stock_name': '泸州老窖', 'holdings_ratio': 8.76, 'holdings_count': 34567890},
            {'stock_code': '600809', 'stock_name': '山西汾酒', 'holdings_ratio': 7.65, 'holdings_count': 45678901},
            {'stock_code': '002304', 'stock_name': '洋河股份', 'holdings_ratio': 6.54, 'holdings_count': 56789012},
            {'stock_code': '000799', 'stock_name': '酒鬼酒', 'holdings_ratio': 5.43, 'holdings_count': 67890123},
            {'stock_code': '600702', 'stock_name': '舍得酒业', 'holdings_ratio': 4.32, 'holdings_count': 78901234},
            {'stock_code': '000860', 'stock_name': '顺鑫农业', 'holdings_ratio': 3.21, 'holdings_count': 89012345},
            {'stock_code': '603369', 'stock_name': '今世缘', 'holdings_ratio': 2.10, 'holdings_count': 90123456},
            {'stock_code': '000999', 'stock_name': '华润双鹤', 'holdings_ratio': 1.05, 'holdings_count': 123456789}
        ]

    def get_fund_managers(self, fund_code: str) -> List[Dict]:
        return [
            {
                'name': '侯昊',
                'start_date': '2017-08-22',
                'end_date': '',
                'fund_return': 125.34
            }
        ]