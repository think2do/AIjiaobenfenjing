"""数据库模块 — SQLite（MVP），可平滑迁移到 MySQL"""

import json
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./data.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


# ── 用户表 ──
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(50), default="")
    avatar = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)


# ── 作品表 ──
class WorkDB(Base):
    __tablename__ = "works"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(100), default="")
    story = Column(Text, default="")
    style = Column(String(50), default="")
    status = Column(String(20), default="in_progress")  # generating / in_progress / completed
    script_json = Column(Text, default="")  # ScriptResult JSON
    images_json = Column(Text, default="")  # {panel_number: url} JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ── 创建表 ──
Base.metadata.create_all(bind=engine)


# ── 依赖注入 ──
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
