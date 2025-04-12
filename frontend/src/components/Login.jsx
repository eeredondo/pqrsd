import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      const { access_token, rol, id } = res.data;
      console.log("🧠 Datos recibidos del backend:", res.data);

      localStorage.setItem("token", access_token);
      localStorage.setItem("usuario", JSON.stringify({ usuario, rol, id }));

      switch (rol) {
        case "admin":
          navigate("/admin");
          break;
        case "asignador":
          navigate("/asignador");
          break;
        case "responsable":
          navigate("/responsable");
          break;
        case "revisor":
          navigate("/revisor");
          break;
        case "firmante":
          navigate("/firmante");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4">Iniciar Sesión</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
        >
          Iniciar sesión
        </button>
        {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
