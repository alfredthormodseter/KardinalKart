import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool

load_dotenv()

DB_URL = os.environ.get("DB_URL", "").strip()
if not DB_URL:
    raise RuntimeError("DB_URL is not set")
for prefix in ("postgres://", "postgresql://"):
    if DB_URL.startswith(prefix):
        DB_URL = "postgresql+psycopg://" + DB_URL[len(prefix):]
        break

engine = create_engine(DATABASE_URL, poolclass=NullPool, pool_pre_ping=True)
