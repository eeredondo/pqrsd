# backend/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Obtenemos la URL desde variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL")

# Crear el motor (PostgreSQL no necesita connect_args)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

# ✅ FUNCIÓN NECESARIA para que funcione Depends(get_db)
from fastapi import Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
