// frontend/src/components/NotificacionEmergente.jsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NotificacionEmergente({ visible, onClose, solicitud }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(onClose, 6000);
      return () => clearTimeout(timeout);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed top-6 right-6 bg-white border border-blue-200 rounded-xl shadow-lg z-50 p-4 w-80"
        >
          <div className="flex items-start gap-3">
            <Bell className="text-blue-600 mt-1" size={22} />
            <div className="flex-1">
              <h4 className="font-bold text-blue-800 mb-1">Nueva PQRSD radicada</h4>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{solicitud.nombre} {solicitud.apellido}</span> registró una solicitud con radicado <span className="font-mono">{solicitud.radicado}</span>
              </p>
              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={() => navigate(`/solicitud/${solicitud.id}`)}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Ver solicitud
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificacionEmergente;
