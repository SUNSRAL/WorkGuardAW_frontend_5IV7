import Link from "next/link";
import Image from "next/image";
import Footer from "/components/footerlinks.js";
import estilos from "/styles/registroCons.module.css"
import { useState } from "react";
import { useRouter } from "next/router";

export default function RegistroConsultor() {
  const router = useRouter();

  // Estados de campos
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirContrasena, setConfirContrasena] = useState("");

  // Estados generales
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" }); // tipo: "error" | "exito"

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    if (contrasena !== confirContrasena) {
      setMensaje({
        texto: "Las contraseñas no coinciden.",
        tipo: "error",
      });
      return;
    }

    if (contrasena.length < 6) {
      setMensaje({
        texto: "La contraseña debe tener al menos 6 caracteres.",
        tipo: "error",
      });
      return;
    }

    setCargando(true);

    try {
      // Reemplaza esta URL por tu endpoint real de registro (ej. /api/registro)
      const respuesta = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario,
          nombre,
          correo,
          contrasena,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje({
          texto: datos.mensaje || "No se pudo completar el registro.",
          tipo: "error",
        });
        setCargando(false);
        return;
      }

      setMensaje({
        texto: "¡Cuenta creada con éxito! Redirigiendo...",
        tipo: "exito",
      });

      setTimeout(() => {
        router.push("/login"); // Ajusta la ruta a tu página de inicio de sesión
      }, 1500);
    } catch (error) {
      setMensaje({
        texto: "Error de conexión al intentar registrar la cuenta.",
        tipo: "error",
      });
      setCargando(false);
    }
  };

  return (
    <>
      <div className={estilos["paginaCompleta"]}>
        {/* Carga */}
        {cargando && <Cargando texto="Autenticando en WorkGuard..." />}

        {/* Logo */}
        <div className={estilos["logoEsquina"]}>
          <Link href="/">
            {/* Regreso al rol.js */}
            <Image
              src="/img/logo.png"
              alt="Logo WorkGuard"
              width={64}
              height={64}
            />
          </Link>
        </div>

        {/* Contenedor principal del formulario de registro */}
        <main className={estilos["contenedorCentrado"]}>
          <form
            onSubmit={manejarRegistro}
            className={estilos["formulario-login"]}
          >
            <div className={estilos["encabezado-registro"]}>
              <h2>Registro</h2>
            </div>

            {/* Mensaje de error o éxito */}
            {mensaje.texto && (
              <div
                role="alert"
                style={{
                  color: mensaje.tipo === "error" ? "#b91c1c" : "#15803d",
                  backgroundColor:
                    mensaje.tipo === "error" ? "#fee2e2" : "#dcfce7",
                  border: `1px solid ${
                    mensaje.tipo === "error" ? "#fca5a5" : "#86efac"
                  }`,
                  padding: "10px 12px",
                  borderRadius: "6px",
                  marginBottom: "14px",
                  fontSize: "0.9rem",
                }}
              >
                {mensaje.texto}
              </div>
            )}

            {/* Usuario */}
            <div className={estilos["campo"]}>
              <label htmlFor="usuario">Usuario</label>
              <div className={estilos["campo-input"]}>
                <Image
                  src="/img/user.png"
                  alt="Usuario"
                  width={16}
                  height={16}
                  className={estilos["icono-input"]}
                />
                <input
                  type="text"
                  id="usuario"
                  placeholder="Ingresa un usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Nombre */}
            <div className={estilos["campo"]}>
              <label htmlFor="nombre">Nombre completo</label>
              <div className={estilos["campo-input"]}>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Ingresa tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Correo */}
            <div className={estilos["campo"]}>
              <label htmlFor="correo">Correo electrónico</label>
              <div className={estilos["campo-input"]}>
                <input
                  type="email"
                  id="correo"
                  placeholder="Ingresa tu correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className={estilos["campo"]}>
              <label htmlFor="contrasena">Contraseña</label>
              <div className={estilos["campo-input"]}>
                <input
                  type="password"
                  id="contrasena"
                  placeholder="Crea una contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className={estilos["campo"]}>
              <label htmlFor="confirContrasena">Confirmar contraseña</label>
              <div className={estilos["campo-input"]}>
                <input
                  type="password"
                  id="confirContrasena"
                  placeholder="Repite tu contraseña"
                  value={confirContrasena}
                  onChange={(e) => setConfirContrasena(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={estilos["boton-enviar"]}
            >
              {cargando ? "Registrando..." : "Crear cuenta"}
            </button>

            
          </form>
        </main>

        <Footer />
      </div>
    </>
  );
}