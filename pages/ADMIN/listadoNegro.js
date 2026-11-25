import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RutaProtegida from '../../components/RutaProtegida';
import styles from '../../styles/CentroReportes.module.css';

export default function ListadoNegro() {
  const router = useRouter();
  const [listado, setListado] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Se ejecuta una sola vez al cargar la página.
  // Llama al endpoint GET /api/lista-negra que ya existe en tu backend.
  useEffect(() => {
    async function cargarListadoNegro() {
      try {
        const res = await fetch(`${API_URL}/api/lista-negra`, {
          credentials: 'include', // necesario porque usas sesiones con cookies
        });
        if (!res.ok) throw new Error('Error al cargar el listado negro');
        const datos = await res.json();
        // tu backend devuelve { empresas: [...] }
        setListado(datos.empresas);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargarListadoNegro();
  }, [API_URL]);

  const cerrarSesion = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  };

  // Convierte "2024-01-15T..." al formato "15 de enero de 2024"
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Sin fecha';
    return new Date(fechaISO).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <RutaProtegida rolPermitido="admin">
      <div className={styles.pageWrapper}>

        {/* ════════ HEADER ════════ */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.adminLabel}>ADMIN GLOBAL</span>
            <h2 className={styles.panelTitle}>Panel de Control</h2>
          </div>
          <button className={styles.btnCerrarSesion} onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        </header>

        {/* ════════ MAIN ════════ */}
        <main className={styles.main}>
          <div className={styles.container}>

            {/* Título + conteo + botón regresar */}
            <div className={styles.headerSection}>
              <div>
                <h1 className={styles.titulo}>Lista Negra de MIPyMES</h1>
                <span className={styles.badgeNuevos}>
                  {listado.length} {listado.length === 1 ? 'empresa' : 'empresas'}
                </span>
              </div>
              <button
                className={styles.btnRegresar}
                onClick={() => router.push('/ADMIN/indexAdmin')}
              >
                ← Regresar a reportes
              </button>
            </div>

            {/* Estados de carga */}
            {cargando && (
              <p className={styles.mensajeEstado}>Cargando lista negra...</p>
            )}
            {error && (
              <p className={styles.mensajeError}>⚠ {error}</p>
            )}
            {!cargando && !error && listado.length === 0 && (
              <p className={styles.mensajeEstado}>No hay empresas en lista negra.</p>
            )}

            {/* Tarjetas */}
            <div className={styles.reportList}>
              {listado.map((empresa) => (
                <div key={empresa.id_mipyme} className={styles.reportCard}>

                  {/* Fila superior: ícono + nombre de empresa */}
                  <div className={styles.cardTop}>
                    <div className={styles.userInfo}>
                      <div className={styles.empresaIcono}>🏢</div>
                      <span className={styles.username}>
                        {empresa.nombre_comercial ?? `Empresa ID: ${empresa.id_mipyme}`}
                      </span>
                    </div>
                    {/* Badge fijo "Lista Negra" */}
                    <span className={styles.badgeListaNegra}>Lista Negra</span>
                  </div>

                  {/* Cuerpo: motivo + fecha */}
                  <div className={styles.cardBody}>
                    <p className={styles.reportText}>
                      <strong>Motivo:</strong>{' '}
                      {empresa.motivo_lista_negra ?? 'Sin motivo registrado'}
                    </p>
                    <span className={styles.companyTag}>
                      📅 Incluida el {formatearFecha(empresa.fecha_revision)}
                    </span>
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