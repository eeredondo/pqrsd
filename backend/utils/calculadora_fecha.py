from datetime import datetime, timedelta

# Esta función verifica si una fecha es fin de semana (sábado o domingo)
def es_dia_habil(fecha: datetime) -> bool:
    return fecha.weekday() < 5  # 0 = lunes, 6 = domingo

# Esta función suma días hábiles a una fecha (ignora sábados y domingos)
def calcular_fecha_vencimiento_habil(fecha_inicio: datetime, dias: int) -> datetime:
    fecha_actual = fecha_inicio
    dias_agregados = 0

    while dias_agregados < dias:
        fecha_actual += timedelta(days=1)
        if es_dia_habil(fecha_actual):
            dias_agregados += 1

    return fecha_actual
