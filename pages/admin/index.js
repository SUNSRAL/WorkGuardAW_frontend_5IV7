import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/IndexAdmin.module.css';
import { apiFetch } from '../../utils/api';
import Ruta from '../../components/RutaProtegida';

function ContenidoPanelAdmin() {
  const router = useRouter();
  const [tabActiva, setTabActiva] = useState('solicitudes'); // 'solicitudes' | 'reportes' | 'listaWorkguard' | 'listaEfos'
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Datos
  const [solicitudes, setSolicitudes] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [reportesNuevos, setReportesNuevos] = useState(0);
  const [listadoNegroWg, setListadoNegroWg] = useState([]);
  const [listaNegraSat, setListaNegraSat] = useState([]);
  const [totalEfosSat, setTotalEfosSat] = useState(0);

  // Filtros
  const [filtroEstatusMipyme, setFiltroEstatusMipyme] = useState('PENDIENTE_REVISION');
  const [busquedaMipyme, setBusquedaMipyme] = useState('');
  const [filtroEstadoReporte, setFiltroEstadoReporte] = useState('PENDIENTE');
  const [busquedaWg, setBusquedaWg] = useState('');
  const [busquedaEfos, setBusquedaEfos] = useState('');
  const [cargandoEfos, setCargandoEfos] = useState(false);

  async function cargarInicial() {
    setCargando(true);
    try {
      const [solData, repData, lnWgData, efosData] = await Promise.all([
        apiFetch('/api/mipymes/admin/solicitudes'),
        apiFetch('/api/reportes'),
        apiFetch('/api/lista-negra').catch(() => ({ empresas: [] })),
        apiFetch('/api/mipymes/admin/efos?limit=20').catch(() => ({ efos: [], total: 0 })),
      ]);

      setSolicitudes(Array.isArray(solData) ? solData : []);
      setReportes(repData?.reportes || []);
      setReportesNuevos(repData?.nuevos || 0);
      setListadoNegroWg(lnWgData?.empresas || []);
      setListaNegraSat(efosData?.efos || []);
      setTotalEfosSat(efosData?.total || 0);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos de administración.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarInicial();
  }, []);

  async function filtrarEfosSat(texto) {
    setBusquedaEfos(texto);
    setCargandoEfos(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (texto.trim()) params.set('q', texto.trim());
      const res = await apiFetch(`/api/mipymes/admin/efos?${params.toString()}`);
      setListaNegraSat(res?.efos || []);
      setTotalEfosSat(res?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoEfos(false);
    }
  }

  async function cerrarSesion() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      router.push('/login');
    }
  }

  const pendientesCount = solicitudes.filter((s) => s.estatus_verificacion === 'PENDIENTE_REVISION').length;
  const aprobadasCount = solicitudes.filter((s) => s.estatus_verificacion === 'APROBADA').length;

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const pasaEstatus =
      filtroEstatusMipyme === 'TODAS' || s.estatus_verificacion === filtroEstatusMipyme;
    const q = busquedaMipyme.trim().toLowerCase();
    const pasaTexto =
      !q ||
      s.nombre_comercial?.toLowerCase().includes(q) ||
      s.existencia_fiscal?.rfc?.toLowerCase().includes(q);
    return pasaEstatus && pasaTexto;
  });

  const reportesFiltrados = reportes.filter(
    (r) => filtroEstadoReporte === 'TODOS' || r.estado === filtroEstadoReporte
  );

  const negroWgFiltrado = listadoNegroWg.filter((item) => {
    const q = busquedaWg.trim().toLowerCase();
    return (
      !q ||
      item.nombre_comercial?.toLowerCase().includes(q) ||
      item.motivo_lista_negra?.toLowerCase().includes(q)
    );
  });

  return (
    <main className={styles.contenedor}>
      <header className={styles.header}>
        <div className={styles.marcaHeader}>
          <img
            src="/img/logo.png"
            alt="WorkGuard"
            className={styles.logo}
            onClick={() => router.push('/')}
          />
          <span className={styles.badgeAdmin}>PANEL DE ADMIN</span>
        </div>

        <div className={styles.accionesHeader}>
          <button type="button" className={styles.botonSalir} onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className={styles.contenidoPrincipal}>
        {/* MÉTRICAS */}
        <section className={styles.gridMetricas}>
          <div className={styles.cardMetrica}>
            <span>MiPyMEs por Revisar</span>
            <strong>{pendientesCount}</strong>
          </div>
          <div className={styles.cardMetrica}>
            <span>MiPyMEs Aprobadas</span>
            <strong>{aprobadasCount}</strong>
          </div>
          <div className={styles.cardMetrica}>
            <span>Reportes Pendientes</span>
            <strong>{reportesNuevos}</strong>
          </div>
          <div className={styles.cardMetrica}>
            <span>Padrón SAT EFOS</span>
            <strong>{totalEfosSat.toLocaleString('es-MX')}</strong>
          </div>
        </section>

        {/* PESTAÑAS INDEPENDIENTES */}
        <nav className={styles.barraTabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tabActiva === 'solicitudes' ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva('solicitudes')}
          >
            Registro de MiPyMEs ({pendientesCount})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tabActiva === 'reportes' ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva('reportes')}
          >
            Reportes ({reportesNuevos})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tabActiva === 'listaWorkguard' ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva('listaWorkguard')}
          >
            Listado Negro WorkGuard ({listadoNegroWg.length})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tabActiva === 'listaEfos' ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva('listaEfos')}
          >
            SAT EFOS 69-B
          </button>
        </nav>

        {error && <div className={styles.alertaError}>{error}</div>}

        {cargando ? (
          <p style={{ textAlign: 'center', padding: '40px', fontWeight: 'bold', color: '#1b263b' }}>
            Cargando información...
          </p>
        ) : (
          <>
            {/* =============================================================== */}
            {/* TAB 1: LISTA HORIZONTAL COMPACTA DE MIPYMES                     */}
            {/* =============================================================== */}
            {tabActiva === 'solicitudes' && (
              <>
                <div className={styles.barraFiltros}>
                  <input
                    type="text"
                    className={styles.inputBusqueda}
                    placeholder="Buscar empresa por nombre o RFC..."
                    value={busquedaMipyme}
                    onChange={(e) => setBusquedaMipyme(e.target.value)}
                  />
                  <select
                    className={styles.selectFiltro}
                    value={filtroEstatusMipyme}
                    onChange={(e) => setFiltroEstatusMipyme(e.target.value)}
                  >
                    <option value="PENDIENTE_REVISION">Pendientes de Revisión</option>
                    <option value="APROBADA">Aprobadas</option>
                    <option value="RECHAZADA">Rechazadas</option>
                    <option value="TODAS">Todas</option>
                  </select>
                </div>

                {solicitudesFiltradas.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                    No hay solicitudes de MiPyMEs en esta vista.
                  </p>
                ) : (
                  <div className={styles.listaHorizontal}>
                    {solicitudesFiltradas.map((emp) => {
                      const est = emp.estatus_verificacion;
                      const badgeClase =
                        est === 'APROBADA'
                          ? styles.stAprobada
                          : est === 'RECHAZADA'
                          ? styles.stRechazada
                          : styles.stPendiente;

                      return (
                        <div key={emp.id_mipyme} className={styles.filaHorizontal}>
                          <div className={styles.filaIzquierda}>
                            {emp.logo_url ? (
                              <img
                                src={emp.logo_url}
                                alt={emp.nombre_comercial}
                                className={styles.logoMini}
                              />
                            ) : (
                              <div className={styles.sinLogoMini}>PYME</div>
                            )}
                            <div>
                              <strong style={{ color: '#0f172a', fontSize: '0.98rem' }}>
                                {emp.nombre_comercial}
                              </strong>
                              <p style={{ margin: '2px 0 0 0', fontSize: '0.83rem', color: '#64748b' }}>
                                RFC: {emp.existencia_fiscal?.rfc || 'N/D'} •{' '}
                                {emp.existencia_fiscal?.catalogo_giro?.opcion_giro || 'Giro registrado'}
                              </p>
                            </div>
                          </div>

                          <div className={styles.filaDerecha}>
                            <span className={`${styles.badgeEstatus} ${badgeClase}`}>{est}</span>
                            <button
                              type="button"
                              className={styles.btnRevisar}
                              onClick={() => router.push(`/admin/revisionMipyme/${emp.id_mipyme}`)}
                            >
                              Revisar →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* =============================================================== */}
            {/* TAB 2: LISTA HORIZONTAL COMPACTA DE REPORTES                    */}
            {/* =============================================================== */}
            {tabActiva === 'reportes' && (
              <>
                <div className={styles.barraFiltros}>
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                    Denuncias enviadas por consultores
                  </span>
                  <select
                    className={styles.selectFiltro}
                    value={filtroEstadoReporte}
                    onChange={(e) => setFiltroEstadoReporte(e.target.value)}
                  >
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="ACEPTADO">Aceptados (En Lista Negra)</option>
                    <option value="TODOS">Todos</option>
                  </select>
                </div>

                {reportesFiltrados.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                    No hay reportes en esta categoría.
                  </p>
                ) : (
                  <div className={styles.listaHorizontal}>
                    {reportesFiltrados.map((rep) => (
                      <div key={rep.id_reporte} className={styles.filaHorizontal}>
                        <div className={styles.filaIzquierda}>
                          <div>
                            <strong style={{ color: '#0f172a', fontSize: '0.96rem' }}>
                              #{rep.id_reporte} — {rep.nombre_comercial || 'MiPyME'}
                            </strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.83rem', color: '#64748b' }}>
                              Motivo: {rep.motivo} • Por @{rep.consultor_usuario || 'consultor'}{' '}
                              {rep.fecha_reporte
                                ? `• ${new Date(rep.fecha_reporte).toLocaleDateString('es-MX')}`
                                : ''}
                            </p>
                          </div>
                        </div>

                        <div className={styles.filaDerecha}>
                          <span
                            className={`${styles.badgeEstatus} ${
                              rep.estado === 'ACEPTADO' ? styles.stRechazada : styles.stPendiente
                            }`}
                          >
                            {rep.estado}
                          </span>
                          <button
                            type="button"
                            className={styles.btnRevisar}
                            onClick={() => router.push(`/admin/reportes/${rep.id_reporte}`)}
                          >
                            Revisar →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* =============================================================== */}
            {/* TAB 3: LISTADO NEGRO DE WORKGUARD                               */}
            {/* =============================================================== */}
            {tabActiva === 'listaWorkguard' && (
              <div className={styles.cardSolicitud}>
                <div className={styles.barraFiltros} style={{ marginBottom: '16px' }}>
                  <input
                    type="text"
                    className={styles.inputBusqueda}
                    placeholder="Buscar empresa sancionada o motivo..."
                    value={busquedaWg}
                    onChange={(e) => setBusquedaWg(e.target.value)}
                  />
                  <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    {negroWgFiltrado.length} empresa(s) sancionadas
                  </span>
                </div>

                {negroWgFiltrado.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                    No hay empresas sancionadas actualmente en el Listado Negro de WorkGuard.
                  </p>
                ) : (
                  <div className={styles.listaHorizontal}>
                    {negroWgFiltrado.map((item) => (
                      <div key={item.id_mipyme} className={styles.filaHorizontal}>
                        <div className={styles.filaIzquierda}>
                          <div>
                            <strong style={{ color: '#991b1b', fontSize: '0.98rem' }}>
                              #{item.id_mipyme} — {item.nombre_comercial}
                            </strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.83rem', color: '#475569' }}>
                              {item.motivo_lista_negra}
                            </p>
                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                              {item.fecha_revision
                                ? new Date(item.fecha_revision).toLocaleDateString('es-MX')
                                : ''}
                            </span>
                          </div>
                        </div>
                        <div className={styles.filaDerecha}>
                          <span className={`${styles.badgeEstatus} ${styles.stRechazada}`}>
                            SANCIONADA
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
 {/* =============================================================== */}
            {/* TAB 4: PADRÓN OFICIAL SAT EFOS (ART. 69-B) EN 2 COLUMNAS        */}
            {/* =============================================================== */}
            {tabActiva === 'listaEfos' && (
              <>
                <div className={styles.barraFiltros}>
                  <input
                    type="text"
                    className={styles.inputBusqueda}
                    style={{ flex: 1 }}
                    placeholder="Buscar por RFC o Razón Social en los 12,203 registros del SAT..."
                    value={busquedaEfos}
                    onChange={(e) => filtrarEfosSat(e.target.value)}
                  />
                  <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>
                    Mostrando {listaNegraSat.length} de {totalEfosSat.toLocaleString('es-MX')} registros
                  </span>
                </div>

                {cargandoEfos ? (
                  <p style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Buscando en el padrón oficial del SAT...
                  </p>
                ) : listaNegraSat.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                    No se encontraron contribuyentes con ese criterio en el padrón EFOS.
                  </p>
                ) : (
                  <div className={styles.gridDosColumnas}>
                    {listaNegraSat.map((efos) => (
                      <div key={efos.rfc} className={styles.filaHorizontal}>
                        <div className={styles.filaIzquierda}>
                          <div>
                            <strong style={{ color: '#0f172a', fontSize: '0.96rem' }}>
                              {efos.rfc}
                            </strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: '#475569' }}>
                              {efos.nombre_contribuyente}
                            </p>
                          </div>
                        </div>

                        <div className={styles.filaDerecha}>
                          <span className={`${styles.badgeEstatus} ${styles.stRechazada}`}>
                            {efos.situacion}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function PanelAdmin() {
  return (
    <Ruta rolPermitido="admin">
      <ContenidoPanelAdmin />
    </Ruta>
  );
}