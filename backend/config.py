# config.py
from fastapi_mail import ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME = "e.redondo0314@gmail.com",
    MAIL_PASSWORD = "hukjibwschvjjdda",  # sin espacios
    MAIL_FROM = "e.redondo0314@gmail.com",
    MAIL_PORT = 465,  # <-- puerto correcto para SSL
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_FROM_NAME = "PQRSD Notificaciones",
    MAIL_STARTTLS = False,  # <-- desactivado
    MAIL_SSL_TLS = True,    # <-- activado
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)
