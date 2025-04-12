# utils.py
from datetime import datetime, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verificar_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def calcular_fecha_vencimiento_habil(fecha_inicio: datetime, dias: int) -> datetime:
    fecha = fecha_inicio
    while dias > 0:
        fecha += timedelta(days=1)
        if fecha.weekday() < 5:  # 0 = lunes, 6 = domingo
            dias -= 1
    return fecha
