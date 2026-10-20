"""
Database Connection & Session Management.
Supports MySQL (primary) and SQLite (fallback).
Automatically verifies and creates MySQL database schema if missing.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

db_url = settings.DATABASE_URL

if "mysql" in db_url:
    try:
        import pymysql
        from urllib.parse import urlparse
        # Dynamically extract credentials from db_url
        parsed = urlparse(db_url)
        db_user = parsed.username or os.getenv("MYSQL_USER", "root")
        db_pass = parsed.password or os.getenv("MYSQL_PASSWORD", "")
        db_host = parsed.hostname or os.getenv("MYSQL_HOST", "127.0.0.1")
        db_port = parsed.port or int(os.getenv("MYSQL_PORT", 3306))
        db_name = (parsed.path or "/healthcare_analytics").lstrip("/")

        conn_pre = pymysql.connect(
            host=db_host,
            user=db_user,
            password=db_pass,
            port=db_port
        )
        cur = conn_pre.cursor()
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4;")
        conn_pre.close()
        print(f"[+] MySQL database '{db_name}' verified/ready.")
    except Exception as e:
        print(f"[!] MySQL initialization notice: {e}. If offline, falling back.")

try:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=3600 if "mysql" in db_url else -1,
        connect_args={"check_same_thread": False} if "sqlite" in db_url else {}
    )
    # Test connection
    with engine.connect() as test_conn:
        pass
    print(f"[+] Connected to database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
except Exception as e:
    print(f"[!] Primary database connection failed: {e}. Falling back to SQLite.")
    sqlite_fallback = f"sqlite:///{os.path.join(settings.DATA_DIR, 'healthcare_analytics.db')}"
    engine = create_engine(sqlite_fallback, connect_args={"check_same_thread": False}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for obtaining transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
