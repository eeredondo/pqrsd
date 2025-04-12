# crear_tablas.py
from database import Base, engine
from models import Solicitud, Usuario

print("📦 Creando tablas...")
Base.metadata.create_all(bind=engine)
print("✅ Tablas creadas correctamente.")
