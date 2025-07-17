# routers/archivos.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from database import get_db
from models import ArchivoPQR

router = APIRouter(prefix="/archivos", tags=["Archivos"])

# 🟢 Subir PDF a la base de datos
@router.post("/subir")
async def subir_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    contenido = await file.read()
    archivo = ArchivoPQR(nombre=file.filename, contenido=contenido)
    db.add(archivo)
    db.commit()
    db.refresh(archivo)
    return {"id": archivo.id, "nombre": archivo.nombre}

# 🟢 Enviar PDF por correo usando su ID
@router.post("/enviar/{archivo_id}")
async def enviar_pdf(
    archivo_id: int,
    email: str = Form(...),  # para enviar por formulario
    db: Session = Depends(get_db)
):
    archivo = db.query(ArchivoPQR).filter(ArchivoPQR.id == archivo_id).first()
    if not archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    await enviar_pdf_por_correo(
        destinatario=email,
        asunto="Archivo PQRSD",
        cuerpo="Adjunto el PDF solicitado.",
        nombre_pdf=archivo.nombre,
        contenido_pdf=archivo.contenido
    )

    return {"mensaje": f"Correo enviado a {email}"}
