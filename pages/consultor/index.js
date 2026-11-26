import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { apiFetch } from "../../utils/api.js";
import {
  Search,
  Building2,
  Users,
  ShieldAlert,
  ArrowRight,
  Filter,
} from "lucide-react";
import RutaProtegida from "../../components/RutaProtegida";
import Footer from "../../components/footerlinks";
import styles from "../../styles/IndexConsultor.module.css";

export default function IndexConsultor() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroGiro, setFiltroGiro] = useState("TODOS");
  const [filtroTamano, setFiltroTamano] = useState("TODOS");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  /* ── Cargar todas las MiPyMEs ── */
  useEffect(() => {
    async function cargarEmpresas() {
      try {
        const datos = await apiFetch("/api/mipymes");
        setEmpresas(Array.isArray(datos) ? datos : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargarEmpresas();
  }, [API_URL]);

<<<<<<< HEAD
  /* ── bton perfil── */
  const Perfil = async () => {
  
=======
  /* ── Cerrar sesión ── */
  const cerrarSesion = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
>>>>>>> e41275eea019cacc197f4ae6dc419d8e20e6d7f6
  };

  /* ── Extraer listas únicas para los selectores de filtro ── */
  const opcionesGiro = useMemo(() => {
    const setGiros = new Set();
    empresas.forEach((e) => {
      const g = e.existencia_fiscal?.catalogo_giro?.opcion_giro;
      if (g) setGiros.add(g);
    });
    return ["TODOS", ...Array.from(setGiros)];
  }, [empresas]);

  const opcionesTamano = useMemo(() => {
    const setTamanos = new Set();
    empresas.forEach((e) => {
      const t = e.catalogo_tamano?.opcion_tamano_empresa;
      if (t) setTamanos.add(t);
    });
    return ["TODOS", ...Array.from(setTamanos)];
  }, [empresas]);

  /* ── Filtrar empresas en tiempo real ── */
  const empresasFiltradas = useMemo(() => {
    return empresas.filter((emp) => {
      const nombre = (emp.nombre_comercial || "").toLowerCase();
      const rfc = (emp.existencia_fiscal?.rfc || "").toLowerCase();
      const termino = busqueda.toLowerCase().trim();

      const coincideTexto =
        !termino || nombre.includes(termino) || rfc.includes(termino);

      const giroEmp = emp.existencia_fiscal?.catalogo_giro?.opcion_giro || "";
      const coincideGiro = filtroGiro === "TODOS" || giroEmp === filtroGiro;

      const tamanoEmp = emp.catalogo_tamano?.opcion_tamano_empresa || "";
      const coincideTamano =
        filtroTamano === "TODOS" || tamanoEmp === filtroTamano;

      return coincideTexto && coincideGiro && coincideTamano;
    });
  }, [empresas, busqueda, filtroGiro, filtroTamano]);

  return (
    <RutaProtegida rolPermitido="consultor">
      <div className={styles.pageWrapper}>
        {/* ════════ HEADER FLAT ════════ */}
        <header className={styles.header}>
          <div className={styles.headerBrand}>
            <Image
              src="/img/logo.png"
              alt="Logo WorkGuard"
              width={40}
              height={40}
            />
            <div className={styles.headerLeft}>
              <span className={styles.roleLabel}>PORTAL CONSULTOR</span>
              <h2 className={styles.panelTitle}>Explorador de Empresas</h2>
            </div>
          </div>

          <nav className={styles.navActions}>
          
            <button className={styles.btnPerfil}
            onClick={() => router.push("/consultor/cuenta")}>
              Perfil
            </button>
          </nav>
        </header>

        {/* ════════ MAIN ════════ */}
        <main className={styles.main}>
          <div className={styles.container}>
            {/* Encabezado de sección + acceso a Lista Negra */}
            <div className={styles.headerSection}>
              <div>
                <h1 className={styles.titulo}>Directorio de MiPyMEs</h1>
                <p className={styles.subtituloTexto}>
                  Consulta el perfil fiscal y operativo antes de postularte o
                  emitir un reporte.
                </p>
              </div>
              <button
                className={styles.btnListaNegra}
                onClick={() => router.push("/admin/listadoNegro")}
              >
                <ShieldAlert size={16} /> Ver Lista Negra
              </button>
            </div>

            {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
            <section className={styles.filterBar}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar por nombre comercial o RFC..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.selectGroup}>
                <div className={styles.selectWrapper}>
                  <Filter size={14} className={styles.selectIcon} />
                  <select
                    value={filtroGiro}
                    onChange={(e) => setFiltroGiro(e.target.value)}
                    className={styles.select}
                  >
                    {opcionesGiro.map((g) => (
                      <option key={g} value={g}>
                        {g === "TODOS" ? "Todos los giros" : g}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={filtroTamano}
                  onChange={(e) => setFiltroTamano(e.target.value)}
                  className={styles.select}
                >
                  {opcionesTamano.map((t) => (
                    <option key={t} value={t}>
                      {t === "TODOS" ? "Todos los tamaños" : t}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Contador de resultados */}
            {!cargando && !error && (
              <p className={styles.resultCount}>
                Mostrando <strong>{empresasFiltradas.length}</strong> de{" "}
                {empresas.length} empresas
              </p>
            )}

            {/* Estados de carga/error */}
            {cargando && (
              <p className={styles.mensajeEstado}>
                Cargando directorio de empresas...
              </p>
            )}
            {error && <p className={styles.mensajeError}>⚠ {error}</p>}
            {!cargando && !error && empresasFiltradas.length === 0 && (
              <p className={styles.mensajeEstado}>
                No se encontraron empresas con esos filtros.
              </p>
            )}

            {/* ── GRID DE TARJETAS DE MIPYMES ── */}
            <div className={styles.cardsGrid}>
              {empresasFiltradas.map((emp) => {
                const giro =
                  emp.existencia_fiscal?.catalogo_giro?.opcion_giro ||
                  "Giro general";
                const tamano =
                  emp.catalogo_tamano?.opcion_tamano_empresa || "MiPyME";
                const rfc = emp.existencia_fiscal?.rfc || "Sin RFC";

                return (
                  <article
                    key={emp.id_mipyme}
                    className={styles.companyCard}
                    onClick={() => router.push(`/mipyme/${emp.id_mipyme}`)}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.giroBadge}>{giro}</span>
                      <span className={styles.idTag}>#{emp.id_mipyme}</span>
                    </div>

                    <h3 className={styles.companyName}>
                      {emp.nombre_comercial}
                    </h3>
                    <p className={styles.rfcText}>RFC: {rfc}</p>

                    <div className={styles.metaRow}>
                      <span className={styles.metaItem}>
                        <Building2 size={14} /> {tamano}
                      </span>
                      <span className={styles.metaItem}>
                        <Users size={14} /> {emp.numero_trabajadores ?? 0} emp.
                      </span>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.verDetalleLink}>
                        Ver ficha completa <ArrowRight size={15} />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </RutaProtegida>
  );
}
