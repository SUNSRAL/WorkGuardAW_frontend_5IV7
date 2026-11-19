import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RutaProtegida from '../../components/RutaProtegida';
import styles from '../../styles/CentroReportes.module.css';
import Image from 'next/image';


export default function CentroReportes() {
  const router = useRouter();
  const [reportes, setReportes] = useState([]);
  const [totalNuevos, setTotalNuevos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /* ── Carga de reportes ── */
  useEffect(() => {
    async function cargarReportes() {
      try {
        // 1. Ruta unificada del backend
        const res = await fetch(`${API_URL}/api/reportes`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Error al cargar los reportes');
        const datos = await res.json();
        setReportes(datos.reportes || []);
        // 2. El backend devuelve "nuevos"
        setTotalNuevos(datos.nuevos || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargarReportes();
  }, [API_URL]);

  /* ── Cerrar sesión ── */
  const cerrarSesion = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  };

  /* ── URL de foto de perfil ── */
  const getFotoUrl = (foto_perfil) => {
    if (!foto_perfil) return '/img/perfil.png';
    if (foto_perfil.startsWith('http')) return foto_perfil;
    return foto_perfil.startsWith('/') ? foto_perfil : `/${foto_perfil}`;
  };

  /* ── Etiqueta legible del motivo ── */
  const getMotivo = (motivo, otro_motivo) => {
    const etiquetas = {
      COBRO_POR_CONTRATACION: 'Cobro por contratación',
      OFERTA_FALSA: 'Oferta falsa',
      SUPLANTACION_DE_IDENTIDAD: 'Suplantación de identidad',
      CONDICIONES_ABUSIVAS: 'Condiciones abusivas',
      EMPRESA_INEXISTENTE: 'Empresa inexistente',
      DOCUMENTOS_FALSOS: 'Documentos falsos',
      INCUMPLIMIENTO_LABORAL: 'Incumplimiento laboral',
      SAT_NEGATIVO: 'Estado SAT negativo',
      OTRO: otro_motivo || 'Otro motivo',
    };
    return etiquetas[motivo] || motivo;
  };

  /* ── Clase del dot según estado ── */
  const getDotClass = (estado) => {
    if (estado === 'PENDIENTE') return styles.dotPendiente;
    if (estado === 'ACEPTADO') return styles.dotRevisado;
    return styles.dotDefault;
  };

  /* ── Render ── */
  return (
    // 3. Rol exacto que devuelve el backend ("administrador")
    <RutaProtegida rolPermitido="administrador">
      <div className={styles.pageWrapper}>

        {/* ════════ HEADER ════════ */}
        <header className={styles.header}>
          <div className={styles.headerBrand}>
            <Image src="/img/logo.png" alt="Logo WorkGuard" width={42} height={42} />
            <div className={styles.headerLeft}>
              <span className={styles.adminLabel}>ADMIN GLOBAL</span>
              <h2 className={styles.panelTitle}>Panel de Control</h2>
            </div>
          </div>
          <button className={styles.btnCerrarSesion} onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        </header>

        {/* ════════ MAIN ════════ */}
        <main className={styles.main}>
          <div className={styles.container}>

            {/* Título + badge + botón lista negra */}
            <div className={styles.headerSection}>
              <div>
                <h1 className={styles.titulo}>Centro de Reportes</h1>
                <span className={styles.badgeNuevos}>{totalNuevos} Nuevos</span>
              </div>
              <button
                className={styles.btnListaNegra}
                onClick={() => router.push('/ADMIN/listadoNegro')}
              >
                Ver lista negra
              </button>
            </div>

            {/* Estados */}
            {cargando && (
              <p className={styles.mensajeEstado}>Cargando reportes...</p>
            )}
            {error && (
              <p className={styles.mensajeError}>⚠ {error}</p>
            )}
            {!cargando && !error && reportes.length === 0 && (
              <p className={styles.mensajeEstado}>No hay reportes registrados aún.</p>
            )}

            {/* Lista de tarjetas */}
            <div className={styles.reportList}>
              {reportes.map((reporte) => (
                <div key={reporte.id_reporte} className={styles.reportCard}>

                  {/* Cabecera: avatar + nombre + dot */}
                  <div className={styles.cardTop}>
                    <div className={styles.userInfo}>
                      {/* 4. Nombres de propiedades exactos de reporte_module.js */}
                      <img
                        src={getFotoUrl(reporte.consultor_foto)}
                        alt={reporte.consultor_usuario}
                        className={styles.avatar}
                        onError={(e) => { e.target.src = '/img/perfil.png'; }}
                      />
                      <span className={styles.username}>{reporte.consultor_usuario}</span>
                    </div>
                    <span
                      className={`${styles.statusDot} ${getDotClass(reporte.estado)}`}
                      title={reporte.estado}
                    />
                  </div>

                  {/* Cuerpo: empresa + descripción + botón */}
                  <div className={styles.cardBody}>
                    <span className={styles.companyTag}>
                      🏢{' '}
                      {reporte.nombre_comercial
                        ? `Empresa: ${reporte.nombre_comercial}`
                        : `Empresa ID: ${reporte.id_mipyme}`}
                    </span>
                    <p className={styles.reportText}>
                      <strong>{getMotivo(reporte.motivo, reporte.otro_motivo)}</strong>
                      {' — '}
                      {reporte.descripcion?.length > 130
                        ? `${reporte.descripcion.substring(0, 130)}...`
                        : reporte.descripcion}
                    </p>
                    <button
                      className={styles.btnDetalle}
                      onClick={() => router.push(`/ADMIN/reportes/${reporte.id_reporte}`)}

                    >
                      Revisar Detalle &gt;
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </main>

      </div>
    </RutaProtegida>
  );
}
