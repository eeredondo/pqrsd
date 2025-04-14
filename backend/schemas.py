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
    fecha_vencimiento: Optional[date]
    estado: str
    archivo: str
    archivo_respuesta: Optional[str] = None
    archivo_evidencia: Optional[str] = None
    firmado: Optional[str] = None
    revision_comentario: Optional[str] = None
    asignado_a: Optional[int] = None
    archivo_respuesta_pdf: Optional[str] = None
    encargado_nombre: Optional[str] = None  # 👈 Agregado

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
        from_attributes = True  # ✅ Pydantic v2 compatible

# ---------- MODELOS DE TRAZABILIDAD ----------

class TrazabilidadItem(BaseModel):
    id: int
    evento: str
    mensaje: str | None
    fecha: datetime
    usuario_remitente: str | None = None
    usuario_destinatario: str | None = None

    class Config:
        orm_mode = True

