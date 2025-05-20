# routers/usuarios.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Usuario
from schemas import UsuarioCreate, UsuarioResponse
from utils import hash_password, verificar_password
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from auth import crear_token, verificar_usuario, obtener_usuario_actual

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

# --- DB Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Login ---
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = verificar_usuario(db, form_data.username, form_data.password)
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrecta")

    token = crear_token({"sub": usuario.usuario, "rol": usuario.rol})
    return {
        "access_token": token,
        "rol": usuario.rol,
        "id": usuario.id
    }

# --- Crear usuario ---
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

# --- Leer usuario actual ---
@router.get("/yo", response_model=UsuarioResponse)
def leer_usuario_actual(usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    return usuario_actual

# --- Obtener todos los usuarios ---
@router.get("/", response_model=list[UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).all()

# --- Modelos internos para actualizar, resetear y cambiar estado ---
class UsuarioUpdate(BaseModel):
    nombre: str
    correo: str
    rol: str
    contraseña: str | None = None

class ResetPasswordRequest(BaseModel):
    nueva_contraseña: str

class CambiarEstadoRequest(BaseModel):
    activo: bool

# --- Actualizar usuario ---
@router.put("/{usuario_id}")
def actualizar_usuario(usuario_id: int, usuario: UsuarioUpdate, db: Session = Depends(get_db)):
    usuario_db = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db.nombre = usuario.nombre
    usuario_db.correo = usuario.correo
    usuario_db.rol = usuario.rol

    if usuario.contraseña:
        usuario_db.contraseña = hash_password(usuario.contraseña)

    db.commit()
    return {"mensaje": "Usuario actualizado correctamente"}

# --- Resetear contraseña (por admin) ---
@router.put("/{usuario_id}/reset-password")
def resetear_contraseña(usuario_id: int, datos: ResetPasswordRequest, db: Session = Depends(get_db)):
    usuario_db = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db.contraseña = hash_password(datos.nueva_contraseña)
    db.commit()
    return {"mensaje": "Contraseña reseteada correctamente"}

# --- Cambiar estado (activar/desactivar) ---
@router.put("/{usuario_id}/cambiar-estado")
def cambiar_estado(usuario_id: int, datos: CambiarEstadoRequest, db: Session = Depends(get_db)):
    usuario_db = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db.activo = datos.activo
    db.commit()
    return {"mensaje": f"Usuario {'activado' if datos.activo else 'desactivado'} correctamente"}

# --- Cambiar contraseña (por el propio usuario) ---
class CambioContrasenaRequest(BaseModel):
    contrasena_actual: str
    nueva_contraseña: str

@router.post("/{usuario_id}/cambiar-contrasena")
def cambiar_contrasena(usuario_id: int, datos: CambioContrasenaRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not verificar_password(datos.contrasena_actual, usuario.contraseña):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")

    usuario.contraseña = hash_password(datos.nueva_contraseña)
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente"}
