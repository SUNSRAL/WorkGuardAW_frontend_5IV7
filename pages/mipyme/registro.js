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

// --- COMPONENTES LOCALES REUTILIZABLES ---

function AlertaEstado({ alerta }) {
  if (!alerta) return null;
  const esVerde = alerta.tipo === 'VERDE';
  const esRojo = alerta.tipo === 'ROJO';

  const claseAlerta = esVerde ? styles.alertaVerde : esRojo ? styles.alertaRoja : styles.alertaNaranja;
  const icono = esVerde ? '🟢' : esRojo ? '🔴' : '⚠️';
  const titulo = esVerde ? 'Validación Aprobada' : esRojo ? 'Registro Bloqueado' : 'Por favor corrige los siguientes puntos:';

  return (
    <div className={`${styles.alerta} ${claseAlerta}`}>
      <div className={styles.franjaAlerta}>
        <span>{icono}</span>
        <span>{titulo}</span>
      </div>
      <p className={styles.cuerpoAlerta}>{alerta.mensaje}</p>
    </div>
  );
}

function CampoInput({ label, name, type = 'text', value, onChange, disabled, ayuda, ...props }) {
  return (
    <div className={styles.grupo}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} disabled={disabled} {...props} />
      {ayuda && <small>{ayuda}</small>}
    </div>
  );
}

function CampoSelect({ label, name, value, onChange, disabled, placeholder, opciones = [], valueKey, labelKey, children, ...props }) {
  return (
    <div className={styles.grupo}>
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} value={value} onChange={onChange} disabled={disabled} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {opciones.map((op) => (
          <option key={op[valueKey]} value={op[valueKey]}>
            {op[labelKey]}
          </option>
        ))}
        {children}
      </select>
    </div>
  );
}

