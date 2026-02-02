from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Fund as DBFund, User
from models import Fund, FundCreate
from auth import get_current_user

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/", response_model=Fund, tags=["funds"])
def add_fund(fund: FundCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """添加基金"""
    # 检查基金是否已存在
    existing_fund = db.query(DBFund).filter(DBFund.user_id == current_user.id, DBFund.code == fund.code).first()
    if existing_fund:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"基金 {fund.code} 已存在，请勿重复添加"
        )
    
    db_fund = DBFund(
        user_id=current_user.id,
        code=fund.code,
        name=fund.name,
        holding_count=fund.holding_count,
        holding_amount=fund.holding_amount,
        current_profit=fund.current_profit or 0
    )
    db.add(db_fund)
    db.commit()
    db.refresh(db_fund)
    return db_fund

@router.get("/", response_model=List[Fund], tags=["funds"])
def get_my_funds(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取当前用户的基金列表"""
    funds = db.query(DBFund).filter(DBFund.user_id == current_user.id).all()
    print(f"[DEBUG] User {current_user.id} has {len(funds)} funds")
    for fund in funds:
        print(f"[DEBUG] Fund: {fund.code} - {fund.name}")
    return funds

@router.get("/{fund_id}", response_model=Fund, tags=["funds"])
def get_fund(fund_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取单个基金"""
    fund = db.query(DBFund).filter(DBFund.id == fund_id, DBFund.user_id == current_user.id).first()
    if not fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="基金不存在")
    return fund

@router.put("/{fund_id}", response_model=Fund, tags=["funds"])
def update_fund(fund_id: int, fund: FundCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """更新基金"""
    db_fund = db.query(DBFund).filter(DBFund.id == fund_id, DBFund.user_id == current_user.id).first()
    if not db_fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="基金不存在")
    
    db_fund.code = fund.code
    db_fund.name = fund.name
    db_fund.holding_count = fund.holding_count
    db_fund.holding_amount = fund.holding_amount
    db_fund.current_profit = fund.current_profit or 0
    db.commit()
    db.refresh(db_fund)
    return db_fund

@router.delete("/{fund_id}", tags=["funds"])
def delete_fund(fund_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """删除基金"""
    db_fund = db.query(DBFund).filter(DBFund.id == fund_id, DBFund.user_id == current_user.id).first()
    if not db_fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="基金不存在")
    
    db.delete(db_fund)
    db.commit()
    return {"message": "基金已删除"}
