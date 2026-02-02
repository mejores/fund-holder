from .funds import router as funds_router
from .data_sources import router as data_sources_router
from .auth import router as auth_router
from .funds_management import router as funds_management_router

__all__ = ['funds_router', 'data_sources_router', 'auth_router', 'funds_management_router']