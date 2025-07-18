from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request
from sqlalchemy.orm import Session
from models import Solicitud, Usuario, Trazabilidad
from schemas import SolicitudResponse, TrazabilidadItem
from datetime import datetime
from fastapi_mail import FastMail, MessageSchema, MessageType
from config import conf
from utils.calculadora_fecha import calcular_fecha_vencimiento_habil
from database import SessionLocal
from typing import Optional, List
from pydantic import BaseModel
import shutil, os
from docx2pdf import convert
from utils.websocket_manager import sio
from utils.supabase_client import supabase

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
    from utils.supabase_client import supabase
    from fastapi_mail import FastMail, MessageSchema, MessageType
    import tempfile, os

    # ✅ Generar nombre de archivo sin subcarpeta "uploads/"
    nombre_archivo = f"{datetime.utcnow().timestamp()}_{archivo.filename}"
    contenido = await archivo.read()

    # ✅ Subir archivo directamente al bucket sin prefijo
    supabase.storage.from_("archivos").upload(
        path=nombre_archivo,
        file=contenido,
        file_options={"content-type": "application/pdf"},
    )

    # ✅ Guardar el nombre exacto en la base de datos
    file_location = nombre_archivo

    # ✅ Crear radicado único
    ano = datetime.utcnow().year
    conteo = db.query(Solicitud).filter(Solicitud.radicado.like(f"RAD-{ano}-%")).count() + 1
    radicado = f"RAD-{ano}-{str(conteo).zfill(5)}"

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

    # ✅ Crear trazabilidad inicial
    evento = Trazabilidad(
        solicitud_id=nueva_solicitud.id,
        evento="Radicación",
        mensaje="La solicitud fue radicada exitosamente.",
        usuario_remitente="Ciudadano",
        usuario_destinatario="Asignador"
    )
    db.add(evento)
    db.commit()

    # ✅ Descargar el archivo para adjuntarlo en el correo
    contenido_pdf = supabase.storage.from_("archivos").download(file_location)

    ruta_temporal = os.path.join(tempfile.gettempdir(), "comprobante.pdf")
    with open(ruta_temporal, "wb") as f:
        f.write(contenido_pdf)

    fm = FastMail(conf)

    # ✅ Enviar correo al ciudadano
    mensaje_peticionario = MessageSchema(
        subject=f"Radicado PQRSD: {radicado}",
        recipients=[correo],
        body=f"""
Hola {nombre} {apellido},

Tu solicitud ha sido radicada correctamente con número de radicado: {radicado}.

Nos comunicaremos contigo tan pronto como sea revisada.

Gracias por usar nuestro sistema PQRSD.

Atentamente,
Equipo PQRSD
        """,
        subtype=MessageType.plain,
        attachments=[ruta_temporal]
    )
    await fm.send_message(mensaje_peticionario)

    # ✅ Notificar a los asignadores
    asignadores = db.query(Usuario).filter(Usuario.rol == "asignador").all()
    correos_asignadores = [a.correo for a in asignadores]

    if correos_asignadores:
        mensaje_asignadores = MessageSchema(
            subject="Nueva PQRSD radicada",
            recipients=correos_asignadores,
            body=f"""
Se ha radicado una nueva solicitud:

📌 Radicado: {radicado}
👤 Nombre: {nombre} {apellido}
📍 Departamento: {departamento}
🌆 Municipio: {municipio}

Se adjunta el documento enviado por el ciudadano.
            """,
            subtype=MessageType.plain,
            attachments=[ruta_temporal]
        )
        await fm.send_message(mensaje_asignadores)

    # ✅ Notificar en tiempo real al frontend
    await sio.emit("nueva_solicitud", {
        "radicado": radicado,
        "nombre": nombre,
        "apellido": apellido
    })

    # ✅ Eliminar archivo temporal
    os.remove(ruta_temporal)

    # ✅ Construir URL pública del PDF
    supabase_url = "https://smdxstmmjkpvvksamute.supabase.co"
    bucket = "archivos"
    archivo_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{file_location}"

    return {
        "id": nueva_solicitud.id,
        "radicado": nueva_solicitud.radicado,
        "nombre": nueva_solicitud.nombre,
        "apellido": nueva_solicitud.apellido,
        "correo": nueva_solicitud.correo,
        "celular": nueva_solicitud.celular,
        "departamento": nueva_solicitud.departamento,
        "municipio": nueva_solicitud.municipio,
        "direccion": nueva_solicitud.direccion,
        "mensaje": nueva_solicitud.mensaje,
        "estado": nueva_solicitud.estado,
        "archivo": nueva_solicitud.archivo,
        "archivo_url": archivo_url,
        "fecha_creacion": nueva_solicitud.fecha_creacion
    }

