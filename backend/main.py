# main.py actualizado
from fastapi import FastAPI
from database import engine, Base
from routers import solicitudes, usuarios
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect

# Crear tablas
Base.metadata.create_all(bind=engine)

# Crear instancia de FastAPI
app = FastAPI()

# Incluir routers
app.include_router(solicitudes.router)
app.include_router(usuarios.router)

# Middleware CORS para permitir acceso desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta principal de prueba
@app.get("/")
def inicio():
    return {"mensaje": "API funcionando correctamente 🚀"}

# Montar carpeta para archivos estáticos (PDFs, etc.)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Ruta para ver las tablas en la base de datos (debug)
@app.get("/debug/tablas")
def ver_tablas():
    inspector = inspect(engine)
    return {"tablas": inspector.get_table_names()}
