from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import logging

# Local application imports
from app.database import get_db
from app.schemas.trading import Portfolio, Position, TradeSignal, Order, PortfolioPerformance
from app.services.alpaca_service import alpaca_service
from app.models.trading import Portfolio as PortfolioModel, Position as PositionModel, TradeSignal as TradeSignalModel, User
from app.auth.dependencies import get_current_user # NEW: Authentication dependency

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=Portfolio)
async def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # CHANGED: Integrated authentication
):
    """
    Get the authenticated user's complete portfolio, combining database records
    with live data from the trading service (Alpaca).
    """
    try:
        # 1. Fetch the user's portfolio from the local database
        portfolio_db = db.query(PortfolioModel).filter(PortfolioModel.user_id == current_user.id).first()
        
        if not portfolio_db:
            # If no portfolio exists, create a default one for the user
            logger.info(f"No portfolio found for user {current_user.id}. Creating a default one.")
            portfolio_db = PortfolioModel(
                user_id=current_user.id,
                name=f"{current_user.username}'s Portfolio",
                cash_balance=100000.0, # Default starting paper cash
                total_value=100000.0
            )
            db.add(portfolio_db)
            db.commit()
            db.refresh(portfolio_db)

        # 2. Fetch live account and position data from Alpaca
        live_account_info = await alpaca_service.get_account_info()
        live_positions = await alpaca_service.get_positions()

        # 3. Combine and structure the final portfolio response
        # The most accurate values come directly from the trading account
        total_value = float(live_account_info.get("portfolio_value", portfolio_db.total_value))
        cash_balance = float(live_account_info.get("cash", portfolio_db.cash_balance))
        
        # Calculate daily P&L based on equity change
        last_equity = float(live_account_info.get("last_equity", total_value))
        daily_pnl = total_value - last_equity
        daily_pnl_percent = ((daily_pnl / last_equity) * 100) if last_equity != 0 else 0
        
        # Update our local DB with the latest cash balance
        portfolio_db.cash_balance = cash_balance
        portfolio_db.total_value = total_value
        db.commit()

        # 4. Construct the response object matching the Pydantic schema
        portfolio_response = Portfolio(
            id=portfolio_db.id,
            name=portfolio_db.name,
            totalValue=total_value,
            cashBalance=cash_balance,
            dailyPnL=daily_pnl,
            dailyPnLPercent=daily_pnl_percent,
            positions=live_positions # Add live positions to the response
        )
        
        return portfolio_response
        
    except Exception as e:
        logger.error(f"Failed to get portfolio for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve portfolio information.")


@router.post("/execute-trade", response_model=Dict[str, Any])
async def execute_trade(
    signal: TradeSignal, # CHANGED: Accepts the full signal object from the frontend
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Execute a trade based on a provided trading signal object.
    This aligns with the frontend ApiService call.
    """
    try:
        # Optional: Verify the signal exists in the database if it has an ID
        if signal.id:
            signal_db = db.query(TradeSignalModel).filter(TradeSignalModel.id == signal.id).first()
            if not signal_db:
                raise HTTPException(status_code=404, detail=f"Signal with ID {signal.id} not found.")
            if signal_db.executed:
                raise HTTPException(status_code=400, detail="Signal has already been executed.")
        
        # Execute the trade via Alpaca service
        order_result = await alpaca_service.execute_trade(signal)
        
        # If execution is successful, mark the signal as executed in the DB
        if order_result and signal.id:
            signal_db.executed = True
            # You could also store the order_result details (like order ID) here
            db.commit()
        
        logger.info(f"Trade executed for user {current_user.id} on signal for {signal.symbol}")
        return {"success": True, "message": "Trade executed successfully", "order": order_result}
        
    except HTTPException as http_exc:
        raise http_exc # Re-raise known HTTP exceptions
    except Exception as e:
        logger.error(f"Trade execution failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=f"Trade execution failed: {str(e)}")


@router.get("/performance", response_model=PortfolioPerformance)
async def get_portfolio_performance(
    current_user: User = Depends(get_current_user)
):
    """Get detailed portfolio performance metrics from the trading service."""
    try:
        account_info = await alpaca_service.get_account_info()
        return account_info # Pydantic will validate and map the fields
        
    except Exception as e:
        logger.error(f"Failed to get performance for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve performance data.")


@router.get("/orders", response_model=List[Order])
async def get_order_history(
    status: str = "all",
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get the user's order history from the trading service."""
    try:
        orders = await alpaca_service.get_orders(status=status, limit=limit)
        return orders
        
    except Exception as e:
        logger.error(f"Failed to get orders for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve order history.")