from fastapi import APIRouter
from app.api.v1.endpoints import auth, trading, portfolio, news, chat, market_data

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(trading.router, prefix="/trading", tags=["trading"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(market_data.router, prefix="/market-data", tags=["market-data"])
