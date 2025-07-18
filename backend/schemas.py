from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional

# ---------- MODELOS DE SOLICITUD ----------

class SolicitudBase(BaseModel):
    nombre: str
    apellido: str
    correo: str
    celular: str
    departamento: str
    municipio: str
    direccion: str
    mensaje: str

class SolicitudCreate(SolicitudBase):
    pass

class SolicitudResponse(SolicitudBase):
    id: int
    radicado: str
    fecha_creacion: datetime
    fecha_vencimiento: Optional[date] = None  # ✅ CORREGIDO
    estado: str
    archivo: str
    archivo_respuesta: Optional[str] = None
    archivo_evidencia: Optional[str] = None
    firmado: Optional[str] = None
    revision_comentario: Optional[str] = None
    asignado_a: Optional[int] = None
    archivo_respuesta_pdf: Optional[str] = None
    encargado_nombre: Optional[str] = None
    tipo_pqrsd: Optional[str] = None
    archivo_url: Optional[str] = None

    class Config:
        from_attributes = True

# ---------- MODELOS DE USUARIO ----------

class UsuarioBase(BaseModel):
    usuario: str
    nombre: str
    correo: str
    rol: str

class UsuarioCreate(UsuarioBase):
    contraseña: str

class UsuarioResponse(UsuarioBase):
    id: int

    class Config:
        from_attributes = True

# ---------- MODELOS DE TRAZABILIDAD ----------

class TrazabilidadItem(BaseModel):
    id: int
    evento: str
    mensaje: Optional[str]
    fecha: datetime
    usuario_remitente: Optional[str] = None
    usuario_destinatario: Optional[str] = None

    class Config:
        orm_mode = True

# ---------- MODELOS EXTRA PARA USUARIOS ----------

class UsuarioUpdate(BaseModel):
    nombre: str
    correo: str
    rol: str
    contraseña: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    nueva_contraseña: str

class CambiarEstadoRequest(BaseModel):
    activo: bool

# ---------- NUEVO: Reasignar encargado ----------

class ReasignarEncargadoRequest(BaseModel):
    nuevo_encargado: int
