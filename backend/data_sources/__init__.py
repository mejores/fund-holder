from typing import Dict, Type
from .base import BaseDataSource
from .akshare import AkShareDataSource
from .mock import MockDataSource

class DataSourceManager:
    _sources: Dict[str, Type[BaseDataSource]] = {
        'akshare': AkShareDataSource,
        'mock': MockDataSource
    }
    
    _current_source: BaseDataSource = None
    _current_source_name: str = None
    
    @classmethod
    def register_source(cls, name: str, source_class: Type[BaseDataSource]):
        """注册新的数据源"""
        cls._sources[name] = source_class
    
    @classmethod
    def set_source(cls, name: str):
        """切换数据源"""
        if name not in cls._sources:
            raise ValueError(f"Unknown data source: {name}")
        
        cls._current_source = cls._sources[name]()
        cls._current_source_name = name
    
    @classmethod
    def get_source(cls) -> BaseDataSource:
        """获取当前数据源"""
        if cls._current_source is None:
            cls.set_source('mock')
        return cls._current_source
    
    @classmethod
    def get_source_name(cls) -> str:
        """获取当前数据源名称"""
        return cls._current_source_name
    
    @classmethod
    def get_available_sources(cls) -> Dict:
        """获取所有可用数据源"""
        return {name: {'name': name, 'description': cls._sources[name].__doc__} for name in cls._sources}