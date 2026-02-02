import akshare as ak
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from .base import BaseDataSource

class AkShareDataSource(BaseDataSource):
    def search_funds(self, keyword: str, limit: int = 20) -> List[Dict]:
        results = []
        try:
            if len(keyword) == 6 and keyword.isdigit():
                # 方法1: 使用fund_individual_basic_info_xq获取基金基本信息
                try:
                    fund_basic = ak.fund_individual_basic_info_xq(symbol=keyword)
                    if not fund_basic.empty:
                        code = next(item['value'] for item in fund_basic.to_dict('records') if item['item'] == '基金代码')
                        name = next(item['value'] for item in fund_basic.to_dict('records') if item['item'] == '基金名称')
                        full_name = next(item['value'] for item in fund_basic.to_dict('records') if item['item'] == '基金全称')
                        fund_type = next(item['value'] for item in fund_basic.to_dict('records') if item['item'] == '基金类型')
                        if name and name.strip() and len(name) > 2:
                            results.append({
                                'code': code,
                                'name': name,
                                'full_name': full_name,
                                'type': fund_type
                            })
                except Exception as e:
                    print(f"获取基金基本信息失败: {e}")
                
                # 方法2: 通过ETF基金信息获取
                try:
                    fund_etf = ak.fund_etf_fund_info_em(symbol=keyword)
                    if not fund_etf.empty and not any(item['code'] == keyword for item in results):
                        results.append({
                            'code': keyword,
                            'name': fund_etf['基金简称'].iloc[0],
                            'full_name': fund_etf['基金全称'].iloc[0],
                            'type': 'ETF'
                        })
                except Exception as e:
                    print(f"获取ETF基金信息失败: {e}")
            
            return results[:limit]
        except Exception as e:
            print(f"Search funds error: {e}")
            return []

    def get_fund_detail(self, fund_code: str) -> Dict:
        try:
            fund_basic = ak.fund_individual_basic_info_xq(symbol=fund_code)
            
            if fund_basic.empty:
                return {}
            
            fund_info_dict = dict(zip(fund_basic['item'], fund_basic['value']))
            
            detail = {
                'code': fund_info_dict.get('基金代码', fund_code),
                'name': fund_info_dict.get('基金名称', ''),
                'full_name': fund_info_dict.get('基金全称', ''),
                'type': fund_info_dict.get('基金类型', ''),
                'manager': fund_info_dict.get('基金经理', ''),
                'establish_date': fund_info_dict.get('成立时间', ''),
                'scale': fund_info_dict.get('最新规模', ''),
                'rating': fund_info_dict.get('基金评级', '暂无评级'),
                'risk_level': fund_info_dict.get('风险等级', fund_info_dict.get('基金评级', '暂无评级')),
                'fund_company': fund_info_dict.get('基金公司', ''),
                'trustee_bank': fund_info_dict.get('托管银行', ''),
                'investment_strategy': fund_info_dict.get('投资策略', ''),
                'investment_target': fund_info_dict.get('投资目标', ''),
                'performance_benchmark': fund_info_dict.get('业绩比较基准', '')
            }
            
            return detail
        except Exception as e:
            print(f"Get fund detail error: {e}")
            return {}

    def get_fund_estimate(self, fund_code: str) -> Dict:
        try:
            fund_open = ak.fund_open_fund_info_em(symbol=fund_code)
            
            if not fund_open.empty:
                latest = fund_open.iloc[-1]
                yesterday_nav = None
                
                # 获取昨日净值
                if len(fund_open) > 1:
                    yesterday = fund_open.iloc[-2]
                    yesterday_nav = yesterday['单位净值']
                else:
                    yesterday_nav = latest['单位净值']  # 使用当日净值作为昨日净值
                
                result = {
                    'code': fund_code,
                    'name': self.get_fund_name_by_code(fund_code),
                    'estimate_value': latest['单位净值'],
                    'estimate_change': latest['日增长率'],
                    'estimate_time': latest['净值日期'],
                    'unit_nav': latest['单位净值'],
                    'yesterday_nav': yesterday_nav,
                    'nav_date': latest['净值日期']
                }
                
                print(f"[API] fund {fund_code}: estimate_value={result['estimate_value']}, estimate_change={result['estimate_change']}%, yesterday_nav={result['yesterday_nav']}")
                return result
            return {}
        except Exception as e:
            print(f"Get fund estimate error for {fund_code}: {e}")
            return {}
    
    def get_fund_name_by_code(self, fund_code: str) -> str:
        try:
            fund_basic = ak.fund_individual_basic_info_xq(symbol=fund_code)
            if not fund_basic.empty:
                fund_info_dict = dict(zip(fund_basic['item'], fund_basic['value']))
                return fund_info_dict.get('基金名称', fund_code)
            return fund_code
        except Exception as e:
            print(f"Get fund name error: {e}")
            return fund_code

    def get_fund_history(self, fund_code: str, start_date: str = None, end_date: str = None) -> List[Dict]:
        try:
            fund_open = ak.fund_open_fund_info_em(symbol=fund_code)
            
            if fund_open.empty:
                return []
            
            # 过滤日期范围
            if start_date:
                fund_open = fund_open[fund_open['净值日期'] >= start_date]
            if end_date:
                fund_open = fund_open[fund_open['净值日期'] <= end_date]
            
            history_list = []
            for _, row in fund_open.iterrows():
                history_list.append({
                    'date': row['净值日期'],
                    'unit_nav': row['单位净值'],
                    'accumulated_nav': row['单位净值'],  # 暂时使用单位净值作为累计净值
                    'change_pct': row['日增长率']
                })
            
            return history_list
        except Exception as e:
            print(f"Get fund history error: {e}")
            return []

    def get_fund_holdings(self, fund_code: str) -> List[Dict]:
        try:
            print(f"[DEBUG] Getting holdings for fund: {fund_code}")
            fund_holdings = ak.fund_portfolio_hold_em(symbol=fund_code)
            
            print(f"[DEBUG] Raw holdings data shape: {fund_holdings.shape}")
            print(f"[DEBUG] Raw holdings columns: {list(fund_holdings.columns)}")
            
            holdings_list = []
            for _, row in fund_holdings.iterrows():
                stock_code = row['股票代码']
                change = 0.0
                open_price = 0.0
                close_price = 0.0
                volume = 0.0
                
                try:
                    stock_history = ak.stock_zh_a_hist(symbol=stock_code, period="daily", start_date="20250101", end_date="20251231", adjust="qfq")
                    if not stock_history.empty:
                        latest = stock_history.tail(1)
                        change = latest['涨跌幅'].values[0]
                        open_price = latest['开盘'].values[0]
                        close_price = latest['收盘'].values[0]
                        volume = latest['成交量'].values[0]
                except Exception as e:
                    print(f"获取股票 {stock_code} 数据失败: {e}")
                
                holdings_list.append({
                    'stock_code': stock_code,
                    'stock_name': row['股票名称'],
                    'holdings_ratio': row['占净值比例'],
                    'holdings_count': row['持股数'],
                    'open': open_price,
                    'close': close_price,
                    'volume': volume,
                    'change': change
                })
            
            print(f"[DEBUG] Returning {len(holdings_list)} holdings")
            return holdings_list[:10]
        except Exception as e:
            print(f"Get fund holding error: {e}")
            return []

    def get_fund_managers(self, fund_code: str) -> List[Dict]:
        try:
            fund_managers = ak.fund_manager_em(symbol=fund_code)
            
            managers_list = []
            for _, row in fund_managers.iterrows():
                managers_list.append({
                    'name': row['基金经理'],
                    'start_date': row['任职日期'],
                    'end_date': row['离任日期'],
                    'fund_return': row['任职期间收益率']
                })
            
            return managers_list
        except Exception as e:
            print(f"Get fund managers error: {e}")
            return []