# utils.py
from datetime import datetime, timedelta
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
import smtplib
from email.message import EmailMessage
from typing import List

# Cargar variables de entorno desde .env
load_dotenv()

# Seguridad
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verificar_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Cálculo de fechas hábiles (sin contar 14 al 18 de abril de 2025)
def calcular_fecha_vencimiento_habil(fecha_inicio: datetime, dias: int) -> datetime:
    fecha = fecha_inicio + timedelta(days=1)  # empezar desde mañana
    feriados = [
        datetime(2025, 4, 14),
        datetime(2025, 4, 15),
        datetime(2025, 4, 16),
        datetime(2025, 4, 17),
        datetime(2025, 4, 18),
    ]

    while dias > 0:
        if fecha.weekday() < 5 and fecha.date() not in [f.date() for f in feriados]:
            dias -= 1
        if dias > 0:
            fecha += timedelta(days=1)
    return fecha

# Variables de correo
EMAIL_ORIGEN = os.getenv("EMAIL_ORIGEN")
APP_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Envío de correo
def enviar_correo(destinatarios: List[str], asunto: str, contenido: str):
    msg = EmailMessage()
    msg["Subject"] = asunto
    msg["From"] = EMAIL_ORIGEN
    msg["To"] = ", ".join(destinatarios)
    msg.set_content(contenido)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_ORIGEN, APP_PASSWORD)
        smtp.send_message(msg)
