import React, { useEffect, useState } from "react";
import axios from "axios";
import { Inbox, CheckCircle2, Clock4 } from "lucide-react";

function ResumenCards() {
  const [total, setTotal] = useState(0);
  const [asignadas, setAsignadas] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchResumen();
  }, []);

  const fetchResumen = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/solicitudes/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTotal(res.data.length);
      setAsignadas(res.data.filter((s) => s.estado === "Asignado").length);
      setPendientes(res.data.filter((s) => s.estado === "Pendiente").length);
    } catch (err) {
      console.error("Error al cargar resumen:", err);
    }
  };

  const Card = ({ title, count, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center gap-4">
      <div className={`text-${color}-600 bg-${color}-100 p-2 rounded-full`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold text-${color}-700`}>{count}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
      <Card title="Total PQRSD recibidas" count={total} icon={Inbox} color="blue" />
      <Card title="PQRSD asignadas" count={asignadas} icon={CheckCircle2} color="green" />
      <Card title="Sin asignación" count={pendientes} icon={Clock4} color="orange" />
    </div>
  );
}

export default ResumenCards;
