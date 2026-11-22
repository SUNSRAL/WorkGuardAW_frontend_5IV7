import Link from "next/link";
import Image from "next/image";
import Footer from "/components/footerlinks.js";
import { apiFetch } from "../../utils/api.js";
import Cargando from "../../components/cargando.js";
import estilos from "/styles/registroCons.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RegistroConsultor() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirContrasena, setConfirContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Asegura que al entrar a registro los campos sensibles inicien vacíos
  useEffect(() => {
    setUsuario("");
    setContrasena("");
    setConfirContrasena("");
  }, []);

  //No acompletado
  useEffect(() => {
    const timer = setTimeout(() => {
      setUsuario("");
      setContrasena("");
      setConfirContrasena("");
    }, 50);

    return () => clearTimeout(timer);
  }, []);

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
      await apiFetch("/api/usuarios/consultores", {
        method: "POST",
        body: { usuario, nombre, correo, contrasena },
      });

      setMensaje({
        texto: "¡Cuenta creada con éxito! Redirigiendo...",
        tipo: "exito",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setMensaje({
        texto: error.message || "No se pudo completar el registro.",
        tipo: "error",
      });
      setCargando(false);
    }
  };

  return (
    <div className={estilos["envolturaPagina"]}>
      {cargando && <Cargando texto="Autenticando en WorkGuard..." />}

      <section className={estilos["seccionFormulario"]}>
        <div className={estilos["logoEsquina"]}>
          <Link href="/">
            <Image
              src="/img/logo.png"
              alt="Logo WorkGuard"
              width={64}
              height={64}
              style={{ width: "auto", height: "auto" }}
            />
          </Link>
        </div>

        <main className={estilos["contenedorCentrado"]}>
          <form
            onSubmit={manejarRegistro}
            className={estilos["formulario-login"]}
            autoComplete="off"
          >
            <div className={estilos["encabezado-registro"]}>
              <h2>Registro</h2>
            </div>

            {mensaje.texto && (
              <div
                role="alert"
                className={estilos["mensaje-estado"]}
                style={{
                  color: mensaje.tipo === "error" ? "#DC2626" : "#15803D",
                  backgroundColor:
                    mensaje.tipo === "error" ? "#FEE2E2" : "#DCFCE7",
                  border: `1px solid ${
                    mensaje.tipo === "error" ? "#FCA5A5" : "#86EFAC"
                  }`,
                  padding: "10px 12px",
                  borderRadius: "8px",
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
                  src="/img/userp.png"
                  alt="Usuario"
                  width={16}
                  height={16}
                  className={estilos["icono-input"]}
                />
                <input
                  type="text"
                  id="usuario"
                  name="wg_reg_user_field"
                  placeholder="Ingresa un usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  autoComplete="off"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute("readOnly")}
                  required
                />
              </div>
            </div>

            {/* Nombre */}
            <div className={estilos["campo"]}>
              <label htmlFor="nombre">Nombre completo</label>
              <div className={estilos["campo-input"]}>
                <Image
                  src="/img/nombre.png"
                  alt="Nombre"
                  width={16}
                  height={16}
                  className={estilos["icono-input"]}
                />
                <input
                  type="text"
                  id="nombre"
                  name="wg_reg_name_field"
                  placeholder="Ingresa tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Correo */}
            <div className={estilos["campo"]}>
              <label htmlFor="correo">Correo electrónico</label>
              <div className={estilos["campo-input"]}>
                <Image
                  src="/img/correo.png"
                  alt="Correo"
                  width={16}
                  height={16}
                  className={estilos["icono-input"]}
                />
                <input
                  type="email"
                  id="correo"
                  name="wg_reg_email_field"
                  placeholder="Ingresa tu correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className={estilos["campo"]}>
              <label htmlFor="contrasena">Contraseña</label>
              <div className={estilos["campo-input"]}>
                <Image
                  src="/img/passwordp.png"
                  alt="Contraseña"
                  width={16}
                  height={16}
                  className={estilos["icono-input"]}
                />
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  id="contrasena"
                  name="wg_reg_pass_field"
                  placeholder="Crea una contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  autoComplete="new-password"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute("readOnly")}
                  required
                />

                <button
                  type="button"
                  className={estilos["boton-ojo"]}
                  onClick={() => setMostrarContrasena((anterior) => !anterior)}
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  aria-pressed={mostrarContrasena}
                >
                  {mostrarContrasena ? (
                    /* Contraseña visible -> ojo abierto */
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    /* Contraseña oculta -> ojo tachado / bloqueado */
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                      <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 7 9 7a15.5 15.5 0 01-3 3.7" />
                      <path d="M6.2 6.2C4.1 7.6 3 12 3 12s4 7 9 7a9.8 9.8 0 004-.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className={estilos["campo"]}>
              <label htmlFor="confirContrasena">Confirmar contraseña</label>
              <div className={estilos["campo-input"]}>
                <Image
                  src="/img/passwordp.png"
                  alt="Confirmar contraseña"
                  width={16}
                  height={16}
                  className={estilos["icono-input"]}
                />
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  id="confirContrasena"
                  name="wg_reg_confir_field"
                  placeholder="Repite tu contraseña"
                  value={confirContrasena}
                  onChange={(e) => setConfirContrasena(e.target.value)}
                  autoComplete="new-password"
                  readOnly
                  onFocus={(e) => e.target.removeAttribute("readOnly")}
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
      </section>

      <div className={estilos["piePagina"]}>
        <Footer />
      </div>
    </div>
  );
}
