# models.py actualizado
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from sqlalchemy import Date

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String, unique=True, index=True)
    nombre = Column(String)
    correo = Column(String, unique=True)
    contraseña = Column(String)  # Guardaremos hash
    rol = Column(String)  # asignador, responsable, revisor, firmante, admin

class Solicitud(Base):
    __tablename__ = "solicitudes"
    id = Column(Integer, primary_key=True, index=True)
    radicado = Column(String, unique=True, index=True)
    nombre = Column(String)
    apellido = Column(String)
    correo = Column(String)
    celular = Column(String)
    departamento = Column(String)
    municipio = Column(String)
    direccion = Column(String)
    mensaje = Column(Text)
    archivo = Column(String)
    archivo_respuesta = Column(String, nullable=True)
    revision_comentario = Column(Text, nullable=True)
    firmado = Column(String, default="No")
    archivo_evidencia = Column(String, nullable=True)  # Nuevo campo
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    estado = Column(String, default="Pendiente")
    asignado_a = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    usuario = relationship("Usuario")
    fecha_vencimiento = Column(Date, nullable=True)
    archivo_respuesta_pdf = Column(String, nullable=True)


class Trazabilidad(Base):
    __tablename__ = "trazabilidad"

    id = Column(Integer, primary_key=True, index=True)
    solicitud_id = Column(Integer, ForeignKey("solicitudes.id"))
    evento = Column(String)
    mensaje = Column(String, nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow)
    usuario_remitente = Column(String)  # quien ejecuta la acción
    usuario_destinatario = Column(String, nullable=True)  # a quién va dirigida
