import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const datos = new URLSearchParams();
    datos.append("username", usuario);
    datos.append("password", contraseña);

    try {
      const res = await axios.post("http://127.0.0.1:8000/usuarios/login", datos, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const { access_token, rol, id, nombre } = res.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("usuario", JSON.stringify({ usuario, rol, id, nombre }));

      navigate(`/${rol}`);
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Iniciar Sesión</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Iniciar sesión
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center font-medium">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-700 hover:underline text-sm"
          >
            <ArrowLeftCircle size={18} />
            Volver al menú principal
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
