import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../../utils/api.js";
import {
  Search,
  Building2,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  User,
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
        {/* ════════ BARRA DE NAVEGACIÓN ════════ */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.brandTitleGroup}>
              <span className={styles.roleLabel}>PORTAL CONSULTOR</span>
              <h2 className={styles.panelTitle}>Explorador de empresas</h2>
            </div>

            <div className={styles.navSearchFilters}>
              <div className={styles.navSearchBox}>
                <Search size={15} className={styles.navSearchIcon} />
                <input
                  type="text"
                  placeholder="Buscar por nombre comercial o RFC..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={styles.navSearchInput}
                />
              </div>

              <div className={styles.navSelectWrapper}>
                <Filter size={13} className={styles.navSelectIcon} />
                <select
                  value={filtroGiro}
                  onChange={(e) => setFiltroGiro(e.target.value)}
                  className={styles.navSelect}
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
                className={styles.navSelect}
              >
                {opcionesTamano.map((t) => (
                  <option key={t} value={t}>
                    {t === "TODOS" ? "Todos los tamaños" : t}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.navRightActions}>
              <button
                className={styles.btnListaNegra}
                onClick={() => router.push("/admin/listadoNegro")}
              >
                <ShieldAlert size={15} />
                <span>Ver Lista Negra</span>
              </button>

              <button
                className={styles.btnProfileIcon}
                onClick={() => router.push("/consultor/cuenta")}
                title="Perfil"
                aria-label="Perfil"
              >
                <User size={17} />
              </button>
            </div>
          </div>
        </header>

        {/* ════════ MAIN ════════ */}
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.titulo}>Directorio de MiPyMEs</h1>
                <p className={styles.subtituloTexto}>
                  Consulta el perfil fiscal y operativo antes de postularte o
                  emitir un reporte.
                </p>
              </div>

              {!cargando && !error && (
                <span className={styles.resultCount}>
                  Mostrando <strong>{empresasFiltradas.length}</strong> de{" "}
                  {empresas.length} empresas
                </span>
              )}
            </div>

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

                return (
                  <article
                    key={emp.id_mipyme}
                    className={styles.companyCard}
                    onClick={() => router.push(`/mipyme/${emp.id_mipyme}`)}
                  >
                    {/* Espacio superior reservado para la imagen */}
                    <div className={styles.cardImageSpace}></div>

                    <div className={styles.cardContent}>
                      <span className={styles.giroTag}>{giro}</span>

                      <h3 className={styles.companyName}>
                        {emp.nombre_comercial}
                      </h3>

                      <div className={styles.cardSpecs}>
                        <span className={styles.specItem}>
                          <Building2 size={13} /> {tamano}
                        </span>
                        <span className={styles.specDivider}>•</span>
                        <span className={styles.specItem}>
                          <Users size={13} /> {emp.numero_trabajadores ?? 0}{" "}
                          emp.
                        </span>
                      </div>

                      <div className={styles.cardFooter}>
                        <span className={styles.verDetalleLink}>
                          Ver ficha completa <ArrowUpRight size={14} />
                        </span>
                      </div>
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