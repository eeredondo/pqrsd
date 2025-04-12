# config.py
from fastapi_mail import ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME = "e.redondo0314@gmail.com",
    MAIL_PASSWORD = "yhqu nkrc nzvo tzbx",  
    MAIL_FROM = "e.redondo0314@gmail.com",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_FROM_NAME="PQRSD Notificaciones",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)
