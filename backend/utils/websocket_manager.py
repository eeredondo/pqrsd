import socketio

# Servidor de WebSocket
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")

# Función para emitir eventos desde cualquier parte del backend
async def emitir_evento(evento: str, data: dict):
    await sio.emit(evento, data)
