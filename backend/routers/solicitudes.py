from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Body, Request
from sqlalchemy.orm import Session
from models import Solicitud, Usuario, Trazabilidad
from schemas import SolicitudCreate, SolicitudResponse, TrazabilidadItem
from datetime import datetime
import shutil
from fastapi_mail import FastMail, MessageSchema, MessageType
from config import conf
from utils.calculadora_fecha import calcular_fecha_vencimiento_habil
from database import SessionLocal
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter(prefix="/solicitudes", tags=["solicitudes"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Revision(BaseModel):
    aprobado: bool
    comentario: str | None = None

# ------------------- CREAR SOLICITUD -------------------

@router.post("/", response_model=SolicitudResponse)
async def crear_solicitud(
    nombre: str = Form(...),
    apellido: str = Form(...),
    correo: str = Form(...),
    celular: str = Form(...),
    departamento: str = Form(...),
    municipio: str = Form(...),
    direccion: str = Form(...),
    mensaje: str = Form(...),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_location = f"uploads/{datetime.utcnow().timestamp()}_{archivo.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(archivo.file, buffer)

    radicado = f"RAD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    nueva_solicitud = Solicitud(
        nombre=nombre,
        apellido=apellido,
        correo=correo,
        celular=celular,
        departamento=departamento,
        municipio=municipio,
        direccion=direccion,
        mensaje=mensaje,
        archivo=file_location,
        radicado=radicado,
        estado="Pendiente"
    )

    db.add(nueva_solicitud)
    db.commit()
    db.refresh(nueva_solicitud)

    evento = Trazabilidad(
        solicitud_id=nueva_solicitud.id,
        evento="Radicación",
        mensaje="La solicitud fue radicada exitosamente.",
        usuario_remitente="Ciudadano",
        usuario_destinatario="Asignador"
    )
    db.add(evento)
    db.commit()

    return nueva_solicitud

# ------------------- GET SOLICITUDES -------------------

@router.get("/", response_model=List[SolicitudResponse])
def obtener_solicitudes(db: Session = Depends(get_db)):
    return db.query(Solicitud).all()

@router.get("/{solicitud_id}", response_model=SolicitudResponse)
def obtener_solicitud_por_id(solicitud_id: int, db: Session = Depends(get_db)):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return solicitud

@router.get("/asignadas/{usuario_id}", response_model=List[SolicitudResponse])
def obtener_asignadas(usuario_id: int, db: Session = Depends(get_db)):
    return db.query(Solicitud).filter(
        Solicitud.asignado_a == usuario_id,
        Solicitud.estado.in_(["Asignado", "En proceso", "Devuelto"])  # ✅ ¡Agrega "Devuelto" aquí!
    ).all()

# ------------------- ASIGNACIÓN -------------------

@router.post("/{solicitud_id}/asignar/{usuario_id}")
def asignar_solicitud(
    solicitud_id: int,
    usuario_id: int,
    termino_dias: int = Form(...),
    request: Request = None,
    db: Session = Depends(get_db)
):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario responsable no encontrado")

    fecha_limite = calcular_fecha_vencimiento_habil(datetime.utcnow(), int(termino_dias))

    solicitud.asignado_a = usuario.id
    solicitud.estado = "Asignado"
    solicitud.fecha_vencimiento = fecha_limite
    db.commit()

    evento = Trazabilidad(
        solicitud_id=solicitud_id,
        evento="Asignación",
        mensaje=f"Asignada al responsable {usuario.nombre}",
        usuario_remitente=request.headers.get("usuario", "Asignador"),
        usuario_destinatario=usuario.nombre
    )
    db.add(evento)
    db.commit()

    return {"mensaje": f"Solicitud asignada correctamente. Fecha límite: {fecha_limite}"}


# ------------------- RESPONDER -------------------

from docx2pdf import convert
import os

@router.post("/{id}/responder")
async def responder_solicitud(
    id: int,
    mensaje: str = Form(...),
    contenido: str = Form(...),
    archivo: Optional[UploadFile] = File(None),
    request: Request = None,
    db: Session = Depends(get_db)
):
    solicitud = db.query(Solicitud).filter(Solicitud.id == id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    if archivo:
        # Guardar archivo Word
        nombre_archivo = f"respuesta_{datetime.utcnow().timestamp()}_{archivo.filename}"
        ruta_word = os.path.join("uploads", nombre_archivo)
        with open(ruta_word, "wb") as buffer:
            shutil.copyfileobj(archivo.file, buffer)
        solicitud.archivo_respuesta = ruta_word

        # Convertir a PDF
        if archivo.filename.endswith(".docx") or archivo.filename.endswith(".doc"):
            try:
                ruta_pdf = ruta_word.replace(".docx", ".pdf").replace(".doc", ".pdf")
                convert(ruta_word, ruta_pdf)
                solicitud.archivo_respuesta_pdf = ruta_pdf  # ← Asegúrate de tener este campo en tu modelo
            except Exception as e:
                print("❌ Error al convertir Word a PDF:", e)

    solicitud.estado = "En revisión"
    solicitud.revision_comentario = mensaje
    db.commit()

    evento = Trazabilidad(
        solicitud_id=id,
        evento="Respuesta enviada",
        mensaje=mensaje,
        usuario_remitente=request.headers.get("usuario", "Responsable"),
        usuario_destinatario="Revisor"
    )
    db.add(evento)
    db.commit()

    return {"mensaje": "Respuesta enviada correctamente"}


# ------------------- REVISIÓN -------------------

@router.post("/{solicitud_id}/revision")
def revisar_solicitud(
    solicitud_id: int,
    revision: Revision,
    request: Request = None,
    db: Session = Depends(get_db)
):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    solicitud.estado = "Revisado" if revision.aprobado else "Devuelto"
    solicitud.revision_comentario = "Aprobado" if revision.aprobado else revision.comentario
    db.commit()

    evento = Trazabilidad(
        solicitud_id=solicitud_id,
        evento="Revisión aprobada" if revision.aprobado else "Revisión devuelta",
        mensaje=revision.comentario,
        usuario_remitente=request.headers.get("usuario", "Revisor"),
        usuario_destinatario="Firmante" if revision.aprobado else "Responsable"
    )
    db.add(evento)
    db.commit()

    return {"mensaje": f"Solicitud {'aprobada' if revision.aprobado else 'devuelta'} correctamente"}

# ------------------- FIRMAR -------------------

@router.post("/{solicitud_id}/firmar")
def firmar_solicitud(
    solicitud_id: int,
    request: Request = None,
    db: Session = Depends(get_db)
):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    if solicitud.estado != "Revisado":
        raise HTTPException(status_code=400, detail="La solicitud aún no ha sido revisada")

    solicitud.estado = "Firmado"
    solicitud.firmado = "Sí"
    db.commit()

    evento = Trazabilidad(
        solicitud_id=solicitud_id,
        evento="Firma",
        mensaje="La solicitud fue firmada.",
        usuario_remitente=request.headers.get("usuario", "Firmante"),
        usuario_destinatario="Administrador"
    )
    db.add(evento)
    db.commit()

    return {"mensaje": "Solicitud firmada correctamente"}

# ------------------- FINALIZAR -------------------

@router.post("/{solicitud_id}/finalizar")
async def finalizar_solicitud(
    solicitud_id: int,
    archivo: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db)
):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    if solicitud.estado != "Firmado":
        raise HTTPException(status_code=400, detail="La solicitud aún no está firmada")

    file_location = f"uploads/evidencia_{datetime.utcnow().timestamp()}_{archivo.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(archivo.file, buffer)

    solicitud.archivo_evidencia = file_location
    solicitud.estado = "Terminado"
    db.commit()

    evento = Trazabilidad(
        solicitud_id=solicitud_id,
        evento="Finalización",
        mensaje="La solicitud fue finalizada y enviada al ciudadano.",
        usuario_remitente=request.headers.get("usuario", "Administrador"),
        usuario_destinatario="Ciudadano"
    )
    db.add(evento)
    db.commit()

    message = MessageSchema(
        subject=f"Tu solicitud {solicitud.radicado} ha sido finalizada ✅",
        recipients=[solicitud.correo],
        body=f"""
        Hola {solicitud.nombre},

        Tu solicitud con radicado {solicitud.radicado} ha sido atendida y finalizada exitosamente.

        Gracias por utilizar nuestro sistema de PQRSD.

        Saludos cordiales,
        Equipo PQRSD
        """,
        subtype=MessageType.plain,
        attachments=[file_location]
    )

    fm = FastMail(conf)
    await fm.send_message(message)

    return {"mensaje": "Solicitud finalizada y notificación enviada correctamente"}

# ------------------- TRAZABILIDAD -------------------

@router.get("/{id}/trazabilidad", response_model=List[TrazabilidadItem])
def obtener_trazabilidad(id: int, db: Session = Depends(get_db)):
    return db.query(Trazabilidad).filter(
        Trazabilidad.solicitud_id == id
    ).order_by(Trazabilidad.fecha).all()
