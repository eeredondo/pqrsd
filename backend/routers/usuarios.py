# routers/usuarios.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Usuario
from schemas import UsuarioCreate, UsuarioResponse
from utils import hash_password

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from fastapi.security import OAuth2PasswordRequestForm
from auth import crear_token, verificar_usuario

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = verificar_usuario(db, form_data.username, form_data.password)
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrecta")

    token = crear_token({"sub": usuario.usuario, "rol": usuario.rol})
    return {
    "access_token": token,  # ✅ usa la variable correcta
    "rol": usuario.rol,
    "id": usuario.id
}

@router.post("/", response_model=UsuarioResponse)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(Usuario).filter(Usuario.usuario == usuario.usuario).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    usuario_nuevo = Usuario(
        usuario=usuario.usuario,
        nombre=usuario.nombre,
        correo=usuario.correo,
        rol=usuario.rol,
        contraseña=hash_password(usuario.contraseña)
    )
    db.add(usuario_nuevo)
    db.commit()
    db.refresh(usuario_nuevo)

    return usuario_nuevo

from auth import obtener_usuario_actual

@router.get("/yo", response_model=UsuarioResponse)
def leer_usuario_actual(usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    return usuario_actual

from schemas import UsuarioResponse

@router.get("/", response_model=list[UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).all()
