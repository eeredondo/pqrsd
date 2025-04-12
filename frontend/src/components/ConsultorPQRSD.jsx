import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUpDown, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

function ConsultorPQRSD() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroRadicado, setFiltroRadicado] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [orden, setOrden] = useState({ campo: "radicado", asc: false });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/solicitudes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
    }
  };

  const cambiarOrden = (campo) => {
    setOrden((prev) => ({
      campo,
      asc: prev.campo === campo ? !prev.asc : true,
    }));
  };

  const filtrar = solicitudes.filter((s) => {
    const nombreCompleto = `${s.nombre} ${s.apellido}`.toLowerCase();
    const fecha = new Date(s.fecha_radicacion);

    const radicadoMatch = s.radicado.toLowerCase().includes(filtroRadicado.toLowerCase());
    const nombreMatch = nombreCompleto.includes(filtroNombre.toLowerCase());
    const estadoMatch = filtroEstado === "" || s.estado === filtroEstado;

    const fechaDesdeMatch = !fechaDesde || fecha >= new Date(fechaDesde);
    const fechaHastaMatch = !fechaHasta || fecha <= new Date(fechaHasta);

    return radicadoMatch && nombreMatch && estadoMatch && fechaDesdeMatch && fechaHastaMatch;
  });

  const ordenar = [...filtrar].sort((a, b) => {
    const { campo, asc } = orden;
    if (campo === "radicado") return asc ? a.radicado.localeCompare(b.radicado) : b.radicado.localeCompare(a.radicado);
    if (campo === "mensaje") return asc ? a.mensaje.localeCompare(b.mensaje) : b.mensaje.localeCompare(a.mensaje);
    if (campo === "fecha") return asc ? new Date(a.fecha_radicacion) - new Date(b.fecha_radicacion) : new Date(b.fecha_radicacion) - new Date(a.fecha_radicacion);
    return 0;
  });

  const exportarExcel = () => {
    const datos = ordenar.map((s) => ({
      Radicado: s.radicado,
      Fecha: new Date(s.fecha_radicacion).toLocaleDateString(),
      Hora: new Date(s.fecha_radicacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      Peticionario: `${s.nombre} ${s.apellido}`,
      Mensaje: s.mensaje,
      Estado: s.estado,
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PQRSD");
    XLSX.writeFile(wb, "ConsultorPQRSD.xlsx");
  };

  const badgeEstado = (estado) => {
    const colores = {
      Pendiente: "bg-orange-100 text-orange-700",
      Asignado: "bg-blue-100 text-blue-700",
      "En revisión": "bg-purple-100 text-purple-700",
      Firmado: "bg-green-100 text-green-700",
      "Para notificar": "bg-gray-100 text-gray-700",
      Terminado: "bg-gray-300 text-gray-800",
    };
    return colores[estado] || "bg-slate-100 text-slate-700";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Consultor de PQRSD</h2>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <input
          type="text"
          placeholder="Radicado"
          value={filtroRadicado}
          onChange={(e) => setFiltroRadicado(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Nombre del peticionario"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Asignado">Asignado</option>
          <option value="En revisión">En revisión</option>
          <option value="Firmado">Firmado</option>
          <option value="Para notificar">Para notificar</option>
          <option value="Terminado">Terminado</option>
        </select>
      </div>

      {/* Botón exportar */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={exportarExcel}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm"
        >
          <FileDown size={16} />
          Exportar a Excel
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-blue-800 text-white text-left">
            <tr>
              <th className="px-4 py-2 cursor-pointer" onClick={() => cambiarOrden("radicado")}>
                Radicado <ArrowUpDown className="inline-block ml-1" size={14} />
              </th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Hora</th>
              <th className="px-4 py-2">Peticionario</th>
              <th className="px-4 py-2">Mensaje</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {ordenar.map((s) => {
              const fecha = new Date(s.fecha_radicacion);
              return (
                <tr key={s.id} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2 font-mono">{s.radicado}</td>
                  <td className="px-4 py-2">{fecha.toLocaleDateString()}</td>
                  <td className="px-4 py-2">{fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2">{s.nombre} {s.apellido}</td>
                  <td className="px-4 py-2">{s.mensaje}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeEstado(s.estado)}`}>
                      {s.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => navigate(`/consultor/solicitud/${s.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConsultorPQRSD;
