import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DB_URL = os.environ["DB_URL"]
engine = create_engine(DB_URL)
