# auth.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from schemas import UsuarioResponse
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Usuario
from utils import verificar_password  # ✅ Nombre correcto de la función

# Configuración del token
SECRET_KEY = "secretoparapruebas123456789"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # Token válido por 1 día

# ✅ Corregido: sin slash inicial
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/login")

# Crear token JWT
def crear_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

# Verificar credenciales del usuario
def verificar_usuario(db: Session, usuario: str, contraseña: str):
    print("🔍 Buscando usuario:", usuario)
    usuario_db = db.query(Usuario).filter(Usuario.usuario == usuario).first()
    if usuario_db is None:
        print("❌ Usuario no encontrado")
        return False
    if not verificar_password(contraseña, usuario_db.contraseña):
        print("❌ Contraseña incorrecta")
        return False
    print("✅ Usuario autenticado correctamente")
    return usuario_db

# Dependencia para obtener sesión de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Obtener usuario actual a partir del token
def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario = payload.get("sub")
        if usuario is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    usuario_db = db.query(Usuario).filter(Usuario.usuario == usuario).first()
    if usuario_db is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return usuario_db
