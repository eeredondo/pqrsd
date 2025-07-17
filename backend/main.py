# main.py completo y actualizado

from fastapi import FastAPI
from database import engine, Base
from routers import solicitudes, usuarios, archivos  # ✅ AÑADIDO archivos
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect
from dotenv import load_dotenv
load_dotenv()

# ✅ IMPORTANTE: Crea las tablas automáticamente
import models
Base.metadata.create_all(bind=engine)

# Socket.IO
from utils.websocket_manager import sio
import socketio

# FastAPI tradicional
fastapi_app = FastAPI()

# Middleware CORS
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "https://pqrsd-frontend-y5j2.onrender.com",
        "https://www.horizonproject.com.co",
        "https://horizonproject.com.co"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Incluimos los routers
fastapi_app.include_router(solicitudes.router)
fastapi_app.include_router(usuarios.router)
fastapi_app.include_router(archivos.router)  # ✅ AÑADIDO

# Ruta principal
@fastapi_app.get("/")
def inicio():
    return {"mensaje": "API funcionando correctamente 🚀"}

# Ruta de depuración (ver tablas en la base de datos)
@fastapi_app.get("/debug/tablas")
def ver_tablas():
    inspector = inspect(engine)
    return {"tablas": inspector.get_table_names()}

# Carpeta para archivos estáticos (si los usas)
fastapi_app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# App principal (Socket.IO + FastAPI)
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
