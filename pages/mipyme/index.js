import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/IndexMipyme.module.css";
import { apiFetch } from "../../utils/api";
import Ruta from "../../components/RutaProtegida";

export default function PanelMipyme() {
  const router = useRouter();
  const [mipyme, setMipyme] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [subiendoFotoOrden, setSubiendoFotoOrden] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const [archivoLogo, setArchivoLogo] = useState(null);
  const [previewLogoLocal, setPreviewLogoLocal] = useState("");

  const [form, setForm] = useState({
    descripcion: "",
    pagina_web: "",
    facebook: "",
    instagram: "",
    twitter: "",
  });

  async function cargarPerfil() {
    try {
      const data = await apiFetch("/api/mipymes/mi-perfil");
      setMipyme(data);
      setForm({
        descripcion: data.descripcion || "",
        pagina_web: data.actividad?.pagina_web || "",
        facebook: data.actividad?.facebook || "",
        instagram: data.actividad?.instagram || "",
        twitter: data.actividad?.twitter || "",
      });
    } catch (err) {
      console.error("No se pudo cargar el perfil:", err);
      setMensaje({
        tipo: "error",
        texto:
          err.message || "No se pudo cargar tu perfil. Verifica tu sesión.",
      });
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPerfil();
  }, []);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMensaje(null);
  }

  function seleccionarLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMensaje({
        tipo: "error",
        texto: "El logotipo debe ser JPG, PNG o WEBP.",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMensaje({
        tipo: "error",
        texto: "El logotipo no debe superar los 2 MB.",
      });
      return;
    }
    setArchivoLogo(file);
    setPreviewLogoLocal(URL.createObjectURL(file));
    setMensaje(null);
  }

  async function guardarCambios(e, enviarRevision = false) {
    if (e) e.preventDefault();
    setMensaje(null);

    if (enviarRevision && form.descripcion.trim().length < 15) {
      setMensaje({
        tipo: "error",
        texto:
          "Escribe una descripción comercial de al menos 15 caracteres antes de enviarla a revisión.",
      });
      return;
    }

    try {
      if (enviarRevision) setEnviando(true);
      else setGuardando(true);

      const fd = new FormData();
      fd.append("descripcion", form.descripcion.trim());
      fd.append("pagina_web", form.pagina_web.trim());
      fd.append("facebook", form.facebook.trim());
      fd.append("instagram", form.instagram.trim());
      fd.append("twitter", form.twitter.trim());
      fd.append("enviar_a_revision", String(enviarRevision));
      if (archivoLogo) {
        fd.append("logo", archivoLogo);
      }

      const resp = await apiFetch("/api/mipymes/mi-perfil", {
        method: "PUT",
        body: fd,
      });

      setMipyme(resp.mipyme);
      setArchivoLogo(null);
      setPreviewLogoLocal("");
      setMensaje({ tipo: "exito", texto: resp.mensaje });
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al guardar los cambios.",
      });
    } finally {
      setGuardando(false);
      setEnviando(false);
    }
  }

  async function subirFotoEstablecimiento(e, orden) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMensaje({
        tipo: "error",
        texto: "Solo se permiten fotografías en formato JPG, PNG o WEBP.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMensaje({
        tipo: "error",
        texto: "Cada fotografía del establecimiento debe pesar máximo 5 MB.",
      });
      return;
    }

    try {
      setSubiendoFotoOrden(orden);
      setMensaje(null);
      const fd = new FormData();
      fd.append("orden", String(orden));
      fd.append("foto", file);

      const resp = await apiFetch("/api/mipymes/mi-perfil/fotos", {
        method: "POST",
        body: fd,
      });

      await cargarPerfil();
      setMensaje({ tipo: "exito", texto: resp.mensaje });
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al subir la fotografía.",
      });
    } finally {
      setSubiendoFotoOrden(null);
    }
  }

  async function eliminarFoto(idFoto) {
    try {
      setMensaje(null);
      await apiFetch(`/api/mipymes/mi-perfil/fotos/${idFoto}`, {
        method: "DELETE",
      });
      await cargarPerfil();
      setMensaje({
        tipo: "exito",
        texto: "Fotografía eliminada de tu establecimiento.",
      });
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err.message || "No se pudo eliminar la fotografía.",
      });
    }
  }

  async function cerrarSesion() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      router.push("/login");
    }
  }

  const estatus = mipyme?.estatus_verificacion || "BORRADOR_PERFIL";
  const rfcEmpresa = mipyme?.existencia_fiscal?.rfc || "";
  const giroEmpresa =
    mipyme?.existencia_fiscal?.catalogo_giro?.opcion_giro || "Giro verificado";
  const alcaldiaEmpresa =
    mipyme?.domicilio_operaciones?.catalogo_alcaldia_operaciones
      ?.opcion_alcaldia || "";
  const fotosActuales = mipyme?.fotos_mipyme || [];
  const logoMostrado = previewLogoLocal || mipyme?.logo_url || "";
  const portadaMostrada = fotosActuales[0]?.url_imagen || "";

  return (
    <Ruta rolPermitido="mipyme">
      <main className={styles.contenedor}>
        <header className={styles.header}>
          <img
            src="/img/logo.png"
            alt="WorkGuard"
            className={styles.logo}
            onClick={() => router.push("/")}
          />
          <div className={styles.infoUsuario}>
            <span>
              {mipyme?.nombre_comercial} {rfcEmpresa ? `(${rfcEmpresa})` : ""}
            </span>
            <button
              type="button"
              className={styles.botonSalir}
              onClick={cerrarSesion}
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div className={styles.contenidoPrincipal}>
          {estatus === "BORRADOR_PERFIL" && (
            <div className={`${styles.bannerEstatus} ${styles.bannerBorrador}`}>
              <h2>📝 Paso Final Pendiente: Personaliza tu Tarjeta Pública</h2>
              <p>
                Tus validaciones fiscales y de identidad salieron en Verde. Sube
                tu logotipo, agrega hasta 3 fotos de tu establecimiento y
                redacta la descripción que verán los consultores. Cuando estés
                listo, haz clic en{" "}
                <strong>"Enviar perfil a revisión oficial"</strong>.
              </p>
            </div>
          )}

          {estatus === "PENDIENTE_REVISION" && (
            <div className={`${styles.bannerEstatus} ${styles.bannerRevision}`}>
              <h2>⏳ Perfil en Auditoría por el Administrador</h2>
              <p>
                Tu solicitud ya fue enviada. Un Administrador está verificando
                tus enlaces oficiales del SAT y la información visual de tu
                tarjeta antes de hacerla visible para los consultores.
              </p>
            </div>
          )}

          {estatus === "APROBADA" && (
            <div className={`${styles.bannerEstatus} ${styles.bannerAprobado}`}>
              <h2>🛡️ Sello WorkGuard Activo</h2>
              <p>
                ¡Felicidades! Tu empresa fue aprobada y ya aparece con su
                tarjeta completa y Sello WorkGuard en el directorio de
                consultores verificados.
              </p>
            </div>
          )}

          {estatus === "RECHAZADA" && (
            <div
              className={`${styles.bannerEstatus} ${styles.bannerRechazado}`}
            >
              <h2>❌ Solicitud Rechazada con Observaciones</h2>
              <p>
                Motivo indicado por el Administrador:{" "}
                <strong>
                  {mipyme?.motivo_rechazo || "Sin especificar motivo."}
                </strong>
              </p>
              <p style={{ marginTop: "4px" }}>
                Corrige los puntos señalados y vuelve a presionar "Enviar perfil
                a revisión oficial".
              </p>
            </div>
          )}

          {mensaje && (
            <div
              className={`${styles.alertaFeedback} ${
                mensaje.tipo === "exito"
                  ? styles.alertaExito
                  : styles.alertaError
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          <div className={styles.gridDosColumnas}>
            {/* COLUMNA IZQUIERDA: FORMULARIO Y GALERÍA */}
            <section className={styles.tarjetaSeccion}>
              <div>
                <h3>Personalización de Tarjeta Pública</h3>
                <p className={styles.subTexto}>
                  Configura cómo verán tu empresa los consultores en el
                  directorio de WorkGuard.
                </p>
              </div>

              <form
                onSubmit={(e) => guardarCambios(e, false)}
                className={styles.formularioPerfil}
              >
                <div className={styles.grupo}>
                  <label htmlFor="logo_file">
                    Logotipo de la Empresa (JPG, PNG o WEBP — máx. 2 MB)
                  </label>
                  <input
                    id="logo_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={seleccionarLogo}
                  />
                </div>

                <div className={styles.grupo}>
                  <label htmlFor="descripcion">
                    Descripción Comercial y Servicios *
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    placeholder="Describe brevemente a qué se dedica tu empresa, productos o servicios principales..."
                    value={form.descripcion}
                    onChange={manejarCambio}
                    required
                  />
                </div>

                <div className={styles.grupo}>
                  <label htmlFor="pagina_web">Sitio Web</label>
                  <input
                    id="pagina_web"
                    type="text"
                    name="pagina_web"
                    placeholder="https://www.miempresa.com"
                    value={form.pagina_web}
                    onChange={manejarCambio}
                  />
                </div>

                <div className={styles.grupo}>
                  <label htmlFor="facebook">Facebook</label>
                  <input
                    id="facebook"
                    type="text"
                    name="facebook"
                    placeholder="https://facebook.com/miempresa"
                    value={form.facebook}
                    onChange={manejarCambio}
                  />
                </div>

                <div className={styles.grupo}>
                  <label htmlFor="instagram">Instagram</label>
                  <input
                    id="instagram"
                    type="text"
                    name="instagram"
                    placeholder="https://instagram.com/miempresa"
                    value={form.instagram}
                    onChange={manejarCambio}
                  />
                </div>

                <div className={styles.grupo}>
                  <label htmlFor="twitter">X (Twitter)</label>
                  <input
                    id="twitter"
                    type="text"
                    name="twitter"
                    placeholder="https://twitter.com/miempresa"
                    value={form.twitter}
                    onChange={manejarCambio}
                  />
                </div>

                {/* GALERÍA DE HASTA 3 FOTOS DEL ESTABLECIMIENTO */}
                <div className={styles.grupo}>
                  <label>
                    Fotografías del Establecimiento (máximo 3 imágenes — 5 MB
                    c/u)
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "8px",
                    }}
                  >
                    {[1, 2, 3].map((orden) => {
                      const fotoExistente = fotosActuales.find(
                        (f) => Number(f.orden) === orden,
                      );
                      const subiendoEsta = subiendoFotoOrden === orden;
                      return (
                        <div
                          key={orden}
                          style={{
                            border: "1px dashed #CBD5E1",
                            padding: "10px",
                            borderRadius: "8px",
                            textAlign: "center",
                            width: "110px",
                            backgroundColor: "#F8FAFC",
                          }}
                        >
                          {fotoExistente ? (
                            <>
                              <img
                                src={fotoExistente.url_imagen}
                                alt={`Establecimiento ${orden}`}
                                style={{
                                  width: "100%",
                                  height: "70px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  marginBottom: "6px",
                                }}
                              />
                              <label
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#0B162C",
                                  fontWeight: "800",
                                  cursor: "pointer",
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                {subiendoEsta ? "..." : "Cambiar"}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  style={{ display: "none" }}
                                  onChange={(e) =>
                                    subirFotoEstablecimiento(e, orden)
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                className={styles.btnMiniEliminar}
                                onClick={() =>
                                  eliminarFoto(fotoExistente.id_foto)
                                }
                              >
                                Quitar
                              </button>
                            </>
                          ) : (
                            <label
                              style={{
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                minHeight: "95px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: "#64748B",
                                  fontWeight: "700",
                                }}
                              >
                                Foto {orden} {orden === 1 ? "(Portada)" : ""}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#DCA443",
                                  fontWeight: "800",
                                  marginTop: "6px",
                                }}
                              >
                                {subiendoEsta ? "Subiendo..." : "+ Subir"}
                              </span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                style={{ display: "none" }}
                                onChange={(e) =>
                                  subirFotoEstablecimiento(e, orden)
                                }
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button
                    type="submit"
                    className={styles.botonSecundario}
                    disabled={guardando || enviando}
                  >
                    {guardando ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  {(estatus === "BORRADOR_PERFIL" ||
                    estatus === "RECHAZADA") && (
                    <button
                      type="button"
                      className={styles.botonPrincipal}
                      onClick={(e) => guardarCambios(e, true)}
                      disabled={enviando || guardando}
                    >
                      {enviando
                        ? "Enviando..."
                        : "🚀 Enviar perfil a revisión oficial"}
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* COLUMNA DERECHA: VISTA PREVIA EXACTA DE LA TARJETA */}
            <section className={styles.tarjetaSeccion}>
              <h3>Vista Previa de tu Tarjeta</h3>
              <p className={styles.subTexto}>
                Así visualizarán tu empresa los consultores.
              </p>

              <div
                style={{
                  border: "1.5px solid #CBD5E1",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#F8FAFC",
                  marginTop: "6px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "150px",
                    backgroundColor: "#E2E8F0",
                    borderRadius: "6px",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  {portadaMostrada ? (
                    <img
                      src={portadaMostrada}
                      alt="Portada"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#64748B",
                        fontWeight: "600",
                        textAlign: "center",
                        padding: "0 10px",
                      }}
                    >
                      Sube la Foto 1 para mostrar tu establecimiento aquí
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#CBD5E1",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: "0",
                      border: "1px solid #94A3B8",
                    }}
                  >
                    {logoMostrado ? (
                      <img
                        src={logoMostrado}
                        alt="Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: "800",
                          color: "#334155",
                        }}
                      >
                        LOGO
                      </span>
                    )}
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "2px 8px",
                        backgroundColor: "#FEF3C7",
                        color: "#92400E",
                        border: "1.5px solid #F59E0B",
                        borderRadius: "4px",
                        fontWeight: "800",
                        display: "inline-block",
                        marginBottom: "3px",
                      }}
                    >
                      {estatus === "APROBADA"
                        ? "🛡️ Sello WorkGuard Activo"
                        : "Vista Previa de Sello"}
                    </span>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "1rem",
                        color: "#0B162C",
                        fontWeight: "800",
                      }}
                    >
                      {mipyme?.nombre_comercial || "Nombre Comercial"}
                    </h4>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "0.84rem",
                    color: "#475569",
                    margin: "4px 0",
                    fontWeight: "600",
                  }}
                >
                  <strong>Giro:</strong> {giroEmpresa}
                </p>
                {alcaldiaEmpresa && (
                  <p
                    style={{
                      fontSize: "0.84rem",
                      color: "#475569",
                      margin: "4px 0",
                      fontWeight: "600",
                    }}
                  >
                    <strong>Alcaldía:</strong> {alcaldiaEmpresa}
                  </p>
                )}
                <p
                  style={{
                    fontSize: "0.84rem",
                    color: "#334155",
                    marginTop: "8px",
                    whiteSpace: "pre-line",
                    lineHeight: "1.4",
                  }}
                >
                  {form.descripcion.trim() ||
                    "Escribe una descripción comercial para que los consultores conozcan tus servicios."}
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </Ruta>
  );
}