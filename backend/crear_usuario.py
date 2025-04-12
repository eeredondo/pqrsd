# crear_usuario.py
from database import SessionLocal
from models import Usuario
from utils.hash import hash_password  # Asegúrate de tener esta función
from sqlalchemy.exc import IntegrityError

db = SessionLocal()

nuevo_usuario = Usuario(
    usuario="asignador1",
    nombre="Asignador Principal",
    correo="asignador@correo.com",
    contraseña=hash_password("123456"),
    rol="asignador"  # Puede ser: asignador, responsable, revisor, firmante, admin
)

try:
    db.add(nuevo_usuario)
    db.commit()
    print("✅ Usuario creado correctamente.")
except IntegrityError:
    db.rollback()
    print("❌ Ya existe un usuario con ese correo o nombre de usuario.")
finally:
    db.close()
