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

from pydantic import BaseModel

class UsuarioUpdate(BaseModel):
    nombre: str
    correo: str
    rol: str
    contraseña: str | None = None

class ResetPasswordRequest(BaseModel):
    nueva_contraseña: str

class CambiarEstadoRequest(BaseModel):
    activo: bool

# Actualizar usuario
@router.put("/{usuario_id}")
def actualizar_usuario(usuario_id: int, usuario: UsuarioUpdate, db: Session = Depends(get_db)):
    usuario_db = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db.nombre = usuario.nombre
    usuario_db.correo = usuario.correo
    usuario_db.rol = usuario.rol

    if usuario.contraseña:
        from utils import hash_password
        usuario_db.contraseña = hash_password(usuario.contraseña)

    db.commit()
    return {"mensaje": "Usuario actualizado correctamente"}

# Resetear contraseña
@router.put("/{usuario_id}/reset-password")
def resetear_contraseña(usuario_id: int, datos: ResetPasswordRequest, db: Session = Depends(get_db)):
    usuario_db = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    from utils import hash_password
    usuario_db.contraseña = hash_password(datos.nueva_contraseña)
    db.commit()
    return {"mensaje": "Contraseña reseteada correctamente"}

# Cambiar estado (activar/desactivar usuario)
@router.put("/{usuario_id}/cambiar-estado")
def cambiar_estado(usuario_id: int, datos: CambiarEstadoRequest, db: Session = Depends(get_db)):
    usuario_db = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db.activo = datos.activo
    db.commit()
    return {"mensaje": f"Usuario {'activado' if datos.activo else 'desactivado'} correctamente"}