function CampoArchivo({ label, id, archivo, onChange, disabled, ayuda }) {
  return (
    <div className={styles.grupoArchivo}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="file" accept=".pdf,application/pdf" onChange={(e) => onChange(e, id)} disabled={disabled} required={!archivo} />
      {archivo && (
        <small style={{ color: '#059669', fontWeight: 600 }}>
          ✓ Archivo cargado en memoria: {archivo.name}
        </small>
      )}
      {ayuda && <small>{ayuda}</small>}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function RegistroMipyme() {
  const router = useRouter();

  const [pasoActual, setPasoActual] = useState(1);
  const [mostrarGuiaSemaforo, setMostrarGuiaSemaforo] = useState(false);

  const [catalogos, setCatalogos] = useState({
    giros: [],
    alcaldias_fiscal: [],
    entidades_fiscal: [],
    alcaldias_operaciones: [],
    entidades_operaciones: [],
    tamanos: []
  });

  const [form, setForm] = useState({
    tipo_persona: 'MORAL',
    nombre_comercial: '',
    rfc: '',
    id_giro: '',
    cp_fiscal: '',
    calle_fiscal: '',
    numero_fiscal: '',
    id_alcaldia_fiscal: '',
    id_entidad_federativa_fiscal: '',

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

    nombre_completo: '',
    curp: '',
    numero_trabajadores: '',
    usuario: '',
    contrasena: '',
    confirmar_contrasena: ''
  });

  const [archivos, setArchivos] = useState({
    doc_csf: null,
    doc_comprobante: null,
    doc_curp: null,
    doc_acta: null,
    doc_opinion_32d: null
  });

  const [coordenadas, setCoordenadas] = useState(null);
  const [geolocalizado, setGeolocalizado] = useState(false);
  const [buscandoMapa, setBuscandoMapa] = useState(false);

  const [resultadosPasos, setResultadosPasos] = useState({});
  const [validadoDenue, setValidadoDenue] = useState(false);
  const [urlQrCsf, setUrlQrCsf] = useState('');
  const [urlQr32d, setUrlQr32d] = useState('');
  const [tamanoCalculado, setTamanoCalculado] = useState('');
  const [idTamanoCalculado, setIdTamanoCalculado] = useState(null);

  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  useEffect(() => {
    function manejarBeforeUnload(e) {
      if (!registroExitoso) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que deseas salir? Tu progreso y registro actual se descartarán.';
      }
    }
    window.addEventListener('beforeunload', manejarBeforeUnload);
    return () => window.removeEventListener('beforeunload', manejarBeforeUnload);
  }, [registroExitoso]);

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const data = await apiFetch('/api/mipymes/catalogos');
        setCatalogos(data);

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
        numero_operaciones: checked ? prev.numero_fiscal : '',
        id_alcaldia_operaciones: checked ? prev.id_alcaldia_fiscal : prev.id_alcaldia_operaciones
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
      const query = encodeURIComponent(`${form.calle_operaciones} ${form.numero_operaciones}, ${form.cp_operaciones}, ${nombreAlcaldia}, Mexico`);
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, {
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
      setCoordenadas({ lat: Number(lugar.lat), lon: Number(lugar.lon), display_name: lugar.display_name });
      setGeolocalizado(true);
      setAlerta({ tipo: 'VERDE', mensaje: 'Domicilio localizado correctamente en el mapa.' });
    } catch (err) {
      setAlerta({ tipo: 'NARANJA', mensaje: 'Error al consultar el servicio de mapas en este momento.' });
    } finally {
      setBuscandoMapa(false);
    }
  }

  function irAPaso(nuevoPaso) {
    setAlerta(null);
    setPasoActual(nuevoPaso);
  }

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
        fd.append('mismo_domicilio', String(form.mismo_domicilio));
        fd.append('cp_fiscal', form.cp_fiscal.trim());
        fd.append('calle_fiscal', form.calle_fiscal.trim());
        if (coordenadas) {
          fd.append('lat', String(coordenadas.lat));
          fd.append('lon', String(coordenadas.lon));
        }
        if (archivos.doc_csf) fd.append('doc_csf', archivos.doc_csf);
        if (archivos.doc_comprobante) fd.append('doc_comprobante', archivos.doc_comprobante);
      }

      if (pasoActual === 3) {
        fd.append('nombre_completo', form.nombre_completo.trim());
        fd.append('curp', form.curp.trim());
        if (archivos.doc_csf) fd.append('doc_csf', archivos.doc_csf);
        if (archivos.doc_curp) fd.append('doc_curp', archivos.doc_curp);
        if (archivos.doc_acta) fd.append('doc_acta', archivos.doc_acta);
      }

      if (pasoActual === 4) {
        fd.append('numero_trabajadores', String(form.numero_trabajadores));
        if (archivos.doc_opinion_32d) fd.append('doc_opinion_32d', archivos.doc_opinion_32d);
      }

      const data = await apiFetch('/api/mipymes/evaluar-paso', { method: 'POST', body: fd });

      setResultadosPasos((prev) => ({ ...prev, [pasoActual]: data }));
      if (pasoActual === 1 && data.url_qr_csf) {
        setUrlQrCsf(data.url_qr_csf);
      }
      if (pasoActual === 2) {
        setValidadoDenue(Boolean(data.validado_denue));
      }
      if (pasoActual === 4) {
        setTamanoCalculado(data.tamano_calculado || '');
        setIdTamanoCalculado(data.id_tamano || null);
        if (data.url_qr_32d) {
          setUrlQr32d(data.url_qr_32d);
        }
      }

      irAPaso(pasoActual + 1);
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
      setAlerta({ tipo: esRojo ? 'ROJO' : 'NARANJA', mensaje: msg });
    } finally {
      setCargando(false);
    }
  }

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
        url_qr_csf: urlQrCsf || null,
        url_qr_32d: urlQr32d || null,
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

      await apiFetch('/api/mipymes/registro', { method: 'POST', body: payload });
      setAlerta(null);
      setRegistroExitoso(true);
    } catch (err) {
      const msg = err.message || 'No se pudo completar el registro.';
      const esRojo =
        msg.toLowerCase().includes('bloqueado') ||
        msg.toLowerCase().includes('efos') ||
        msg.toLowerCase().includes('listado negro');

      if (esRojo) setBloqueado(true);
      setAlerta({ tipo: esRojo ? 'ROJO' : 'NARANJA', mensaje: msg });
    } finally {
      setCargando(false);
    }
  }

  const alcaldiaSeleccionadaObj = catalogos.alcaldias_operaciones.find(
    (a) => String(a.id_alcaldia_operaciones) === String(form.id_alcaldia_operaciones)
  );
  const nombreAlcaldiaTexto = alcaldiaSeleccionadaObj?.opcion_alcaldia || '';
  const nombreParaMapa = form.nombre_comercial.trim() ? `${form.nombre_comercial.trim()}, ` : '';
  const queryMapaStr = `${nombreParaMapa}${form.calle_operaciones} ${form.numero_operaciones}, ${form.cp_operaciones}, ${nombreAlcaldiaTexto}, Mexico`;

  return (
    <main className={styles.contenedor}>
      <img src="/img/logo.png" alt="Logo WorkGuard" className={styles.logoEsquina} onClick={() => router.push('/')} />

      <section className={styles.contenido}>
        <div className={styles.panelImagen}>
          <img src="/img/Consultores.png" alt="Ilustración WorkGuard" className={styles.ilustracion} />
          <h2>Tu seguridad es importante</h2>
          <p>
            Validamos tu existencia fiscal, domicilio y cumplimiento ante el SAT en memoria RAM.
            Ningún PDF se almacena en nuestros servidores.
          </p>
        </div>

        <div className={styles.panelFormulario}>
          {registroExitoso ? (
            <div className={styles.pantallaExito}>
              <div className={styles.selloActivoBadge}>📝 CUENTA CREADA — PASO FINAL PENDIENTE</div>
              <h1>¡Bienvenido a WorkGuard, {form.nombre_comercial}!</h1>
              <p>
                Tus 4 validaciones fiscales y de identidad salieron en Verde. Ahora inicia sesión en tu panel
                para subir tu logotipo, agregar hasta 3 fotos de tu establecimiento y redactar la descripción
                que verán los consultores antes de enviarlo a aprobación del Administrador.
              </p>

              <div className={styles.resumenFinal}>
                <div><span>RFC Validado:</span><strong>{form.rfc}</strong></div>
                <div><span>Clasificación DOF:</span><strong>{tamanoCalculado || 'MiPyME'} ({form.numero_trabajadores} trabajadores)</strong></div>
                <div><span>Estatus Actual:</span><strong>Borrador de Perfil (Pendiente de personalizar tarjeta)</strong></div>
              </div>

              <button type="button" className={styles.botonPrincipal} onClick={() => router.push('/login')}>
                Iniciar Sesión para Personalizar mi Perfil
              </button>
            </div>
          ) : (
            <>
              <div className={styles.contenedorPasosArriba}>
                {PASOS_WIZARD.map((p) => {
                  const completado = pasoActual > p.num;
                  const activo = pasoActual === p.num;
                  return (
                    <div key={p.num} className={`${styles.pasoArribaItem} ${activo ? styles.activo : ''} ${completado ? styles.completado : ''}`}>
                      <div className={styles.circuloPasoArriba}>{completado ? '✓' : p.num}</div>
                      <div className={styles.textoPasoArriba}>
                        <strong>{p.titulo}</strong>
                        <span>Paso {p.num}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.cabeceraPaso}>
                <h1>{PASOS_WIZARD[pasoActual - 1]?.titulo}</h1>
                <p className={styles.subtitulo}>Completa los datos exactamente como aparecen en tus documentos oficiales.</p>

                <div className={styles.accionesSuperiores}>
                  <div className={styles.contenedorSemaforoDesplegable}>
                    <button
                      type="button"
                      className={styles.botonSemaforoDiscreto}
                      onClick={() => setMostrarGuiaSemaforo((prev) => !prev)}
                      aria-expanded={mostrarGuiaSemaforo}
                    >
                      <span className={styles.miniPuntos}>
                        <span className={styles.miniVerde}></span>
                        <span className={styles.miniNaranja}></span>
                        <span className={styles.miniRojo}></span>
                      </span>
                      <span>Reglas de validación {mostrarGuiaSemaforo ? '▴' : '▾'}</span>
                    </button>

                    {mostrarGuiaSemaforo && (
                      <div className={styles.popoverSemaforo}>
                        <div className={styles.cabeceraPopover}>
                          <strong>Sistema de Validación Oficial</strong>
                          <button type="button" className={styles.cerrarPopover} onClick={() => setMostrarGuiaSemaforo(false)} aria-label="Cerrar guía">✕</button>
                        </div>
                        <div className={styles.itemSemaforo}>
                          <span className={styles.puntoVerde}></span>
                          <div><strong>Verde:</strong> Documento y datos verificados.</div>
                        </div>
                        <div className={styles.itemSemaforo}>
                          <span className={styles.puntoNaranja}></span>
                          <div><strong>Naranja:</strong> Error corregible (máx. 3 intentos por paso).</div>
                        </div>
                        <div className={styles.itemSemaforo}>
                          <span className={styles.puntoRojo}></span>
                          <div><strong>Rojo:</strong> Bloqueo inmediato (Listas negras, duplicados o 3 fallos).</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PASO 1 */}
              {pasoActual === 1 && (
                <form onSubmit={validarYAvanzar} className={styles.formulario}>
                  <div className={styles.filaDos}>
                    <CampoSelect label="Tipo de Persona *" name="tipo_persona" value={form.tipo_persona} onChange={manejarCambio} disabled={bloqueado} required>
                      <option value="MORAL">Persona Moral (Empresa / Sociedad)</option>
                      <option value="FISICA">Persona Física con Actividad Empresarial</option>
                    </CampoSelect>

                    <CampoInput
                      label={`RFC (${form.tipo_persona === 'MORAL' ? '12 caracteres' : '13 caracteres'}) *`}
                      name="rfc"
                      value={form.rfc}
                      onChange={manejarCambio}
                      disabled={bloqueado}
                      maxLength={form.tipo_persona === 'MORAL' ? 12 : 13}
                      placeholder={form.tipo_persona === 'MORAL' ? 'ABC210101XYZ' : 'ABCD900101XYZ'}
                      required
                    />
                  </div>

                  <div className={styles.filaDos}>
                    <CampoInput label="Nombre Comercial *" name="nombre_comercial" value={form.nombre_comercial} onChange={manejarCambio} disabled={bloqueado} placeholder="Ej. Soluciones Industriales" required />
                    <CampoSelect label="Giro Comercial *" name="id_giro" value={form.id_giro} onChange={manejarCambio} disabled={bloqueado} placeholder="Selecciona un giro..." opciones={catalogos.giros} valueKey="id_giro" labelKey="opcion_giro" required />
                  </div>

                  <h3 className={styles.seccionTitulo}>Domicilio Fiscal</h3>

                  <div className={styles.filaTres}>
                    <CampoInput label="Calle *" name="calle_fiscal" value={form.calle_fiscal} onChange={manejarCambio} disabled={bloqueado} placeholder="Av. Insurgentes Sur" required />
                    <CampoInput label="Número Exterior *" name="numero_fiscal" value={form.numero_fiscal} onChange={manejarCambio} disabled={bloqueado} placeholder="1450" required />
                    <CampoInput label="Código Postal *" name="cp_fiscal" value={form.cp_fiscal} onChange={manejarCambio} disabled={bloqueado} maxLength={5} placeholder="03100" required />
                  </div>

                  <div className={styles.filaDos}>
                    <CampoSelect label="Entidad Federativa *" name="id_entidad_federativa_fiscal" value={form.id_entidad_federativa_fiscal} onChange={manejarCambio} disabled={bloqueado} placeholder="Selecciona entidad..." opciones={catalogos.entidades_fiscal} valueKey="id_entidad_federativa_fiscal" labelKey="opcion_entidad_federativa" required />
                    <CampoSelect label="Alcaldía / Municipio *" name="id_alcaldia_fiscal" value={form.id_alcaldia_fiscal} onChange={manejarCambio} disabled={bloqueado} placeholder="Selecciona alcaldía..." opciones={catalogos.alcaldias_fiscal} valueKey="id_alcaldia_fiscal" labelKey="opcion_alcaldia" required />
                  </div>

                  <CampoArchivo
                    id="doc_csf"
                    label="Constancia de Situación Fiscal (PDF original del SAT con QR) *"
                    archivo={archivos.doc_csf}
                    onChange={manejarArchivo}
                    disabled={bloqueado}
                    ayuda="Se verificará automáticamente el RFC y el Código QR oficial del SAT."
                  />

                  <AlertaEstado alerta={alerta} />

                  <div className={styles.acciones}>
                    <button type="submit" className={styles.botonPrincipal} disabled={cargando || bloqueado}>
                      {cargando ? 'Validando con SAT...' : 'Validar Paso 1 y Continuar →'}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 2 */}
              {pasoActual === 2 && (
                <form onSubmit={validarYAvanzar} className={styles.formulario}>
                  <div className={styles.layoutPasoDos}>
                    <div className={styles.columnaFormularioPasoDos}>
                      <div className={styles.grupoCheckbox}>
                        <label>
                          <input type="checkbox" name="mismo_domicilio" checked={form.mismo_domicilio} onChange={manejarCambio} disabled={bloqueado} />
                          <span>El domicilio de operaciones es el mismo que el fiscal</span>
                        </label>
                      </div>

                      <CampoInput label="Calle de Operaciones *" name="calle_operaciones" value={form.calle_operaciones} onChange={manejarCambio} disabled={bloqueado || form.mismo_domicilio} placeholder="Av. Reforma" required />

                      <div className={styles.filaDos}>
                        <CampoInput label="Número *" name="numero_operaciones" value={form.numero_operaciones} onChange={manejarCambio} disabled={bloqueado || form.mismo_domicilio} placeholder="222" required />
                        <CampoInput label="C.P. *" name="cp_operaciones" value={form.cp_operaciones} onChange={manejarCambio} disabled={bloqueado || form.mismo_domicilio} maxLength={5} placeholder="06600" required />
                      </div>

                      <CampoSelect label="Entidad Federativa *" name="id_entidad_federativa_operaciones" value={form.id_entidad_federativa_operaciones} onChange={manejarCambio} disabled={bloqueado} placeholder="Selecciona entidad..." opciones={catalogos.entidades_operaciones} valueKey="id_entidad_federativa_operaciones" labelKey="opcion_entidad_federativa" required />
                      <CampoSelect label="Alcaldía / Municipio *" name="id_alcaldia_operaciones" value={form.id_alcaldia_operaciones} onChange={manejarCambio} disabled={bloqueado} placeholder="Selecciona alcaldía..." opciones={catalogos.alcaldias_operaciones} valueKey="id_alcaldia_operaciones" labelKey="opcion_alcaldia" required />

                      <CampoArchivo id="doc_comprobante" label="Comprobante de Domicilio (PDF) *" archivo={archivos.doc_comprobante} onChange={manejarArchivo} disabled={bloqueado} />
                    </div>

                    <div className={styles.columnaMapaPasoDos}>
                      <div className={styles.cajaMapaModerno}>
                        <div className={styles.cabeceraMapaModerno}>
                          <div>
                            <strong>Verificación Geográfica *</strong>
                            <p>Confirma tu ubicación en Google Maps.</p>
                          </div>
                          <button type="button" className={styles.botonSecundario} onClick={ubicarEnMapa} disabled={buscandoMapa || bloqueado}>
                            {buscandoMapa ? 'Buscando...' : geolocalizado ? '✓ Verificado' : '📍 Actualizar Mapa'}
                          </button>
                        </div>

                        <div className={styles.gridMapaContenido}>
                          <div className={styles.columnaIframeMapa}>
                            <iframe
                              title="Ubicación exacta en Google Maps"
                              width="100%"
                              height="100%"
                              style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                              loading="lazy"
                              src={
                                coordenadas
                                  ? `https://maps.google.com/maps?q=${coordenadas.lat},${coordenadas.lon}&z=17&output=embed`
                                  : `https://maps.google.com/maps?q=${encodeURIComponent(queryMapaStr)}&z=17&output=embed`
                              }
                            />
                          </div>

                          <div className={styles.columnaInfoMapa}>
                            <div className={styles.infoItemMapa}>
                              <span>Alcaldía o Municipio:</span>
                              <strong>{nombreAlcaldiaTexto || 'No seleccionada'}</strong>
                            </div>
                            <div className={styles.infoItemMapa}>
                              <span>Domicilio a buscar:</span>
                              <strong>{form.calle_operaciones ? `${form.calle_operaciones} #${form.numero_operaciones}, C.P. ${form.cp_operaciones}` : 'Completa los campos'}</strong>
                            </div>
                            <div className={styles.infoItemMapa}>
                              <span>Estado GPS / Marcador:</span>
                              <strong style={{ color: geolocalizado ? '#10B981' : '#D97706' }}>
                                {geolocalizado ? '✓ Pin y Establecimiento Localizado' : 'Pendiente de actualizar mapa'}
                              </strong>
                            </div>
                            <div className={styles.infoItemMapa}>
                              <span>Validación DENUE (INEGI):</span>
                              <strong style={{ color: validadoDenue ? '#10B981' : '#2563EB' }}>
                                {validadoDenue ? '✓ Aprobado y Confirmado en DENUE' : 'Se evaluará al continuar el paso'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className={styles.pieMapaModerno}>
                          <small>{coordenadas ? coordenadas.display_name : queryMapaStr}</small>
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryMapaStr)}`} target="_blank" rel="noopener noreferrer" className={styles.linkMapaGoogle}>
                            Abrir ruta en Google Maps ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className={styles.seccionTitulo}>Presencia Digital (Opcional)</h3>

                  <div className={styles.filaDos}>
                    <CampoInput label="Sitio Web" name="pagina_web" type="url" value={form.pagina_web} onChange={manejarCambio} disabled={bloqueado} placeholder="https://www.tuempresa.com" />
                    <CampoInput label="Facebook" name="facebook" value={form.facebook} onChange={manejarCambio} disabled={bloqueado} placeholder="facebook.com/tuempresa" />
                  </div>

                  <div className={styles.filaDos}>
                    <CampoInput label="Instagram" name="instagram" value={form.instagram} onChange={manejarCambio} disabled={bloqueado} placeholder="@tuempresa" />
                    <CampoInput label="X (Twitter)" name="twitter" value={form.twitter} onChange={manejarCambio} disabled={bloqueado} placeholder="@tuempresa" />
                  </div>

                  <AlertaEstado alerta={alerta} />

                  <div className={styles.accionesDoble}>
                    <button type="button" className={styles.botonAtras} onClick={() => irAPaso(1)} disabled={cargando || bloqueado}>← Anterior</button>
                    <button type="submit" className={styles.botonPrincipal} disabled={cargando || bloqueado}>
                      {cargando ? 'Validando Ubicación...' : 'Validar Paso 2 y Continuar →'}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 3 */}
              {pasoActual === 3 && (
                <form onSubmit={validarYAvanzar} className={styles.formulario}>
                  <CampoInput
                    label={`Nombre Completo del ${form.tipo_persona === 'MORAL' ? 'Representante Legal' : 'Titular'} *`}
                    name="nombre_completo"
                    value={form.nombre_completo}
                    onChange={manejarCambio}
                    disabled={bloqueado}
                    placeholder="Nombre(s) y Apellidos"
                    required
                  />

                  <CampoInput label="CURP (18 caracteres) *" name="curp" value={form.curp} onChange={manejarCambio} disabled={bloqueado} maxLength={18} placeholder="ABCD900101HDFXXX00" required />

                  <CampoArchivo id="doc_curp" label="Constancia Oficial de la CURP (PDF descargado de gob.mx/curp) *" archivo={archivos.doc_curp} onChange={manejarArchivo} disabled={bloqueado} />

                  {form.tipo_persona === 'MORAL' && (
                    <CampoArchivo
                      id="doc_acta"
                      label="Acta Constitutiva o Poder Notarial (PDF donde conste el Representante Legal) *"
                      archivo={archivos.doc_acta}
                      onChange={manejarArchivo}
                      disabled={bloqueado}
                      ayuda="Se verificará la Razón Social y el nombramiento del Representante Legal."
                    />
                  )}

                  <AlertaEstado alerta={alerta} />

                  <div className={styles.accionesDoble}>
                    <button type="button" className={styles.botonAtras} onClick={() => irAPaso(2)} disabled={cargando || bloqueado}>← Anterior</button>
                    <button type="submit" className={styles.botonPrincipal} disabled={cargando || bloqueado}>
                      {cargando ? 'Validando Identidad...' : 'Validar Paso 3 y Continuar →'}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 4 */}
              {pasoActual === 4 && (
                <form onSubmit={validarYAvanzar} className={styles.formulario}>
                  <CampoInput
                    label="Número Total de Trabajadores (1 a 250 según criterios DOF) *"
                    name="numero_trabajadores"
                    type="number"
                    min={1}
                    max={250}
                    value={form.numero_trabajadores}
                    onChange={manejarCambio}
                    disabled={bloqueado}
                    placeholder="Ej. 15"
                    ayuda="1–10: Microempresa | 11–50: Pequeña empresa | 51–250: Mediana empresa."
                    required
                  />

                  <CampoArchivo
                    id="doc_opinion_32d"
                    label="Opinión del Cumplimiento de Obligaciones Fiscales 32-D (PDF POSITIVO del SAT) *"
                    archivo={archivos.doc_opinion_32d}
                    onChange={manejarArchivo}
                    disabled={bloqueado}
                    ayuda="Se verificará sentido POSITIVO, RFC y Código QR oficial del SAT."
                  />

                  <AlertaEstado alerta={alerta} />

                  <div className={styles.accionesDoble}>
                    <button type="button" className={styles.botonAtras} onClick={() => irAPaso(3)} disabled={cargando || bloqueado}>← Anterior</button>
                    <button type="submit" className={styles.botonPrincipal} disabled={cargando || bloqueado}>
                      {cargando ? 'Verificando 32-D...' : 'Validar Paso 4 y Continuar →'}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 5 */}
              {pasoActual === 5 && (
                <form onSubmit={finalizarRegistro} className={styles.formulario}>
                  <div className={styles.resumenVerificacion}>
                    <strong>✓ Todas las validaciones oficiales fueron aprobadas</strong>
                    <p>
                      Empresa: {form.nombre_comercial} | RFC: {form.rfc} | Clasificación:{' '}
                      <strong>{tamanoCalculado || 'MiPyME'}</strong>
                    </p>
                  </div>

                  <CampoInput label="Nombre de Usuario para Iniciar Sesión *" name="usuario" value={form.usuario} onChange={manejarCambio} disabled={bloqueado} minLength={4} placeholder="Ej. soluciones_centro" required />

                  <div className={styles.filaDos}>
                    <CampoInput label="Contraseña (mínimo 8 caracteres) *" name="contrasena" type="password" value={form.contrasena} onChange={manejarCambio} disabled={bloqueado} minLength={8} placeholder="••••••••" required />
                    <CampoInput label="Confirmar Contraseña *" name="confirmar_contrasena" type="password" value={form.confirmar_contrasena} onChange={manejarCambio} disabled={bloqueado} minLength={8} placeholder="••••••••" required />
                  </div>

                  <AlertaEstado alerta={alerta} />

                  <div className={styles.accionesDoble}>
                    <button type="button" className={styles.botonAtras} onClick={() => irAPaso(4)} disabled={cargando || bloqueado}>← Anterior</button>
                    <button type="submit" className={styles.botonPrincipal} disabled={cargando || bloqueado}>
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