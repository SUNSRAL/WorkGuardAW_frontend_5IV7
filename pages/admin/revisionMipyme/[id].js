import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../styles/IndexAdmin.module.css';
import { apiFetch } from '../../../utils/api';
import Ruta from '../../../components/RutaProtegida';

function ContenidoDetalleSolicitudMipyme() {
  const router = useRouter();
  const { id } = router.query;

  const [empresa, setEmpresa] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mostrarRechazo, setMostrarRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (!router.isReady || !id) return;
    async function cargar() {
      try {
        const data = await apiFetch(`/api/mipymes/${id}`);
        setEmpresa(data);
      } catch (err) {
        setMensaje({ tipo: 'error', texto: err.message || 'No se pudo cargar la empresa.' });
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [router.isReady, id]);

  async function emitirDictamen(aprobar) {
    setMensaje(null);
    if (!aprobar && motivoRechazo.trim().length < 10) {
      setMensaje({
        tipo: 'error',
        texto: 'Escribe un motivo de rechazo oficial de al menos 10 caracteres.',
      });
      return;
    }

    try {
      setProcesando(true);
      const resp = await apiFetch(`/api/mipymes/admin/${id}/dictamen`, {
        method: 'PUT',
        body: {
          aprobar,
          motivo_rechazo: aprobar ? null : motivoRechazo.trim(),
        },
      });
      setEmpresa(resp.mipyme);
      setMostrarRechazo(false);
      setMensaje({ tipo: 'exito', texto: resp.mensaje });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al guardar dictamen.' });
    } finally {
      setProcesando(false);
    }
  }

  return (
    <main className={styles.contenedor}>
      <header className={styles.header}>
        <div className={styles.marcaHeader}>
          <img
            src="/img/logo.png"
            alt="WorkGuard"
            className={styles.logo}
            onClick={() => router.push('/admin')}
          />
          <span className={styles.badgeAdmin}>AUDITORÍA DE SOLICITUD MIPYME #{id}</span>
        </div>

        <button type="button" className={styles.botonNav} onClick={() => router.push('/admin')}>
          ← Volver al Panel
        </button>
      </header>

      <div className={styles.contenidoPrincipal}>
        {mensaje && (
          <div
            className={styles.alertaError}
            style={
              mensaje.tipo === 'exito'
                ? { backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }
                : undefined
            }
          >
            {mensaje.texto}
          </div>
        )}

        {cargando ? (
          <p style={{ textAlign: 'center', padding: '40px', fontWeight: 'bold' }}>
            Cargando expediente de la empresa...
          </p>
        ) : (
          empresa && (
            <div className={styles.cardDetalle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div className={styles.filaIzquierda}>
                  {empresa.logo_url ? (
                    <img src={empresa.logo_url} alt={empresa.nombre_comercial} className={styles.logoMini} style={{ width: '64px', height: '64px' }} />
                  ) : (
                    <div className={styles.sinLogoMini} style={{ width: '64px', height: '64px' }}>SIN LOGO</div>
                  )}
                  <div>
                    <h2 style={{ margin: 0, color: '#0f172a' }}>{empresa.nombre_comercial}</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '0.9rem' }}>
                      RFC: <strong>{empresa.existencia_fiscal?.rfc}</strong> • {empresa.tipo_persona} •{' '}
                      {empresa.catalogo_tamano?.opcion_tamano_empresa} ({empresa.numero_trabajadores} trabajadores)
                    </p>
                  </div>
                </div>

                <span
                  className={`${styles.badgeEstatus} ${
                    empresa.estatus_verificacion === 'APROBADA'
                      ? styles.stAprobada
                      : empresa.estatus_verificacion === 'RECHAZADA'
                      ? styles.stRechazada
                      : styles.stPendiente
                  }`}
                >
                  {empresa.estatus_verificacion}
                </span>
              </div>

              <div className={styles.gridDetalle}>
                <div className={styles.bloqueInfo}>
                  <strong>Datos Fiscales y Giro</strong>
                  <p style={{ margin: '6px 0 0 0' }}>
                    <strong>Giro:</strong> {empresa.existencia_fiscal?.catalogo_giro?.opcion_giro}<br />
                    <strong>Domicilio Fiscal:</strong> {empresa.existencia_fiscal?.domicilio_fiscal?.calle}{' '}
                    {empresa.existencia_fiscal?.domicilio_fiscal?.numero}, CP{' '}
                    {empresa.existencia_fiscal?.domicilio_fiscal?.codigo_postal}
                  </p>
                </div>

                <div className={styles.bloqueInfo}>
                  <strong>Ubicación Operativa y DENUE</strong>
                  <p style={{ margin: '6px 0 0 0' }}>
                    <strong>Domicilio Operativo:</strong> {empresa.domicilio_operaciones?.calle}{' '}
                    {empresa.domicilio_operaciones?.numero}, CP {empresa.domicilio_operaciones?.codigo_postal}<br />
                    <strong>DENUE INEGI:</strong>{' '}
                    {empresa.validado_denue ? 'Coincidencia confirmada' : 'Sin coincidencia directa'}
                  </p>
                </div>

                <div className={styles.bloqueInfo}>
                  <strong>Representante Legal / Titular</strong>
                  <p style={{ margin: '6px 0 0 0' }}>
                    <strong>Nombre:</strong> {empresa.representante?.nombre_completo}<br />
                    <strong>CURP:</strong> {empresa.representante?.curp}
                  </p>
                </div>

                <div className={styles.bloqueInfo}>
                  <strong>Presencia Digital</strong>
                  <p style={{ margin: '6px 0 0 0' }}>
                    <strong>Web:</strong> {empresa.actividad?.pagina_web || 'N/A'}<br />
                    <strong>Redes:</strong>{' '}
                    {[empresa.actividad?.facebook, empresa.actividad?.instagram, empresa.actividad?.twitter]
                      .filter(Boolean)
                      .join(' • ') || 'Sin redes'}
                  </p>
                </div>
              </div>

              <div className={styles.bloqueInfo}>
                <strong>Descripción Comercial para Consultores</strong>
                <p style={{ margin: '6px 0 0 0', whiteSpace: 'pre-line' }}>
                  {empresa.descripcion || 'Sin descripción.'}
                </p>

                {empresa.fotos_mipyme?.length > 0 && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {empresa.fotos_mipyme.map((f) => (
                      <a key={f.id_foto} href={f.url_imagen} target="_blank" rel="noopener noreferrer">
                        <img
                          src={f.url_imagen}
                          alt="Establecimiento"
                          style={{ width: '160px', height: '105px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.bloqueQrs}>
                <strong>Validación Oficial SAT (QRs extraídos de los PDFs):</strong>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {empresa.existencia_fiscal?.url_qr_csf ? (
                    <a
                      href={empresa.existencia_fiscal.url_qr_csf}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1d4ed8', fontWeight: 'bold' }}
                    >
                      Verificar Constancia de Situación Fiscal (QR SAT)
                    </a>
                  ) : (
                    <span>Sin enlace QR CSF</span>
                  )}

                  {empresa.existencia_fiscal?.url_qr_32d ? (
                    <a
                      href={empresa.existencia_fiscal.url_qr_32d}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1d4ed8', fontWeight: 'bold' }}
                    >
                      Verificar Opinión de Cumplimiento 32-D (QR SAT)
                    </a>
                  ) : (
                    <span>Sin enlace QR 32-D</span>
                  )}
                </div>
              </div>

              {/* DICTAMEN FINAL */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '8px' }}>
                <button
                  type="button"
                  className={styles.btnAprobar}
                  disabled={procesando}
                  onClick={() => emitirDictamen(true)}
                >
                  Aprobar y Activar Sello WorkGuard
                </button>
                <button
                  type="button"
                  className={styles.btnRechazar}
                  disabled={procesando}
                  onClick={() => setMostrarRechazo(!mostrarRechazo)}
                >
                  Rechazar con Observaciones
                </button>
              </div>

              {mostrarRechazo && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fef2f2', padding: '14px', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '12px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>
                    Motivo oficial de rechazo (visible para la MiPyME):
                  </label>
                  <textarea
                    className={styles.textareaRechazo}
                    placeholder="Indica qué documento, enlace del SAT o dato debe corregir..."
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.btnRechazar}
                    style={{ alignSelf: 'flex-start' }}
                    disabled={procesando}
                    onClick={() => emitirDictamen(false)}
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </main>
  );
}

export default function DetalleSolicitudMipyme() {
  return (
    <Ruta rolPermitido="admin">
      <ContenidoDetalleSolicitudMipyme />
    </Ruta>
  );
}