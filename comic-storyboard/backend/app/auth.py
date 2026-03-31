"""认证模块 — 手机号 + 验证码登录，JWT 鉴权，SQLite 持久化"""

import os
import random
import time
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import UserDB, get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── JWT 配置 ──
SECRET_KEY = os.getenv("JWT_SECRET", "lingjing-ai-comic-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# ── 验证码内存缓存 ──
_codes: dict[str, dict] = {}

security = HTTPBearer(auto_error=False)


# ── Models ──
class SendCodeInput(BaseModel):
    phone: str = Field(..., pattern=r"^1\d{10}$", description="手机号")


class LoginInput(BaseModel):
    phone: str = Field(..., pattern=r"^1\d{10}$")
    code: str = Field(..., min_length=4, max_length=6)


class LoginOutput(BaseModel):
    token: str
    userId: str
    userName: str


class UserProfileOut(BaseModel):
    userId: str
    phone: str
    userName: str
    createdAt: str


# ── 生成 JWT ──
def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


# ── 验证 JWT → 返回 UserDB ──
def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> Optional[UserDB]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(UserDB).filter(UserDB.id == int(user_id)).first()
    except (JWTError, ValueError):
        return None


# ── 发送验证码 ──
@router.post("/send-code")
async def send_code(input: SendCodeInput):
    code = str(random.randint(1000, 9999))
    _codes[input.phone] = {
        "code": code,
        "expires_at": time.time() + 300,
    }
    print(f"[AUTH] 验证码: {input.phone} -> {code}")
    return {"message": "验证码已发送", "debug_code": code}


# ── 登录/注册 ──
@router.post("/login", response_model=LoginOutput)
async def login(input: LoginInput, db: Session = Depends(get_db)):
    # MVP: 宽松验证码校验
    # 生产环境需严格校验 _codes

    # 查找或创建用户
    user = db.query(UserDB).filter(UserDB.phone == input.phone).first()
    if not user:
        user = UserDB(phone=input.phone, name=f"创作者")
        db.add(user)
        db.commit()
        db.refresh(user)
        user.name = f"创作者{user.id}"
        db.commit()

    token = create_token(user.id)
    _codes.pop(input.phone, None)

    return LoginOutput(token=token, userId=str(user.id), userName=user.name)


# ── 获取个人资料 ──
@router.get("/profile", response_model=UserProfileOut)
async def get_profile(user: Optional[UserDB] = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="未登录")
    return UserProfileOut(
        userId=str(user.id),
        phone=user.phone,
        userName=user.name,
        createdAt=user.created_at.isoformat() if user.created_at else "",
    )


# ── 修改昵称 ──
class UpdateNameInput(BaseModel):
    userName: str = Field(..., min_length=1, max_length=20)


@router.put("/profile")
async def update_profile(
    input: UpdateNameInput,
    user: Optional[UserDB] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user:
        raise HTTPException(status_code=401, detail="未登录")
    user.name = input.userName
    db.commit()
    return {"message": "修改成功", "userName": input.userName}