@router.get("/asignadas/{usuario_id}", response_model=List[SolicitudResponse])
def obtener_asignadas(usuario_id: int, db: Session = Depends(get_db)):
    return db.query(Solicitud).filter(
        Solicitud.asignado_a == usuario_id,
        Solicitud.estado.in_(["Asignado", "En proceso", "Devuelto"])
    ).all()

@router.post("/{solicitud_id}/asignar/{usuario_id}")
async def asignar_solicitud(
    solicitud_id: int,
    usuario_id: int,
    termino_dias: int = Form(...),
    tipo_pqrsd: str = Form(...),  # 👈 Nuevo campo tipo_pqrsd
    request: Request = None,
    db: Session = Depends(get_db)
):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario responsable no encontrado")

    fecha_limite = calcular_fecha_vencimiento_habil(datetime.utcnow(), termino_dias)

    solicitud.asignado_a = usuario.id
    solicitud.estado = "Asignado"
    solicitud.fecha_vencimiento = fecha_limite
    solicitud.tipo_pqrsd = tipo_pqrsd  # 👈 Guardamos el tipo que escribió el asignador
    db.commit()

    evento = Trazabilidad(
        solicitud_id=solicitud_id,
        evento="Asignación",
        mensaje=f"Asignada al responsable {usuario.nombre}. Tipo de PQRSD: {tipo_pqrsd}",  # 👈 También lo dejamos registrado
        usuario_remitente=request.headers.get("usuario", "Asignador"),
        usuario_destinatario=usuario.nombre
    )
    db.add(evento)
    db.commit()

    await sio.emit("nueva_asignacion", {
        "usuario_id": usuario_id,
        "radicado": solicitud.radicado,
        "nombre": solicitud.nombre,
        "apellido": solicitud.apellido
    })

    return {"mensaje": f"Solicitud asignada correctamente. Fecha límite: {fecha_limite}"}

