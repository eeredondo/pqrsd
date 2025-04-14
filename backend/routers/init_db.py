from fastapi import APIRouter
from database import Base, engine
from models import Usuario  # importa aquí todos tus modelos

router = APIRouter()

@router.get("/init-db")
def init_db():
    Base.metadata.create_all(bind=engine)
    return {"status": "Tablas creadas"}
