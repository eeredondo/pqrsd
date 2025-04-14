# main.py actualizado con WebSockets
from fastapi import FastAPI
from database import engine, Base
from routers import solicitudes, usuarios
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect

# Socket.IO
from utils.websocket_manager import sio
import socketio

# Crear tablas
Base.metadata.create_all(bind=engine)

# FastAPI tradicional
fastapi_app = FastAPI()

# Middleware CORS
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas FastAPI
fastapi_app.include_router(solicitudes.router)
fastapi_app.include_router(usuarios.router)

# Ruta de prueba
@fastapi_app.get("/")
def inicio():
    return {"mensaje": "API funcionando correctamente 🚀"}

# Ver tablas
@fastapi_app.get("/debug/tablas")
def ver_tablas():
    inspector = inspect(engine)
    return {"tablas": inspector.get_table_names()}

# Servir archivos estáticos
fastapi_app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# App principal (Socket.IO envuelve FastAPI)
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