@router.post("/{id}/responder")
async def responder_solicitud(
    id: int,
    mensaje: str = Form(...),
    contenido: str = Form(...),
    archivo: Optional[UploadFile] = File(None),
    request: Request = None,
    db: Session = Depends(get_db)
):
    from utils.supabase_client import supabase
    import tempfile

    solicitud = db.query(Solicitud).filter(Solicitud.id == id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    if archivo:
        nombre_archivo = f"respuesta_{datetime.utcnow().timestamp()}_{archivo.filename}"
        contenido_archivo = await archivo.read()

        # ✅ Subir archivo original a Supabase Storage (bucket: archivos)
        supabase.storage.from_("archivos").upload(nombre_archivo, contenido_archivo, {
            "content-type": archivo.content_type or "application/octet-stream",
            "upsert": True
        })

        solicitud.archivo_respuesta = nombre_archivo

        # ✅ Convertir Word a PDF si aplica, y subir también a Supabase
        if archivo.filename.endswith(".docx") or archivo.filename.endswith(".doc"):
            try:
                # 1. Guardar temporalmente
                with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                    tmp.write(contenido_archivo)
                    ruta_temp_word = tmp.name

                ruta_temp_pdf = ruta_temp_word.replace(".docx", ".pdf").replace(".doc", ".pdf")
                convert(ruta_temp_word, ruta_temp_pdf)

                # 2. Leer PDF convertido
                with open(ruta_temp_pdf, "rb") as f:
                    contenido_pdf = f.read()

                nombre_pdf = nombre_archivo.replace(".docx", ".pdf").replace(".doc", ".pdf")

                # 3. Subir PDF convertido
                supabase.storage.from_("archivos").upload(nombre_pdf, contenido_pdf, {
                    "content-type": "application/pdf",
                    "upsert": True
                })

                solicitud.archivo_respuesta_pdf = nombre_pdf

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

    sio.start_background_task(sio.emit, "nueva_revision", {
        "radicado": solicitud.radicado,
        "mensaje": mensaje
    })

    return {"mensaje": "Respuesta enviada correctamente"}

from fastapi import Body

@router.post("/{solicitud_id}/revision")
async def revisar_solicitud(
    solicitud_id: int,
    revision: Revision = Body(...),
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

    if revision.aprobado:
        await sio.emit("nueva_firma", {
            "radicado": solicitud.radicado
        })

    return {"mensaje": f"Solicitud {'aprobada' if revision.aprobado else 'devuelta'} correctamente"}

@router.post("/{solicitud_id}/firmar")
async def firmar_solicitud(
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

    await sio.emit("nueva_firma_final", {
        "radicado": solicitud.radicado
    })

    return {"mensaje": "Solicitud firmada correctamente"}

@router.get("/{id}/trazabilidad", response_model=List[TrazabilidadItem])
def obtener_trazabilidad(id: int, db: Session = Depends(get_db)):
    return db.query(Trazabilidad).filter(Trazabilidad.solicitud_id == id).order_by(Trazabilidad.fecha).all()

@router.post("/{solicitud_id}/finalizar")
async def finalizar_solicitud(
    solicitud_id: int,
    request: Request = None,
    db: Session = Depends(get_db)
):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    solicitud.estado = "Terminado"  # 👈 Aquí corregimos
    db.commit()

    evento = Trazabilidad(
        solicitud_id=solicitud_id,
        evento="Finalización",
        mensaje="La solicitud fue finalizada exitosamente.",
        usuario_remitente=request.headers.get("usuario", "Administrador"),
        usuario_destinatario="Asignador"
    )
    db.add(evento)
    db.commit()

    await sio.emit("nueva_finalizacion", {
        "radicado": solicitud.radicado
    })

    return {"mensaje": "Solicitud finalizada correctamente"}

@router.post("/solicitudes/recuperar-archivos")
async def recuperar_archivos(archivos: List[UploadFile] = File(...)):
    resultados = []

    for archivo in archivos:
        ruta = os.path.join("uploads", archivo.filename)
        with open(ruta, "wb") as buffer:
            shutil.copyfileobj(archivo.file, buffer)
        resultados.append(f"{archivo.filename} restaurado")

    return {"mensaje": "Archivos restaurados correctamente", "archivos": resultados}

@router.get("/", response_model=List[SolicitudResponse])
def listar_solicitudes(db: Session = Depends(get_db)):
    return db.query(Solicitud).all()

@router.get("/{solicitud_id}", response_model=SolicitudResponse)
def obtener_solicitud_por_id(solicitud_id: int, db: Session = Depends(get_db)):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    encargado = db.query(Usuario).filter(Usuario.id == solicitud.asignado_a).first()
    encargado_nombre = encargado.nombre if encargado else None

    # ✅ LIMPIAR LA RUTA SI INCLUYE "uploads/"
    archivo_url = None
    if solicitud.archivo:
        supabase_url = "https://smdxstmmjkpvvksamute.supabase.co"
        bucket = "archivos"
        archivo_path = solicitud.archivo.replace("uploads/", "")  # 👈 ESTA ES LA CLAVE
        archivo_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{archivo_path}"

    solicitud_dict = solicitud.__dict__.copy()
    solicitud_dict["encargado_nombre"] = encargado_nombre
    solicitud_dict["archivo_url"] = archivo_url

    return SolicitudResponse(**solicitud_dict)

@router.delete("/{solicitud_id}", status_code=204)
def eliminar_solicitud(solicitud_id: int, db: Session = Depends(get_db)):
    solicitud = db.query(Solicitud).get(solicitud_id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    db.delete(solicitud)
    db.commit()
    return {"mensaje": "Solicitud eliminada"}

@router.put("/solicitudes/{solicitud_id}/reasignar")
def reasignar_encargado(
    solicitud_id: int,
    datos: ReasignarEncargadoRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    nuevo = db.query(Usuario).filter(Usuario.id == datos.nuevo_encargado).first()
    if not nuevo:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    solicitud.encargado_id = nuevo.id
    db.commit()
    return {"mensaje": "Encargado reasignado correctamente"}
