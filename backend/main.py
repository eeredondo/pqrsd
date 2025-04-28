# main.py actualizado con WebSockets y PostgreSQL
from fastapi import FastAPI
from database import engine, Base
from routers import solicitudes, usuarios
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect

# ✅ IMPORTANTE: Crea las tablas automáticamente
import models
Base.metadata.create_all(bind=engine)

# Socket.IO
from utils.websocket_manager import sio
import socketio

# FastAPI tradicional
fastapi_app = FastAPI()

# Middleware CORS (ahora sí con el dominio correcto de Vercel/Render)
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

# Rutas FastAPI
fastapi_app.include_router(solicitudes.router)
fastapi_app.include_router(usuarios.router)

# Ruta principal de prueba
@fastapi_app.get("/")
def inicio():
    return {"mensaje": "API funcionando correctamente 🚀"}

# Ruta para ver tablas (debug)
@fastapi_app.get("/debug/tablas")
def ver_tablas():
    inspector = inspect(engine)
    return {"tablas": inspector.get_table_names()}

# Servir archivos estáticos
fastapi_app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# App principal (Socket.IO envuelve FastAPI)
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
