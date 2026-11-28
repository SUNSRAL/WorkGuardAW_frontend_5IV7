import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import RutaProtegida from "../../../components/RutaProtegida";
import { apiFetch } from "../../../utils/api.js";
import styles from "../../../styles/DetalleReporte.module.css";

export default function DetalleReporte() {
  const router = useRouter();
  const { id } = router.query;

  const [reporte, setReporte] = useState(null);
  const [motivoLN, setMotivoLN] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  /* ── Cargar detalle del reporte ── */
  useEffect(() => {
    if (!router.isReady || !id) return;

    async function cargarDetalle() {
      try {
        const datos = await apiFetch(`/api/reportes/${id}`);
        setReporte(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargarDetalle();
  }, [router.isReady, id, API_URL]);

  /* ── Enviar empresa a la Lista Negra ── */
    const manejarEnviarListaNegra = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!motivoLN.trim()) {
      setError(
        "Escribe el motivo oficial para enviar la empresa a la lista negra.",
      );
      return;
    }

    setEnviando(true);
    try {
      await apiFetch(`/api/lista-negra/reportes/${id}`, {
        method: "POST",
        body: { motivo: motivoLN.trim() },
      });

      setExito("Empresa enviada a la Lista Negra correctamente.");
      setReporte((prev) => ({
        ...prev,
        estado: "ACEPTADO",
        otro_motivo: motivoLN.trim(),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };


  const formatearFecha = (iso) => {
    if (!iso) return "Sin fecha";
    return new Date(iso).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <RutaProtegida rolPermitido="admin">
      <div className={styles.pageWrapper}>
        {/* ── HEADER FLAT ── */}
        <header className={styles.header}>
          <div className={styles.headerBrand}>
            <Image
              src="/img/logo.png"
              alt="Logo WorkGuard"
              width={40}
              height={40}
            />
            <div className={styles.headerLeft}>
              <span className={styles.adminLabel}>ADMIN GLOBAL</span>
              <h2 className={styles.panelTitle}>Detalle del Reporte #{id}</h2>
            </div>
          </div>
          <button
            className={styles.btnVolver}
            onClick={() => router.push("/admin")}
          >
            ← Volver a Reportes
          </button>
        </header>

        {/* ── MAIN ── */}
        <main className={styles.main}>
          <div className={styles.container}>
            {cargando && (
              <p className={styles.mensajeEstado}>
                Cargando información del reporte...
              </p>
            )}
            {error && <p className={styles.mensajeError}>⚠ {error}</p>}
            {exito && <p className={styles.mensajeExito}>✔ {exito}</p>}

            {!cargando && reporte && (
              <div className={styles.card}>
                {/* Estado y fecha */}
                <div className={styles.topRow}>
                  <span
                    className={`${styles.badgeEstado} ${
                      reporte.estado === "PENDIENTE"
                        ? styles.badgePendiente
                        : styles.badgeAceptado
                    }`}
                  >
                    {reporte.estado}
                  </span>
                  <span className={styles.fecha}>
                    Reportado el: {formatearFecha(reporte.fecha_reporte)}
                  </span>
                </div>

                {/* Datos de la MiPyME */}
                <section className={styles.seccion}>
                  <h3 className={styles.subtitulo}>Empresa Reportada</h3>
                  <p className={styles.datoPrincipal}>
                    {reporte.nombre_comercial}
                  </p>
                  <div className={styles.gridDatos}>
                    <span>
                      <strong>ID MiPyME:</strong> #{reporte.id_mipyme}
                    </span>
                    <span>
                      <strong>Tipo de persona:</strong>{" "}
                      {reporte.tipo_persona || "N/A"}
                    </span>
                    <span>
                      <strong>Trabajadores:</strong>{" "}
                      {reporte.numero_trabajadores ?? "N/A"}
                    </span>
                  </div>
                </section>

                {/* Datos del Consultor */}
                <section className={styles.seccion}>
                  <h3 className={styles.subtitulo}>
                    Reportado por (Consultor)
                  </h3>
                  <div className={styles.consultorBox}>
                    <img
                      src={reporte.consultor_foto || "/img/perfil.png"}
                      alt={reporte.consultor_usuario}
                      className={styles.avatar}
                      onError={(e) => {
                        e.target.src = "/img/perfil.png";
                      }}
                    />
                    <div>
                      <p className={styles.nombreConsultor}>
                        {reporte.consultor_nombre}
                      </p>
                      <p className={styles.metaConsultor}>
                        @{reporte.consultor_usuario} •{" "}
                        {reporte.consultor_correo}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Motivo y Descripción */}
                <section className={styles.seccion}>
                  <h3 className={styles.subtitulo}>Detalles de la Denuncia</h3>
                  <p className={styles.motivoTag}>Motivo: {reporte.motivo}</p>
                  <div className={styles.descripcionBox}>
                    {reporte.descripcion}
                  </div>
                </section>

                {/* Acción: Enviar a Lista Negra (solo si está PENDIENTE) */}
                {reporte.estado === "PENDIENTE" ? (
                  <form
                    onSubmit={manejarEnviarListaNegra}
                    className={styles.formListaNegra}
                  >
                    <h3 className={styles.subtitulo}>
                      Dictamen de Lista Negra
                    </h3>
                    <label htmlFor="motivoLN" className={styles.label}>
                      Motivo oficial visible en la Lista Negra:
                    </label>
                    <textarea
                      id="motivoLN"
                      rows={3}
                      className={styles.textarea}
                      placeholder="Ej. Se comprobó cobro indebido a candidatos durante el proceso de selección..."
                      value={motivoLN}
                      onChange={(e) => setMotivoLN(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className={styles.btnConfirmar}
                      disabled={enviando}
                    >
                      {enviando
                        ? "Procesando..."
                        : "Aprobar y Enviar a Lista Negra"}
                    </button>
                  </form>
                ) : (
                  <section className={styles.seccion}>
                    <h3 className={styles.subtitulo}>Resolución Aplicada</h3>
                    <p className={styles.resolucionBox}>
                      <strong>Motivo en Lista Negra:</strong>{" "}
                      {reporte.otro_motivo}
                    </p>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </RutaProtegida>
  );
}
