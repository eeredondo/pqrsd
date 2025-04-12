import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UserPlus,
  Trash2,
  ShieldCheck,
  Loader,
  AtSign,
  KeyRound,
  Users
} from "lucide-react";

function PanelAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevo, setNuevo] = useState({
    usuario: "",
    nombre: "",
    correo: "",
    contraseña: "",
    rol: "asignador",
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const rolesDisponibles = ["asignador", "responsable", "revisor", "firmante", "admin"];

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const crearUsuario = async () => {
    if (!nuevo.usuario || !nuevo.nombre || !nuevo.correo || !nuevo.contraseña) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://127.0.0.1:8000/usuarios", nuevo, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Usuario creado exitosamente");
      setNuevo({ usuario: "", nombre: "", correo: "", contraseña: "", rol: "asignador" });
      obtenerUsuarios();
    } catch (err) {
      console.error("Error al crear usuario:", err);
      alert("❌ No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      obtenerUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2">
        <ShieldCheck size={24} /> Panel de Administración
      </h2>

      <div className="bg-white border p-6 rounded shadow mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus size={18} /> Crear nuevo usuario
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Usuario"
            value={nuevo.usuario}
            onChange={(e) => setNuevo({ ...nuevo, usuario: e.target.value })}
            className="border rounded p-2 w-full"
          />
          <input
            type="text"
            placeholder="Nombre completo"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            className="border rounded p-2 w-full"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={nuevo.correo}
            onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })}
            className="border rounded p-2 w-full"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={nuevo.contraseña}
            onChange={(e) => setNuevo({ ...nuevo, contraseña: e.target.value })}
            className="border rounded p-2 w-full"
          />
          <select
            value={nuevo.rol}
            onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}
            className="border rounded p-2 w-full"
          >
            {rolesDisponibles.map((rol) => (
              <option key={rol} value={rol}>
                {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={crearUsuario}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <UserPlus size={16} />}
          Crear Usuario
        </button>
      </div>

      <div className="bg-white border p-6 rounded shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} /> Usuarios registrados
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50">
                  <td className="px-4 py-3">{u.usuario}</td>
                  <td className="px-4 py-3">{u.nombre}</td>
                  <td className="px-4 py-3">{u.correo}</td>
                  <td className="px-4 py-3 capitalize">{u.rol}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => eliminarUsuario(u.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 mx-auto"
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4 italic">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PanelAdmin;
