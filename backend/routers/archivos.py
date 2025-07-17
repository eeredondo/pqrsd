from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
import io

from database import get_db
from models import ArchivoPQR
from utils.mailer import enviar_pdf_por_correo  # Asegúrate de tener esta utilidad

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
    email: str = Form(...),  # se envía desde un formulario
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

# 🔵 Ver PDF directamente en el navegador
@router.get("/ver/{archivo_id}")
def ver_pdf(archivo_id: int, db: Session = Depends(get_db)):
    archivo = db.query(ArchivoPQR).filter(ArchivoPQR.id == archivo_id).first()
    if not archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    return StreamingResponse(io.BytesIO(archivo.contenido), media_type="application/pdf")
