import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/RegistroMipyme.module.css';
import { apiFetch } from '../../utils/api';

const PASOS_WIZARD = [
  { num: 1, titulo: 'Existencia Fiscal', desc: 'RFC, SAT y Constancia' },
  { num: 2, titulo: 'Actividad y Ubicación', desc: 'Mapa y Comprobante' },
  { num: 3, titulo: 'Representante Legal', desc: 'Identidad y CURP' },
  { num: 4, titulo: 'Cumplimiento y Tamaño', desc: 'DOF y Opinión 32-D' },
  { num: 5, titulo: 'Credenciales de Acceso', desc: 'Activación Sello WorkGuard' }
];

export default function RegistroMipyme() {
  const router = useRouter();

  // Paso actual del asistente (1 a 5)
  const [pasoActual, setPasoActual] = useState(1);

  // Catálogos traídos desde el backend (/api/mipymes/catalogos)
  const [catalogos, setCatalogos] = useState({
    giros: [],
    alcaldias_fiscal: [],
    entidades_fiscal: [],
    alcaldias_operaciones: [],
    entidades_operaciones: [],
    tamanos: []
  });

  // Estado general del formulario
  const [form, setForm] = useState({
    // Paso 1: Existencia Fiscal
    tipo_persona: 'MORAL',
    nombre_comercial: '',
    rfc: '',
    id_giro: '',
    cp_fiscal: '',
    calle_fiscal: '',
    numero_fiscal: '',
    id_alcaldia_fiscal: '',
    id_entidad_federativa_fiscal: '',

    // Paso 2: Actividad y Ubicación
    mismo_domicilio: false,
    cp_operaciones: '',
    calle_operaciones: '',
    numero_operaciones: '',
    id_alcaldia_operaciones: '',
    id_entidad_federativa_operaciones: '',
    pagina_web: '',
    facebook: '',
    instagram: '',
    twitter: '',

    // Paso 3: Representante Legal / Titular
    nombre_completo: '',
    curp: '',

    // Paso 4: Cumplimiento y Tamaño
    numero_trabajadores: '',

    // Paso 5: Credenciales
    usuario: '',
    contrasena: '',
    confirmar_contrasena: ''
  });

  // Archivos PDF en memoria (nunca se suben hasta evaluar cada paso)
  const [archivos, setArchivos] = useState({
    doc_csf: null,
    doc_comprobante: null,
    doc_curp: null,
    doc_opinion_32d: null
  });

  // Geolocalización y Mapa (Paso 2)
  const [coordenadas, setCoordenadas] = useState(null); // { lat, lon, display_name }
  const [geolocalizado, setGeolocalizado] = useState(false);
  const [buscandoMapa, setBuscandoMapa] = useState(false);

  // Resultados de validación de cada paso
  const [resultadosPasos, setResultadosPasos] = useState({});
  const [validadoDenue, setValidadoDenue] = useState(false);
  const [tamanoCalculado, setTamanoCalculado] = useState('');
  const [idTamanoCalculado, setIdTamanoCalculado] = useState(null);

  // Estados de interfaz, alertas y bloqueo
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null); // { tipo: 'VERDE' | 'NARANJA' | 'ROJO', mensaje: '' }
  const [bloqueado, setBloqueado] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  // Cargar catálogos al abrir la página
  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const data = await apiFetch('/api/mipymes/catalogos');
        setCatalogos(data);

        // Preseleccionar primera entidad federativa si existe
        setForm((prev) => ({
          ...prev,
          id_entidad_federativa_fiscal: data.entidades_fiscal?.[0]?.id_entidad_federativa_fiscal || '',
          id_entidad_federativa_operaciones: data.entidades_operaciones?.[0]?.id_entidad_federativa_operaciones || ''
        }));
      } catch (err) {
        setAlerta({
          tipo: 'NARANJA',
          mensaje: err.message || 'No se pudieron cargar los catálogos del servidor. Recarga la página.'
        });
      }
    }
    cargarCatalogos();
  }, []);

  // Actualizar campos de texto / selects
  function manejarCambio(e) {
    const { name, value, type, checked } = e.target;
    setAlerta(null);

    if (name === 'mismo_domicilio') {
      setGeolocalizado(false);
      setCoordenadas(null);
      setForm((prev) => ({
        ...prev,
        mismo_domicilio: checked,
        cp_operaciones: checked ? prev.cp_fiscal : '',
        calle_operaciones: checked ? prev.calle_fiscal : '',
        numero_operaciones: checked ? prev.numero_fiscal : ''
      }));
      return;
    }

    if (['cp_operaciones', 'calle_operaciones', 'numero_operaciones', 'id_alcaldia_operaciones'].includes(name)) {
      setGeolocalizado(false);
    }

    const valorFinal = name === 'rfc' || name === 'curp' ? value.toUpperCase() : value;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : valorFinal
    }));
  }

  // Validar y guardar archivo PDF seleccionado (máximo 5 MB)
  function manejarArchivo(e, campo) {
    const file = e.target.files?.[0];
    setAlerta(null);

    if (!file) {
      setArchivos((prev) => ({ ...prev, [campo]: null }));
      return;
    }

    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setAlerta({ tipo: 'NARANJA', mensaje: 'Únicamente se aceptan documentos oficiales en formato PDF.' });
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAlerta({ tipo: 'NARANJA', mensaje: 'El archivo PDF no debe superar los 5 MB.' });
      e.target.value = '';
      return;
    }

    setArchivos((prev) => ({ ...prev, [campo]: file }));
  }

  // Ubicar domicilio de operaciones en OpenStreetMap (Nominatim)
  async function ubicarEnMapa() {
    setAlerta(null);

    if (!form.calle_operaciones.trim() || !form.numero_operaciones.trim() || !form.cp_operaciones.trim()) {
      setAlerta({
        tipo: 'NARANJA',
        mensaje: 'Ingresa Calle, Número y Código Postal del domicilio de operaciones antes de ubicar en el mapa.'
      });
      return;
    }

    const alcaldiaObj = catalogos.alcaldias_operaciones.find(
      (a) => String(a.id_alcaldia_operaciones) === String(form.id_alcaldia_operaciones)
    );
    const nombreAlcaldia = alcaldiaObj?.opcion_alcaldia || '';

    try {
      setBuscandoMapa(true);
      const query = encodeURIComponent(
        `${form.calle_operaciones} ${form.numero_operaciones}, ${form.cp_operaciones}, ${nombreAlcaldia}, Mexico`
      );
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
      const resp = await fetch(url, {
        headers: { 'Accept-Language': 'es' }
      });
      const resultados = await resp.json();

      if (!Array.isArray(resultados) || resultados.length === 0) {
        setGeolocalizado(false);
        setCoordenadas(null);
        setAlerta({
          tipo: 'NARANJA',
          mensaje: 'No encontramos ese domicilio exacto en el mapa. Verifica que la calle y el código postal estén bien escritos.'
        });
        return;
      }

      const lugar = resultados[0];
      setCoordenadas({
        lat: Number(lugar.lat),
        lon: Number(lugar.lon),
        display_name: lugar.display_name
      });
      setGeolocalizado(true);
      setAlerta({
        tipo: 'VERDE',
        mensaje: 'Domicilio localizado correctamente en el mapa.'
      });
    } catch (err) {
      setAlerta({
        tipo: 'NARANJA',
        mensaje: 'Error al consultar el servicio de mapas. Intenta nuevamente.'
      });
    } finally {
      setBuscandoMapa(false);
    }
  }

  // Evaluar cada paso (1 al 4) contra el backend antes de avanzar
  async function validarYAvanzar(e) {
    e.preventDefault();
    if (bloqueado) return;
    setAlerta(null);

    try {
      setCargando(true);
      const fd = new FormData();
      fd.append('paso', String(pasoActual));
      fd.append('rfc', form.rfc.trim());
      fd.append('nombre_comercial', form.nombre_comercial.trim());
      fd.append('tipo_persona', form.tipo_persona);

      if (pasoActual === 1) {
        fd.append('id_giro', form.id_giro);
        fd.append('cp_fiscal', form.cp_fiscal.trim());
        fd.append('calle_fiscal', form.calle_fiscal.trim());
        fd.append('numero_fiscal', form.numero_fiscal.trim());
        fd.append('id_alcaldia_fiscal', form.id_alcaldia_fiscal);
        if (archivos.doc_csf) fd.append('doc_csf', archivos.doc_csf);
      }

      if (pasoActual === 2) {
        fd.append('cp_operaciones', form.cp_operaciones.trim());
        fd.append('calle_operaciones', form.calle_operaciones.trim());
        fd.append('numero_operaciones', form.numero_operaciones.trim());
        fd.append('id_alcaldia_operaciones', form.id_alcaldia_operaciones);
        fd.append('geolocalizado', String(geolocalizado));
        if (archivos.doc_comprobante) fd.append('doc_comprobante', archivos.doc_comprobante);
      }

      if (pasoActual === 3) {
        fd.append('nombre_completo', form.nombre_completo.trim());
        fd.append('curp', form.curp.trim());
        if (archivos.doc_curp) fd.append('doc_curp', archivos.doc_curp);
      }

      if (pasoActual === 4) {
        fd.append('numero_trabajadores', String(form.numero_trabajadores));
        if (archivos.doc_opinion_32d) fd.append('doc_opinion_32d', archivos.doc_opinion_32d);
      }

      const data = await apiFetch('/api/mipymes/evaluar-paso', {
        method: 'POST',
        body: fd
      });

      setResultadosPasos((prev) => ({ ...prev, [pasoActual]: data }));
      if (pasoActual === 2) {
        setValidadoDenue(Boolean(data.validado_denue));
      }
      if (pasoActual === 4) {
        setTamanoCalculado(data.tamano_calculado || '');
        setIdTamanoCalculado(data.id_tamano || null);
      }

      setAlerta({ tipo: 'VERDE', mensaje: data.mensaje });
      setPasoActual((prev) => prev + 1);
    } catch (err) {
      const msg = err.message || 'No se pudo validar el paso.';
      const esRojo =
        msg.toLowerCase().includes('bloqueado') ||
        msg.toLowerCase().includes('efos') ||
        msg.toLowerCase().includes('listado negro') ||
        msg.toLowerCase().includes('negativo') ||
        msg.toLowerCase().includes('ya cuenta con una empresa') ||
        msg.toLowerCase().includes('ya se encuentra asociada') ||
        msg.toLowerCase().includes('límite de 3 intentos');

      if (esRojo) setBloqueado(true);

      setAlerta({
        tipo: esRojo ? 'ROJO' : 'NARANJA',
        mensaje: msg
      });
    } finally {
      setCargando(false);
    }
  }

  // Enviar registro definitivo en el Paso 5
  async function finalizarRegistro(e) {
    e.preventDefault();
    if (bloqueado) return;
    setAlerta(null);

    if (form.usuario.trim().length < 4) {
      setAlerta({ tipo: 'NARANJA', mensaje: 'El nombre de usuario debe tener al menos 4 caracteres.' });
      return;
    }
    if (form.contrasena.length < 8) {
      setAlerta({ tipo: 'NARANJA', mensaje: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (form.contrasena !== form.confirmar_contrasena) {
      setAlerta({ tipo: 'NARANJA', mensaje: 'Las contraseñas no coinciden.' });
      return;
    }

    try {
      setCargando(true);
      const payload = {
        usuario: form.usuario.trim(),
        contrasena: form.contrasena,
        nombre_comercial: form.nombre_comercial.trim(),
        tipo_persona: form.tipo_persona,
        rfc: form.rfc.trim().toUpperCase(),
        id_giro: Number(form.id_giro),
        numero_trabajadores: Number(form.numero_trabajadores),
        id_tamano: idTamanoCalculado,
        validado_denue: validadoDenue,
        domicilio_fiscal: {
          codigo_postal: form.cp_fiscal.trim(),
          calle: form.calle_fiscal.trim(),
          numero: form.numero_fiscal.trim(),
          id_alcaldia_fiscal: Number(form.id_alcaldia_fiscal),
          id_entidad_federativa_fiscal: Number(form.id_entidad_federativa_fiscal)
        },
        domicilio_operaciones: {
          codigo_postal: form.cp_operaciones.trim(),
          calle: form.calle_operaciones.trim(),
          numero: form.numero_operaciones.trim(),
          id_alcaldia_operaciones: Number(form.id_alcaldia_operaciones),
          id_entidad_federativa_operaciones: Number(form.id_entidad_federativa_operaciones)
        },
        actividad: {
          pagina_web: form.pagina_web.trim() || null,
          facebook: form.facebook.trim() || null,
          instagram: form.instagram.trim() || null,
          twitter: form.twitter.trim() || null
        },
        representante: {
          nombre_completo: form.nombre_completo.trim(),
          curp: form.curp.trim().toUpperCase()
        }
      };

      await apiFetch('/api/mipymes/registro', {
        method: 'POST',
        body: payload
      });

      setRegistroExitoso(true);
    } catch (err) {
      const msg = err.message || 'No se pudo completar el registro.';
      const esRojo =
        msg.toLowerCase().includes('bloqueado') ||
        msg.toLowerCase().includes('efos') ||
        msg.toLowerCase().includes('listado negro');

      if (esRojo) setBloqueado(true);

      setAlerta({
        tipo: esRojo ? 'ROJO' : 'NARANJA',
        mensaje: msg
      });
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className={styles.contenedor}>
      {/* LOGO EN LA ESQUINA */}
      <img
        src="/img/logo.png"
        alt="Logo WorkGuard"
        className={styles.logoEsquina}
        onClick={() => router.push('/')}
      />

      <section className={styles.contenido}>
        {/* LADO IZQUIERDO: ILUSTRACIÓN Y TEXTO INSTITUCIONAL */}
        <div className={styles.panelImagen}>
          <img
            src="/img/consultores.png"
            alt="Ilustración WorkGuard"
            className={styles.ilustracion}
          />
          <h2>Tu seguridad es importante</h2>
          <p>
            Validamos tu existencia fiscal, domicilio y cumplimiento ante el SAT en memoria RAM.
            Ningún PDF se almacena en nuestros servidores.
          </p>
        </div>

        {/* LADO DERECHO: FORMULARIO Y PASOS */}
        <div className={styles.panelFormulario}>
          {/* BOTONES SUPERIORES */}
          <div className={styles.accionesSuperiores}>
            <button
              type="button"
              className={styles.botonVolverInicio}
              onClick={() => router.push('/login')}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>

          {registroExitoso ? (
            <div className={styles.pantallaExito}>
              <div className={styles.selloActivoBadge}>🛡️ SELLO WORKGUARD ACTIVO</div>
              <h1>¡Bienvenido a WorkGuard, {form.nombre_comercial}!</h1>
              <p>
                Tu empresa superó las 4 validaciones oficiales y ya es visible en el directorio
                para los consultores verificados de la plataforma.
              </p>

              <div className={styles.resumenFinal}>
                <div>
                  <span>RFC Validado:</span>
                  <strong>{form.rfc}</strong>
                </div>
                <div>
                  <span>Clasificación DOF:</span>
                  <strong>{tamanoCalculado || 'MiPyME'} ({form.numero_trabajadores} trabajadores)</strong>
                </div>
                <div>
                  <span>Respaldo DENUE (INEGI):</span>
                  <strong>{validadoDenue ? '✓ Confirmado en DENUE' : 'Validado por Comprobante y Mapa'}</strong>
                </div>
              </div>

              <button
                type="button"
                className={styles.botonPrincipal}
                onClick={() => router.push('/login')}
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          ) : (
            <>
              <div className={styles.cabeceraPaso}>
                <div className={styles.cabeceraTexto}>
                  <span className={styles.indicadorPaso}>Paso {pasoActual} de 5</span>
                  <h1>{PASOS_WIZARD[pasoActual - 1]?.titulo}</h1>
                  <p className={styles.subtitulo}>
                    Completa los datos exactamente como aparecen en tus documentos oficiales.
                  </p>
                </div>

                {/* PUNTOS DE VERIFICACIÓN SUPERIORES DERECHOS */}
                <div className={styles.indicadoresDerechaSuperior}>
                  {PASOS_WIZARD.map((p) => {
                    const completado = pasoActual > p.num;
                    const activo = pasoActual === p.num;
                    return (
                      <div
                        key={p.num}
                        className={`${styles.puntoPasoSuperior} ${activo ? styles.activo : ''} ${
                          completado ? styles.completado : ''
                        }`}
                        title={`${p.num}. ${p.titulo}`}
                      >
                        {completado ? '✓' : p.num}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BANNER DE ALERTAS (VERDE / NARANJA / ROJO) */}
              {alerta && (
                <div
                  className={`${styles.alerta} ${
                    alerta.tipo === 'VERDE'
                      ? styles.alertaVerde
                      : alerta.tipo === 'ROJO'
                      ? styles.alertaRoja
                      : styles.alertaNaranja
                  }`}
                >
                  <strong>
                    {alerta.tipo === 'VERDE'
                      ? '✓ Validado: '
                      : alerta.tipo === 'ROJO'
                      ? '⛔ Registro Bloqueado: '
                      : '⚠️ Atención: '}
                  </strong>
                  <span>{alerta.mensaje}</span>
                </div>
              )}

              {/* ========================================================= */}
              {/* PASO 1: EXISTENCIA FISCAL                                 */}
              {/* ========================================================= */}
              {pasoActual === 1 && (
                <form onSubmit={validarYAvanzar} className={styles.formulario}>
                  <div className={styles.filaDos}>
                    <div className={styles.grupo}>
                      <label htmlFor="tipo_persona">Tipo de Persona *</label>
                      <select
                        id="tipo_persona"
                        name="tipo_persona"
                        value={form.tipo_persona}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      >
                        <option value="MORAL">Persona Moral (Empresa / Sociedad)</option>
                        <option value="FISICA">Persona Física con Actividad Empresarial</option>
                      </select>
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="rfc">
                        RFC ({form.tipo_persona === 'MORAL' ? '12 caracteres' : '13 caracteres'}) *
                      </label>
                      <input
                        id="rfc"
                        name="rfc"
                        type="text"
                        maxLength={form.tipo_persona === 'MORAL' ? 12 : 13}
                        placeholder={form.tipo_persona === 'MORAL' ? 'ABC210101XYZ' : 'ABCD900101XYZ'}
                        value={form.rfc}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.filaDos}>
                    <div className={styles.grupo}>
                      <label htmlFor="nombre_comercial">Nombre Comercial *</label>
                      <input
                        id="nombre_comercial"
                        name="nombre_comercial"
                        type="text"
                        placeholder="Ej. Soluciones Industriales del Centro"
                        value={form.nombre_comercial}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      />
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="id_giro">Giro Comercial *</label>
                      <select
                        id="id_giro"
                        name="id_giro"
                        value={form.id_giro}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      >
                        <option value="">Selecciona un giro...</option>
                        {catalogos.giros?.map((g) => (
                          <option key={g.id_giro} value={g.id_giro}>
                            {g.opcion_giro}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <h3 className={styles.seccionTitulo}>Domicilio Fiscal</h3>

                  <div className={styles.filaTres}>
                    <div className={styles.grupo}>
                      <label htmlFor="calle_fiscal">Calle *</label>
                      <input
                        id="calle_fiscal"
                        name="calle_fiscal"
                        type="text"
                        placeholder="Av. Insurgentes Sur"
                        value={form.calle_fiscal}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      />
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="numero_fiscal">Número Exterior *</label>
                      <input
                        id="numero_fiscal"
                        name="numero_fiscal"
                        type="text"
                        placeholder="1450"
                        value={form.numero_fiscal}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      />
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="cp_fiscal">Código Postal *</label>
                      <input
                        id="cp_fiscal"
                        name="cp_fiscal"
                        type="text"
                        maxLength={5}
                        placeholder="03100"
                        value={form.cp_fiscal}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.filaDos}>
                    <div className={styles.grupo}>
                      <label htmlFor="id_entidad_federativa_fiscal">Entidad Federativa *</label>
                      <select
                        id="id_entidad_federativa_fiscal"
                        name="id_entidad_federativa_fiscal"
                        value={form.id_entidad_federativa_fiscal}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      >
                        <option value="">Selecciona entidad...</option>
                        {catalogos.entidades_fiscal?.map((e) => (
                          <option key={e.id_entidad_federativa_fiscal} value={e.id_entidad_federativa_fiscal}>
                            {e.opcion_entidad_federativa}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="id_alcaldia_fiscal">Alcaldía / Municipio *</label>
                      <select
                        id="id_alcaldia_fiscal"
                        name="id_alcaldia_fiscal"
                        value={form.id_alcaldia_fiscal}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      >
                        <option value="">Selecciona alcaldía...</option>
                        {catalogos.alcaldias_fiscal?.map((a) => (
                          <option key={a.id_alcaldia_fiscal} value={a.id_alcaldia_fiscal}>
                            {a.opcion_alcaldia}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.grupoArchivo}>
                    <label htmlFor="doc_csf">Constancia de Situación Fiscal (PDF original del SAT con QR) *</label>
                    <input
                      id="doc_csf"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => manejarArchivo(e, 'doc_csf')}
                      disabled={bloqueado}
                      required
                    />
                    <small>Se verificará automáticamente el RFC y el Código QR oficial del SAT.</small>
                  </div>

                  <div className={styles.acciones}>
                    <button
                      type="submit"
                      className={styles.botonPrincipal}
                      disabled={cargando || bloqueado}
                    >
                      {cargando ? 'Validando con SAT...' : 'Validar Paso 1 y Continuar →'}
                    </button>
                  </div>
                </form>
              )}

              {/* ========================================================= */}
              {/* PASO 2: ACTIVIDAD Y UBICACIÓN                             */}
              {/* ========================================================= */}
              {pasoActual === 2 && (
                <form onSubmit={validarYAvanzar} className={styles.formulario}>
                  <div className={styles.grupoCheckbox}>
                    <label>
                      <input
                        type="checkbox"
                        name="mismo_domicilio"
                        checked={form.mismo_domicilio}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                      />
                      <span>El domicilio de operaciones es el mismo que el domicilio fiscal</span>
                    </label>
                  </div>

                  <div className={styles.filaTres}>
                    <div className={styles.grupo}>
                      <label htmlFor="calle_operaciones">Calle de Operaciones *</label>
                      <input
                        id="calle_operaciones"
                        name="calle_operaciones"
                        type="text"
                        placeholder="Av. Reforma"
                        value={form.calle_operaciones}
                        onChange={manejarCambio}
                        disabled={bloqueado || form.mismo_domicilio}
                        required
                      />
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="numero_operaciones">Número Exterior *</label>
                      <input
                        id="numero_operaciones"
                        name="numero_operaciones"
                        type="text"
                        placeholder="222"
                        value={form.numero_operaciones}
                        onChange={manejarCambio}
                        disabled={bloqueado || form.mismo_domicilio}
                        required
                      />
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="cp_operaciones">Código Postal *</label>
                      <input
                        id="cp_operaciones"
                        name="cp_operaciones"
                        type="text"
                        maxLength={5}
                        placeholder="06600"
                        value={form.cp_operaciones}
                        onChange={manejarCambio}
                        disabled={bloqueado || form.mismo_domicilio}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.filaDos}>
                    <div className={styles.grupo}>
                      <label htmlFor="id_entidad_federativa_operaciones">Entidad Federativa *</label>
                      <select
                        id="id_entidad_federativa_operaciones"
                        name="id_entidad_federativa_operaciones"
                        value={form.id_entidad_federativa_operaciones}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      >
                        <option value="">Selecciona entidad...</option>
                        {catalogos.entidades_operaciones?.map((e) => (
                          <option key={e.id_entidad_federativa_operaciones} value={e.id_entidad_federativa_operaciones}>
                            {e.opcion_entidad_federativa}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="id_alcaldia_operaciones">Alcaldía / Municipio *</label>
                      <select
                        id="id_alcaldia_operaciones"
                        name="id_alcaldia_operaciones"
                        value={form.id_alcaldia_operaciones}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      >
                        <option value="">Selecciona alcaldía...</option>
                        {catalogos.alcaldias_operaciones?.map((a) => (
                          <option key={a.id_alcaldia_operaciones} value={a.id_alcaldia_operaciones}>
                            {a.opcion_alcaldia}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* BOTÓN Y VISTA PREVIA DE MAPA */}
                  <div className={styles.cajaMapa}>
                    <div className={styles.cabeceraMapa}>
                      <div>
                        <strong>Verificación Geográfica del Establecimiento *</strong>
                        <p>Confirma que tu ubicación física exista antes de subir tu comprobante.</p>
                      </div>
                      <button
                        type="button"
                        className={styles.botonSecundario}
                        onClick={ubicarEnMapa}
                        disabled={buscandoMapa || bloqueado}
                      >
                        {buscandoMapa ? 'Buscando...' : geolocalizado ? '✓ Ubicado en Mapa' : '📍 Ubicar en Mapa'}
                      </button>
                    </div>

                    {coordenadas && (
                      <div className={styles.vistaPreviaMapa}>
                        <iframe
                          title="Mapa de ubicación MiPyME"
                          width="100%"
                          height="160"
                          frameBorder="0"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                            coordenadas.lon - 0.005
                          }%2C${coordenadas.lat - 0.005}%2C${coordenadas.lon + 0.005}%2C${
                            coordenadas.lat + 0.005
                          }&layer=mapnik&marker=${coordenadas.lat}%2C${coordenadas.lon}`}
                        />
                        <small>{coordenadas.display_name}</small>
                      </div>
                    )}
                  </div>

                  <div className={styles.grupoArchivo}>
                    <label htmlFor="doc_comprobante">Comprobante de Domicilio Digital (Luz, Agua, Teléfono o Predial en PDF) *</label>
                    <input
                      id="doc_comprobante"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => manejarArchivo(e, 'doc_comprobante')}
                      disabled={bloqueado}
                      required
                    />
                  </div>

                  <h3 className={styles.seccionTitulo}>Presencia Digital (Opcional)</h3>

                  <div className={styles.filaDos}>
                    <div className={styles.grupo}>
                      <label htmlFor="pagina_web">Sitio Web</label>
                      <input
                        id="pagina_web"
                        name="pagina_web"
                        type="url"
                        placeholder="https://www.tuempresa.com"
                        value={form.pagina_web}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                      />
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="facebook">Facebook</label>
                      <input
                        id="facebook"
                        name="facebook"
                        type="text"
                        placeholder="facebook.com/tuempresa"
                        value={form.facebook}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                      />
                    </div>
                  </div>

                  <div className={styles.filaDos}>
                    <div className={styles.grupo}>
                      <label htmlFor="instagram">Instagram</label>
                      <input
                        id="instagram"
                        name="instagram"
                        type="text"
                        placeholder="@tuempresa"
                        value={form.instagram}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                      />
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="twitter">X (Twitter)</label>
                      <input
                        id="twitter"
                        name="twitter"
                        type="text"
                        placeholder="@tuempresa"
                        value={form.twitter}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                      />
                    </div>
                  </div>

                  <div className={styles.accionesDoble}>
                    <button
                      type="button"
                      className={styles.botonAtras}
                      onClick={() => setPasoActual(1)}
                      disabled={cargando || bloqueado}
                    >
                      ← Anterior
                    </button>

                    <button
                      type="submit"
                      className={styles.botonPrincipal}
                      disabled={cargando || bloqueado}
                    >
                      {cargando ? 'Validando Ubicación...' : 'Validar Paso 2 y Continuar →'}
                    </button>
                  </div>
                </form>
              )}

              {/* ========================================================= */}
              {/* PASO 3: REPRESENTANTE LEGAL / TITULAR                     */}
              {/* ========================================================= */}
              {pasoActual === 3 && (
                <form onSubmit={validarYAvanzar} className={styles.formulario}>
                  <div className={styles.grupo}>
                    <label htmlFor="nombre_completo">
                      Nombre Completo del {form.tipo_persona === 'MORAL' ? 'Representante Legal' : 'Titular'} *
                    </label>
                    <input
                      id="nombre_completo"
                      name="nombre_completo"
                      type="text"
                      placeholder="Nombre(s) y Apellidos"
                      value={form.nombre_completo}
                      onChange={manejarCambio}
                      disabled={bloqueado}
                      required
                    />
                  </div>

                  <div className={styles.grupo}>
                    <label htmlFor="curp">CURP (18 caracteres) *</label>
                    <input
                      id="curp"
                      name="curp"
                      type="text"
                      maxLength={18}
                      placeholder="ABCD900101HDFXXX00"
                      value={form.curp}
                      onChange={manejarCambio}
                      disabled={bloqueado}
                      required
                    />
                  </div>

                  <div className={styles.grupoArchivo}>
                    <label htmlFor="doc_curp">Constancia Oficial de la CURP (PDF descargado de gob.mx/curp) *</label>
                    <input
                      id="doc_curp"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => manejarArchivo(e, 'doc_curp')}
                      disabled={bloqueado}
                      required
                    />
                  </div>

                  <div className={styles.accionesDoble}>
                    <button
                      type="button"
                      className={styles.botonAtras}
                      onClick={() => setPasoActual(2)}
                      disabled={cargando || bloqueado}
                    >
                      ← Anterior
                    </button>

                    <button
                      type="submit"
                      className={styles.botonPrincipal}
                      disabled={cargando || bloqueado}
                    >
                      {cargando ? 'Validando Identidad...' : 'Validar Paso 3 y Continuar →'}
                    </button>
                  </div>
                </form>
              )}

              {/* ========================================================= */}
              {/* PASO 4: CUMPLIMIENTO Y TAMAÑO (DOF + OPINIÓN 32-D)        */}
              {/* ========================================================= */}
              {pasoActual === 4 && (
                <form onSubmit={validarYAvanzar} className={styles.formulario}>
                  <div className={styles.grupo}>
                    <label htmlFor="numero_trabajadores">
                      Número Total de Trabajadores (1 a 250 según criterios DOF) *
                    </label>
                    <input
                      id="numero_trabajadores"
                      name="numero_trabajadores"
                      type="number"
                      min={1}
                      max={250}
                      placeholder="Ej. 15"
                      value={form.numero_trabajadores}
                      onChange={manejarCambio}
                      disabled={bloqueado}
                      required
                    />
                    <small>1–10: Microempresa | 11–50: Pequeña empresa | 51–250: Mediana empresa.</small>
                  </div>

                  <div className={styles.grupoArchivo}>
                    <label htmlFor="doc_opinion_32d">
                      Opinión del Cumplimiento de Obligaciones Fiscales 32-D (PDF POSITIVO del SAT) *
                    </label>
                    <input
                      id="doc_opinion_32d"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => manejarArchivo(e, 'doc_opinion_32d')}
                      disabled={bloqueado}
                      required
                    />
                    <small>Se verificará sentido POSITIVO, RFC y Código QR oficial del SAT.</small>
                  </div>

                  <div className={styles.accionesDoble}>
                    <button
                      type="button"
                      className={styles.botonAtras}
                      onClick={() => setPasoActual(3)}
                      disabled={cargando || bloqueado}
                    >
                      ← Anterior
                    </button>

                    <button
                      type="submit"
                      className={styles.botonPrincipal}
                      disabled={cargando || bloqueado}
                    >
                      {cargando ? 'Verificando 32-D...' : 'Validar Paso 4 y Continuar →'}
                    </button>
                  </div>
                </form>
              )}

              {/* ========================================================= */}
              {/* PASO 5: CREDENCIALES Y ACTIVACIÓN DE SELLO                */}
              {/* ========================================================= */}
              {pasoActual === 5 && (
                <form onSubmit={finalizarRegistro} className={styles.formulario}>
                  <div className={styles.resumenVerificacion}>
                    <strong>✓ Todas las validaciones oficiales fueron aprobadas</strong>
                    <p>
                      Empresa: {form.nombre_comercial} | RFC: {form.rfc} | Clasificación:{' '}
                      <strong>{tamanoCalculado || 'MiPyME'}</strong>
                    </p>
                  </div>

                  <div className={styles.grupo}>
                    <label htmlFor="usuario">Nombre de Usuario para Iniciar Sesión *</label>
                    <input
                      id="usuario"
                      name="usuario"
                      type="text"
                      minLength={4}
                      placeholder="Ej. soluciones_centro"
                      value={form.usuario}
                      onChange={manejarCambio}
                      disabled={bloqueado}
                      required
                    />
                  </div>

                  <div className={styles.filaDos}>
                    <div className={styles.grupo}>
                      <label htmlFor="contrasena">Contraseña (mínimo 8 caracteres) *</label>
                      <input
                        id="contrasena"
                        name="contrasena"
                        type="password"
                        minLength={8}
                        placeholder="••••••••"
                        value={form.contrasena}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      />
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="confirmar_contrasena">Confirmar Contraseña *</label>
                      <input
                        id="confirmar_contrasena"
                        name="confirmar_contrasena"
                        type="password"
                        minLength={8}
                        placeholder="••••••••"
                        value={form.confirmar_contrasena}
                        onChange={manejarCambio}
                        disabled={bloqueado}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.accionesDoble}>
                    <button
                      type="button"
                      className={styles.botonAtras}
                      onClick={() => setPasoActual(4)}
                      disabled={cargando || bloqueado}
                    >
                      ← Anterior
                    </button>

                    <button
                      type="submit"
                      className={styles.botonPrincipal}
                      disabled={cargando || bloqueado}
                    >
                      {cargando ? 'Creando cuenta...' : 'Finalizar y Activar Sello WorkGuard'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}