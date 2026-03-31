"""积分系统 API

MVP 阶段用内存存储，后续对接 MySQL。
每个用户通过 user_id 标识（从 auth token 中获取，MVP 先用固定值）。
"""

from datetime import datetime, date
from fastapi import APIRouter, HTTPException

from app.models import (
    POINTS_COST,
    POINTS_EARN,
    POINTS_PACKAGES,
    PointsBalance,
    PointsLog,
    ConsumePointsInput,
    ConsumePointsOutput,
    PurchaseInput,
)

router = APIRouter(prefix="/api/points", tags=["积分"])

# ── 内存存储（MVP，后续换 MySQL）──
_user_points: dict[str, int] = {}  # user_id → balance
_user_logs: dict[str, list[dict]] = {}  # user_id → [log, ...]
_user_checkin: dict[str, str] = {}  # user_id → last_checkin_date


def _get_user_id() -> str:
    """MVP: 固定用户ID，后续从 auth token 获取"""
    return "default_user"


def _ensure_user(uid: str):
    if uid not in _user_points:
        # 新用户初始化，送注册积分
        _user_points[uid] = POINTS_EARN["register"]
        _user_logs[uid] = [{
            "amount": POINTS_EARN["register"],
            "action": "register",
            "balance": POINTS_EARN["register"],
            "created_at": datetime.now().isoformat(),
        }]


def _add_log(uid: str, amount: int, action: str):
    _user_points[uid] += amount
    _user_logs.setdefault(uid, []).insert(0, {
        "amount": amount,
        "action": action,
        "balance": _user_points[uid],
        "created_at": datetime.now().isoformat(),
    })


# ── 查询余额 ──
@router.get("/balance", response_model=PointsBalance)
async def get_balance():
    uid = _get_user_id()
    _ensure_user(uid)
    today = date.today().isoformat()
    return PointsBalance(
        balance=_user_points[uid],
        today_checkin=_user_checkin.get(uid) == today,
    )


# ── 查询流水 ──
@router.get("/logs")
async def get_logs(limit: int = 20):
    uid = _get_user_id()
    _ensure_user(uid)
    logs = _user_logs.get(uid, [])[:limit]
    return {"logs": logs}


# ── 消耗积分 ──
@router.post("/consume", response_model=ConsumePointsOutput)
async def consume_points(input: ConsumePointsInput):
    uid = _get_user_id()
    _ensure_user(uid)

    cost = input.amount or POINTS_COST.get(input.action, 0)
    if cost <= 0:
        raise HTTPException(400, f"未知操作: {input.action}")

    if _user_points[uid] < cost:
        return ConsumePointsOutput(
            success=False,
            balance=_user_points[uid],
            message=f"积分不足，当前 {_user_points[uid]}，需要 {cost}",
        )

    _add_log(uid, -cost, input.action)
    return ConsumePointsOutput(
        success=True,
        balance=_user_points[uid],
        message=f"消耗 {cost} 积分",
    )


# ── 每日签到 ──
@router.post("/checkin", response_model=ConsumePointsOutput)
async def daily_checkin():
    uid = _get_user_id()
    _ensure_user(uid)

    today = date.today().isoformat()
    if _user_checkin.get(uid) == today:
        return ConsumePointsOutput(
            success=False,
            balance=_user_points[uid],
            message="今天已经签到过了",
        )

    _user_checkin[uid] = today
    earn = POINTS_EARN["daily_checkin"]
    _add_log(uid, earn, "daily_checkin")
    return ConsumePointsOutput(
        success=True,
        balance=_user_points[uid],
        message=f"签到成功，+{earn} 积分",
    )


# ── 获取积分包列表 ──
@router.get("/packages")
async def get_packages():
    return {"packages": POINTS_PACKAGES}


# ── 购买积分包（MVP: 直接到账，不对接支付）──
@router.post("/purchase", response_model=ConsumePointsOutput)
async def purchase_package(input: PurchaseInput):
    uid = _get_user_id()
    _ensure_user(uid)

    pkg = next((p for p in POINTS_PACKAGES if p["id"] == input.package_id), None)
    if not pkg:
        raise HTTPException(400, f"未知套餐: {input.package_id}")

    _add_log(uid, pkg["points"], f"purchase_{pkg['id']}")
    return ConsumePointsOutput(
        success=True,
        balance=_user_points[uid],
        message=f"购买成功，+{pkg['points']} 积分",
    )
