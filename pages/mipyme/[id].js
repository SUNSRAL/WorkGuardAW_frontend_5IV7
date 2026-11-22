import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '../../utils/api.js';
import {
    ArrowLeft, ShieldCheck, CheckCircle2, Briefcase,
    FileText, MapPin, ExternalLink, Building2,
    ChevronLeft, ChevronRight, Star, AlertTriangle,
    ThumbsUp, Send, MessageSquare
} from 'lucide-react';
import RutaProtegida from '../../components/RutaProtegida';
import styles from '../../styles/TarjetaDetalla.module.css';

export default function TarjetaDetallada() {
    const router = useRouter();
    const { id } = router.query; // Lee ?id=1 (o [id] si lo usas como ruta dinámica)

    const [empresa, setEmpresa] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estados de interacción visual
    const [fotoIdx, setFotoIdx] = useState(0);
    const [favorito, setFavorito] = useState(false);
    const [ordenComentarios, setOrdenComentarios] = useState('recent');
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [comentarios, setComentarios] = useState([
        {
            id: 1,
            autor: 'Consultor Verificado',
            iniciales: 'CV',
            tiempo: 'Hace 2 días',
            texto: 'Proceso de contratación claro y sin cobros indebidos.',
            likes: 4,
            liked: false
        }
    ]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    /* ── Cargar datos reales de la MiPyME desde tu backend ── */
    useEffect(() => {
        if (!router.isReady) return;
        const idMipyme = id || 1; // Si entran sin ?id=, carga la 1 por defecto

        async function cargarEmpresa() {
            try {
                const datos = await apiFetch(`/api/mipymes/${idMipyme}`);
                setEmpresa(datos);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        }
        cargarEmpresa();
    }, [router.isReady, id, API_URL]);

    // Fotos de respaldo mientras agregan galería en Supabase
    const fotos = empresa?.fotos?.length
        ? empresa.fotos
        : ['/img/empresa-default.jpg', '/img/fondo.png'];

    const cambiarFoto = (direccion) => {
        setFotoIdx((prev) => (prev + direccion + fotos.length) % fotos.length);
    };

    /* ── Manejo de comentarios en pantalla ── */
    const publicarComentario = (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        setComentarios((prev) => [
            {
                id: Date.now(),
                autor: 'Tú',
                iniciales: 'TÚ',
                tiempo: 'Ahora mismo',
                texto: nuevoComentario.trim(),
                likes: 0,
                liked: false
            },
            ...prev
        ]);
        setNuevoComentario('');
    };

    const toggleLike = (idComentario) => {
        setComentarios((prev) =>
            prev.map((c) =>
                c.id === idComentario
                    ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
                    : c
            )
        );
    };

    const comentariosOrdenados = [...comentarios].sort((a, b) =>
        ordenComentarios === 'likes' ? b.likes - a.likes : b.id - a.id
    );

    // Extraer datos anidados que devuelve mipyme_module.js
    const giro = empresa?.existencia_fiscal?.[0]?.catalogo_giro?.opcion_giro || 'Giro no especificado';
    const tamano = empresa?.catalogo_tamano?.opcion_tamano_empresa || 'Tamaño no registrado';
    const rfc = empresa?.existencia_fiscal?.[0]?.rfc || 'Sin RFC público';

    return (
        <RutaProtegida rolPermitido="consultor">
            <div className={styles.pageWrapper}>
                {/* ── NAVBAR ── */}
                <header className={styles.navbar}>
                    <div className={styles.navLeft}>
                        <button className={styles.btnRegresar} onClick={() => router.back()}>
                            <ArrowLeft size={16} /> Volver
                        </button>
                        <div className={styles.brand}>
                            <ShieldCheck size={22} color="#D4A359" />
                            Work<span>Guard</span>
                        </div>
                    </div>

                    <nav className={styles.navRight}>
                        <button onClick={() => router.push('/consultor')} className={styles.navItem}>
                            Explorar
                        </button>
                        <button onClick={() => router.push('/consultor/cuenta')} className={styles.navItem}>
                            Mi Cuenta
                        </button>
                    </nav>
                </header>

                {/* ── WORKSPACE ── */}
                <main className={styles.workspace}>
                    {cargando && <p className={styles.estadoTexto}>Cargando ficha de la empresa...</p>}
                    {error && <p className={styles.errorTexto}>⚠ {error}</p>}

                    {!cargando && empresa && (
                        <>
                            {/* ── COLUMNA IZQUIERDA: FICHA DE LA EMPRESA ── */}
                            <section className={styles.cartaEmpresa}>
                                <div className={styles.cajaFotos}>
                                    <img
                                        src={fotos[fotoIdx]}
                                        alt={empresa.nombre_comercial}
                                        onError={(e) => { e.target.src = '/img/fondo.png'; }}
                                    />
                                    <div className={styles.fotosGradient} />

                                    <div className={styles.fotosControls}>
                                        <button className={styles.circuloBtnFotos} onClick={() => cambiarFoto(-1)}>
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button className={styles.circuloBtnFotos} onClick={() => cambiarFoto(1)}>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    <div className={styles.floatingThumbs}>
                                        {fotos.map((url, idx) => (
                                            <div
                                                key={idx}
                                                className={`${styles.miniThumb} ${idx === fotoIdx ? styles.activeThumb : ''}`}
                                                onClick={() => setFotoIdx(idx)}
                                            >
                                                <img src={url} alt={`Vista ${idx + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cabecera con título y acciones */}
                                <div className={styles.sheetHeader}>
                                    <div>
                                        <h1 className={styles.tituloEmpresa}>{empresa.nombre_comercial}</h1>
                                        <div className={styles.badgesRow}>
                                            <span className={`${styles.badge} ${styles.cajaVerificado}`}>
                                                <CheckCircle2 size={13} /> Empresa Registrada
                                            </span>
                                            <span className={`${styles.badge} ${styles.cajaCategoria}`}>
                                                <Briefcase size={13} /> {giro}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.headerActions}>
                                        <button
                                            className={`${styles.btnFavs} ${favorito ? styles.activeFav : ''}`}
                                            onClick={() => setFavorito(!favorito)}
                                        >
                                            <Star size={15} fill={favorito ? '#D4A359' : 'none'} />
                                            {favorito ? 'Guardado' : 'Guardar'}
                                        </button>

                                        <button
                                            className={styles.btnReportar}
                                            onClick={() => router.push(`/consultor/reportar?id_mipyme=${empresa.id_mipyme}`)}
                                        >
                                            <AlertTriangle size={14} /> Reportar
                                        </button>
                                    </div>
                                </div>

                                {/* Cuerpo de detalles */}
                                <div className={styles.cartaBody}>
                                    <div className={styles.cajaDescripcion}>
                                        <div className={styles.blockLabel}>
                                            <FileText size={14} /> Información Fiscal y Operativa
                                        </div>
                                        <p className={styles.descripcionTexto}>
                                            <strong>Tipo de persona:</strong> {empresa.tipo_persona || 'No especificado'} •{' '}
                                            <strong>RFC:</strong> {rfc} •{' '}
                                            <strong>Tamaño:</strong> {tamano} ({empresa.numero_trabajadores ?? 0} trabajadores).
                                        </p>
                                    </div>

                                    <div className={styles.detallesGrid}>
                                        <div className={styles.detallesCard}>
                                            <div>
                                                <div className={styles.blockLabel}>
                                                    <MapPin size={14} /> Búsqueda de Ubicación
                                                </div>
                                                <p className={styles.detallesValue}>{empresa.nombre_comercial}</p>
                                            </div>
                                            <a
                                                href={`https://google.com{encodeURIComponent(empresa.nombre_comercial)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={styles.btnGoogleMaps}
                                            >
                                                Buscar en Google Maps <ExternalLink size={13} />
                                            </a>
                                        </div>

                                        <div className={styles.detallesCard}>
                                            <div>
                                                <div className={styles.blockLabel}>
                                                    <Building2 size={14} /> Presencia Digital
                                                </div>
                                                <p className={styles.detallesValue}>
                                                    {empresa.actividad?.[0]?.pagina_web || 'Sin sitio web registrado'}
                                                </p>
                                            </div>
                                            <span className={styles.estadoActivo}>● Perfil activo en WorkGuard</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/* ── COLUMNA DERECHA: COMENTARIOS ── */}
                            <aside className={styles.columnaComentarios}>
                                <div className={styles.encabezadoComentarios}>
                                    <h2 className={styles.tituloComentarios}>
                                        <MessageSquare size={17} color="#D4A359" />
                                        Opiniones <span className={styles.badgeCount}>{comentarios.length}</span>
                                    </h2>
                                    <div className={styles.filtrosComentarios}>
                                        <button
                                            type="button"
                                            className={`${styles.botonFiltro} ${ordenComentarios === 'recent' ? styles.activeFiltro : ''}`}
                                            onClick={() => setOrdenComentarios('recent')}
                                        >
                                            Recientes
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.botonFiltro} ${ordenComentarios === 'likes' ? styles.activeFiltro : ''}`}
                                            onClick={() => setOrdenComentarios('likes')}
                                        >
                                            Más útiles
                                        </button>
                                    </div>
                                </div>

                                <p className={styles.disclaimerNote}>
                                    Comparte tu experiencia real sobre los procesos de selección de esta empresa.
                                </p>

                                <div className={styles.scrollComentarios}>
                                    {comentariosOrdenados.map((c) => (
                                        <div key={c.id} className={styles.comentarioItem}>
                                            <div className={styles.comentarioHead}>
                                                <div className={styles.usuarioInfo}>
                                                    <div className={styles.miniAvatar}>{c.iniciales}</div>
                                                    <span className={styles.usuarioName}>{c.autor}</span>
                                                </div>
                                                <span className={styles.comentarioTiempo}>{c.tiempo}</span>
                                            </div>
                                            <p className={styles.comentarioBody}>{c.texto}</p>
                                            <button
                                                type="button"
                                                className={`${styles.likeBtn} ${c.liked ? styles.activeLike : ''}`}
                                                onClick={() => toggleLike(c.id)}
                                            >
                                                <ThumbsUp size={12} /> Útil ({c.likes})
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={publicarComentario} className={styles.comentarioComposer}>
                                    <input
                                        type="text"
                                        placeholder="Escribe una reseña sobre esta empresa..."
                                        value={nuevoComentario}
                                        onChange={(e) => setNuevoComentario(e.target.value)}
                                    />
                                    <button type="submit" className={styles.btnPublicar} title="Publicar">
                                        <Send size={16} />
                                    </button>
                                </form>
                            </aside>
                        </>
                    )}
                </main>
            </div>
        </RutaProtegida>
    );
}

