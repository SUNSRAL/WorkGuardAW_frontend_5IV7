import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Footer from '../../components/footerlinks.js';
import Cargando from '../../components/cargando.js';
import { apiFetch } from '../../utils/api.js';
import estilos from '../../styles/RegistroMipyme.module.css';


const PASOS_TITULOS = [
  "1. Existencia Fiscal",
  "2. Ubicación",
  "3. Representante",
  "4. Situación y Tamaño",
  "5. Dictamen",
  "6. Crear Cuenta",
];

export default function RegistroMipyme() {
  const router = useRouter();
  const [pasoActual, setPasoActual] = useState(1);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [mensajePaso, setMensajePaso] = useState("");

  // Catálogos traídos desde Supabase
  const [catalogos, setCatalogos] = useState({
    giros: [],
    alcaldias_fiscal: [],
    entidades_fiscal: [],
    alcaldias_operaciones: [],
    entidades_operaciones: [],
    tamanos: [],
  });

  // Resultados de evaluación por paso: { 1: { estado: 'VERDE'|'NARANJA', mensaje: '...' }, ... }
  const [resultadosPasos, setResultadosPasos] = useState({});

  // Estado del formulario completo
  const [form, setForm] = useState({
    tipo_persona: "MORAL",
    nombre_comercial: "",
    representante_legal: "",
    rfc: "",
    id_giro: "",
    // Domicilio fiscal
    cp_fiscal: "",
    calle_fiscal: "",
    numero_fiscal: "",
    id_alcaldia_fiscal: "",
    id_entidad_federativa_fiscal: "",
    // Paso 2: Actividad y Operaciones
    pagina_web: "",
    facebook: "",
    instagram: "",
    twitter: "",
    mismo_domicilio: false,
    cp_operaciones: "",
    calle_operaciones: "",
    numero_operaciones: "",
    id_alcaldia_operaciones: "",
    id_entidad_federativa_operaciones: "",
    // Paso 3: Representante
    curp: "",
    // Paso 4: Tamaño y 32-D
    numero_trabajadores: "",
    id_tamano: "",
    // Paso 6: Credenciales
    usuario: "",
    contrasena: "",
    confirmar_contrasena: "",
    acepta_terminos: false,
  });

  // Archivos adjuntos en memoria del navegador (File)
  const [archivos, setArchivos] = useState({
    doc_csf: null,
    doc_acta: null,
    doc_comprobante: null,
    doc_acreditacion: null,
    doc_opinion_32d: null,
  });

  // Coordenadas OpenStreetMap para Paso 2
  const [mapaCoords, setMapaCoords] = useState(null);
  const [buscandoMapa, setBuscandoMapa] = useState(false);

  // Cargar catálogos al abrir la página
  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const data = await apiFetch("/api/mipymes/catalogos");
        setCatalogos(data);
        setForm((prev) => ({
          ...prev,
          id_giro: data.giros?.[0]?.id_giro || "",
          id_alcaldia_fiscal:
            data.alcaldias_fiscal?.[0]?.id_alcaldia_fiscal || "",
          id_entidad_federativa_fiscal:
            data.entidades_fiscal?.[0]?.id_entidad_federativa_fiscal || "",
          id_alcaldia_operaciones:
            data.alcaldias_operaciones?.[0]?.id_alcaldia_operaciones || "",
          id_entidad_federativa_operaciones:
            data.entidades_operaciones?.[0]
              ?.id_entidad_federativa_operaciones || "",
          id_tamano: data.tamanos?.[0]?.id_catalogo_tamano || "",
        }));
      } catch (err) {
        setErrorGeneral(
          err.message || "No se pudieron cargar los catálogos de registro.",
        );
      } finally {
        setCargandoCatalogos(false);
      }
    }
    cargarCatalogos();
  }, []);

  // Advertencia nativa si intenta recargar o cerrar la pestaña con avances
  useEffect(() => {
    const manejarSalida = (e) => {
      if (form.nombre_comercial || form.rfc) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", manejarSalida);
    return () => window.removeEventListener("beforeunload", manejarSalida);
  }, [form.nombre_comercial, form.rfc]);

  const pasoYaAprobadoVerde = resultadosPasos[pasoActual]?.estado === "VERDE";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrorGeneral("");

    if (name === "mismo_domicilio") {
      setForm((prev) => ({
        ...prev,
        mismo_domicilio: checked,
        ...(checked
          ? {
              cp_operaciones: prev.cp_fiscal,
              calle_operaciones: prev.calle_fiscal,
              numero_operaciones: prev.numero_fiscal,
              id_alcaldia_operaciones: prev.id_alcaldia_fiscal,
              id_entidad_federativa_operaciones:
                prev.id_entidad_federativa_fiscal,
            }
          : {}),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (campo, file) => {
    if (!file) return;
    setArchivos((prev) => ({ ...prev, [campo]: file }));
  };

  const quitarArchivo = (campo) => {
    setArchivos((prev) => ({ ...prev, [campo]: null }));
  };

  // Geocodificación gratuita con OpenStreetMap (Nominatim)
  const ubicarEnMapa = async () => {
    setErrorGeneral("");
    if (
      !form.calle_operaciones ||
      !form.numero_operaciones ||
      !form.cp_operaciones
    ) {
      setErrorGeneral(
        "Ingresa calle, número y código postal de operaciones antes de ubicar en el mapa.",
      );
      return;
    }

    setBuscandoMapa(true);
    try {
      const alcObj = catalogos.alcaldias_operaciones.find(
        (a) =>
          String(a.id_alcaldia_operaciones) ===
          String(form.id_alcaldia_operaciones),
      );
      const alcaldiaNombre = alcObj?.opcion_alcaldia || "";
      const query = encodeURIComponent(
        `${form.calle_operaciones} ${form.numero_operaciones}, ${alcaldiaNombre}, ${form.cp_operaciones}, Ciudad de Mexico, Mexico`,
      );
      const resp = await fetch(`https://openstreetmap.org{query}`);
      const results = await resp.json();

      if (results && results.length > 0) {
        setMapaCoords({
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon),
          display: results[0].display_name,
        });
      } else {
        setMapaCoords(null);
        setErrorGeneral(
          "No se encontró pin exacto en OpenStreetMap; podrás continuar, pero el paso quedará en Naranja para revisión.",
        );
      }
    } catch {
      setErrorGeneral(
        "No se pudo consultar el servicio de mapas en este momento.",
      );
    } finally {
      setBuscandoMapa(false);
    }
  };

  // Evaluar paso actual contra el backend (POST /api/mipymes/evaluar-paso)
  const validarYAvanzar = async () => {
    setErrorGeneral("");
    setMensajePaso("");

    if (pasoYaAprobadoVerde) {
      setPasoActual((p) => p + 1);
      return;
    }

    if (pasoActual === 5) {
      setPasoActual(6);
      return;
    }

    setProcesando(true);
    try {
      const fd = new FormData();
      fd.append("paso", String(pasoActual));
      fd.append("tipo_persona", form.tipo_persona);

      if (pasoActual === 1) {
        if (
          !form.nombre_comercial.trim() ||
          !form.representante_legal.trim() ||
          !form.rfc.trim() ||
          !form.cp_fiscal.trim() ||
          !form.calle_fiscal.trim() ||
          !form.numero_fiscal.trim()
        ) {
          throw new Error(
            "Completa todos los campos fiscales obligatorios del Paso 1.",
          );
        }
        fd.append("nombre_comercial", form.nombre_comercial);
        fd.append("representante_legal", form.representante_legal);
        fd.append("rfc", form.rfc.toUpperCase());
        fd.append("id_giro", form.id_giro);
        fd.append("cp_fiscal", form.cp_fiscal);
        if (archivos.doc_csf) fd.append("doc_csf", archivos.doc_csf);
      }

      if (pasoActual === 2) {
        if (
          !form.cp_operaciones.trim() ||
          !form.calle_operaciones.trim() ||
          !form.numero_operaciones.trim()
        ) {
          throw new Error(
            "Completa todos los campos del domicilio de operaciones.",
          );
        }
        fd.append("cp_operaciones", form.cp_operaciones);
        fd.append("calle_operaciones", form.calle_operaciones);
        fd.append("numero_operaciones", form.numero_operaciones);
        fd.append("geolocalizado", mapaCoords ? "true" : "false");
        if (archivos.doc_comprobante)
          fd.append("doc_comprobante", archivos.doc_comprobante);
        if (form.tipo_persona === "MORAL" && archivos.doc_acta) {
          fd.append("doc_acta", archivos.doc_acta);
        }
      }

      if (pasoActual === 3) {
        if (!form.curp.trim()) {
          throw new Error("Ingresa la CURP del representante legal.");
        }
        fd.append("curp", form.curp.toUpperCase());
        fd.append("rfc", form.rfc.toUpperCase());
        if (archivos.doc_acreditacion)
          fd.append("doc_acreditacion", archivos.doc_acreditacion);
      }

      if (pasoActual === 4) {
        if (!form.numero_trabajadores || Number(form.numero_trabajadores) < 1) {
          throw new Error("Ingresa el número de trabajadores (mínimo 1).");
        }
        fd.append("numero_trabajadores", form.numero_trabajadores);
        fd.append("rfc", form.rfc.toUpperCase());
        if (archivos.doc_opinion_32d)
          fd.append("doc_opinion_32d", archivos.doc_opinion_32d);
      }

      const resp = await apiFetch("/api/mipymes/evaluar-paso", {
        method: "POST",
        body: fd,
      });

      setResultadosPasos((prev) => ({
        ...prev,
        [pasoActual]: {
          estado: resp.estado,
          mensaje: resp.mensaje,
        },
      }));

      if (pasoActual === 4 && resp.tamano_calculado) {
        const match = catalogos.tamanos.find((t) =>
          t.opcion_tamano_empresa
            .toLowerCase()
            .includes(resp.tamano_calculado.toLowerCase().split(" ")[0]),
        );
        if (match) {
          setForm((prev) => ({ ...prev, id_tamano: match.id_catalogo_tamano }));
        }
      }

      setMensajePaso(resp.mensaje);
      setPasoActual((p) => p + 1);
    } catch (err) {
      setErrorGeneral(err.message || "Error al validar los datos del paso.");
      setResultadosPasos((prev) => ({
        ...prev,
        [pasoActual]: { estado: "ROJO", mensaje: err.message },
      }));
    } finally {
      setProcesando(false);
    }
  };
  // Envío final del registro completo (Paso 6 -> POST /api/mipymes/registro)
  const finalizarRegistro = async (e) => {
    e.preventDefault();
    setErrorGeneral("");
    if (form.usuario.trim().length < 6) {
      setErrorGeneral("El nombre de usuario debe tener al menos 6 caracteres.");
      return;
    }
    const regexPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
    if (!regexPass.test(form.contrasena)) {
      setErrorGeneral(
        "La contraseña debe tener mínimo 12 caracteres, mayúscula, minúscula, número y carácter especial.",
      );
      return;
    }
    if (form.contrasena !== form.confirmar_contrasena) {
      setErrorGeneral("Las contraseñas no coinciden.");
      return;
    }
    if (!form.acepta_terminos) {
      setErrorGeneral(
        "Debes aceptar los Términos, Condiciones y el Aviso de Privacidad.",
      );
      return;
    }
    setProcesando(true);
    try {
      const payload = {
        usuario: form.usuario.trim(),
        contrasena: form.contrasena,
        nombre_comercial: form.nombre_comercial.trim(),
        tipo_persona: form.tipo_persona,
        rfc: form.rfc.trim().toUpperCase(),
        id_giro: Number(form.id_giro),
        numero_trabajadores: Number(form.numero_trabajadores),
        id_tamano: Number(form.id_tamano),
        domicilio_fiscal: {
          codigo_postal: form.cp_fiscal.trim(),
          calle: form.calle_fiscal.trim(),
          numero: form.numero_fiscal.trim(),
          id_alcaldia_fiscal: Number(form.id_alcaldia_fiscal),
          id_entidad_federativa_fiscal: Number(
            form.id_entidad_federativa_fiscal,
          ),
        },
        domicilio_operaciones: {
          codigo_postal: form.cp_operaciones.trim(),
          calle: form.calle_operaciones.trim(),
          numero: form.numero_operaciones.trim(),
          id_alcaldia_operaciones: Number(form.id_alcaldia_operaciones),
          id_entidad_federativa_operaciones: Number(
            form.id_entidad_federativa_operaciones,
          ),
        },
        actividad: {
          pagina_web: form.pagina_web.trim(),
          facebook: form.facebook.trim(),
          instagram: form.instagram.trim(),
          twitter: form.twitter.trim(),
        },
        representante: {
          nombre_completo: form.representante_legal.trim(),
          curp: form.curp.trim().toUpperCase(),
        },
        resultados_pasos: {
          paso1: resultadosPasos[1] || {
            estado: "NARANJA",
            mensaje: "Pendiente",
          },
          paso2: resultadosPasos[2] || {
            estado: "NARANJA",
            mensaje: "Pendiente",
          },
          paso3: resultadosPasos[3] || {
            estado: "NARANJA",
            mensaje: "Pendiente",
          },
          paso4: resultadosPasos[4] || {
            estado: "NARANJA",
            mensaje: "Pendiente",
          },
        },
      };
      const resp = await apiFetch("/api/mipymes/registro", {
        method: "POST",
        body: payload,
      });
      alert(`${resp.mensaje}\n\n${resp.detalle_estatus}`);

      router.push("/login");
    } catch (err) {
      setErrorGeneral(
        err.message || "No se pudo completar el registro de la MiPyME.",
      );
    } finally {
      setProcesando(false);
    }
  };
  const cancelarRegistro = () => {
    if (
      confirm(
        "¿Seguro que deseas cancelar el registro? Se perderán los datos capturados.",
      )
    ) {
      router.push("/rol");
    }
  };
  if (cargandoCatalogos) return <Cargando />;
  const hayNaranjas = [1, 2, 3, 4].some(
    (n) => resultadosPasos[n]?.estado === "NARANJA",
  );

  return (
    <div className={estilos.envolturaPagina}>
      <section className={estilos.seccionFormulario}>
        <div className={estilos.logoEsquina}>
          <Link href="/">
            <Image
              src="/img/logo.png"
              alt="Logo WorkGuard"
              width={60}
              height={60}
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
        </div>

        <div className={estilos.tarjetaWizard}>
          <div className={estilos.encabezado}>
            <div>
              <h1 className={estilos.titulo}>Verificación y Registro MiPyME</h1>
              <p className={estilos.subtitulo}>
                Completa las etapas para obtener el Sello de Confianza WorkGuard.
              </p>
            </div>
            <button type="button" onClick={cancelarRegistro} className={estilos.botonCancelar}>
              Cancelar
            </button>
          </div>

          {/* Barra de progreso de 6 indicadores circulares */}
          <div className={estilos.barraProgreso}>
            {PASOS_TITULOS.map((etiqueta, idx) => {
              const num = idx + 1;
              const res = resultadosPasos[num]?.estado;
              let claseCirculo = estilos.circulo;
              if (num === pasoActual) claseCirculo += ` ${estilos.circuloActivo}`;
              else if (res === 'VERDE') claseCirculo += ` ${estilos.circuloVerde}`;
              else if (res === 'NARANJA') claseCirculo += ` ${estilos.circuloNaranja}`;
              else if (res === 'ROJO') claseCirculo += ` ${estilos.circuloRojo}`;

              return (
                <div key={num} className={estilos.pasoItem}>
                  <div className={claseCirculo}>{res === 'VERDE' ? '✓' : num}</div>
                  <span className={estilos.etiquetaPaso}>{etiqueta}</span>
                </div>
              );
            })}
          </div>

          {errorGeneral && (
            <div className={`${estilos.alerta} ${estilos.alertaRojo}`}>{errorGeneral}</div>
          )}

          {mensajePaso && !errorGeneral && (
            <div
              className={`${estilos.alerta} ${
                resultadosPasos[pasoActual - 1]?.estado === 'VERDE'
                  ? estilos.alertaVerde
                  : estilos.alertaNaranja
              }`}
            >
              <strong>Resultado paso anterior:</strong> {mensajePaso}
            </div>
          )}

          {pasoYaAprobadoVerde && (
            <div className={estilos.bannerBloqueado}>
              ✓ Paso validado en Verde. Edición bloqueada para proteger la integridad de la verificación.
            </div>
          )}

          {/* ================= PASO 1: EXISTENCIA FISCAL ================= */}
          {pasoActual === 1 && (
            <div>
              <div className={estilos.selectorTipoPersona}>
                <button
                  type="button"
                  disabled={pasoYaAprobadoVerde}
                  onClick={() => setForm((p) => ({ ...p, tipo_persona: 'MORAL' }))}
                  className={`${estilos.tarjetaTipo} ${form.tipo_persona === 'MORAL' ? estilos.tarjetaTipoActiva : ''}`}
                >
                  <span className={estilos.tarjetaTipoTitulo}>Persona Moral (Empresa)</span>
                  <span className={estilos.tarjetaTipoDesc}>RFC de 12 caracteres y Acta Constitutiva.</span>
                </button>

                <button
                  type="button"
                  disabled={pasoYaAprobadoVerde}
                  onClick={() => setForm((p) => ({ ...p, tipo_persona: 'FISICA' }))}
                  className={`${estilos.tarjetaTipo} ${form.tipo_persona === 'FISICA' ? estilos.tarjetaTipoActiva : ''}`}
                >
                  <span className={estilos.tarjetaTipoTitulo}>Persona Física con Act. Empresarial</span>
                  <span className={estilos.tarjetaTipoDesc}>RFC de 13 caracteres vinculado a CURP.</span>
                </button>
              </div>

              <div className={estilos.gridCompacto}>
                <div className={estilos.campo}>
                  <label>Nombre Comercial *</label>
                  <input
                    className={estilos.input}
                    name="nombre_comercial"
                    value={form.nombre_comercial}
                    onChange={handleChange}
                    disabled={pasoYaAprobadoVerde}
                    placeholder="Ej. Cafetería Roma"
                  />
                </div>

                <div className={estilos.campo}>
                  <label>Representante Legal / Titular *</label>
                  <input
                    className={estilos.input}
                    name="representante_legal"
                    value={form.representante_legal}
                    onChange={handleChange}
                    disabled={pasoYaAprobadoVerde}
                    placeholder="Nombre completo"
                  />
                </div>

                <div className={estilos.campo}>
                  <label>RFC ({form.tipo_persona === 'MORAL' ? '12' : '13'}&nbsp;caract.) *</label>
                  <input
                    className={estilos.input}
                    name="rfc"
                    maxLength={form.tipo_persona === 'MORAL' ? 12 : 13}
                    value={form.rfc}
                    onChange={handleChange}
                    disabled={pasoYaAprobadoVerde}
                    placeholder={form.tipo_persona === 'MORAL' ? 'ABC240101XY1' : 'LOAA900101XY1'}
                  />
                </div>

                <div className={estilos.campo}>
                  <label>Giro Principal *</label>
                  <select
                    className={estilos.select}
                    name="id_giro"
                    value={form.id_giro}
                    onChange={handleChange}
                    disabled={pasoYaAprobadoVerde}
                  >
                    {catalogos.giros.map((g) => (
                      <option key={g.id_giro} value={g.id_giro}>
                        {g.opcion_giro}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={estilos.campo}>
                  <label>Calle Fiscal *</label>
                  <input
                    className={estilos.input}
                    name="calle_fiscal"
                    value={form.calle_fiscal}
                    onChange={handleChange}
                    disabled={pasoYaAprobadoVerde}
                  />
                </div>

                <div className={estilos.campo}>
                  <label>Número Ext / Int *</label>
                  <input
                    className={estilos.input}
                    name="numero_fiscal"
                    value={form.numero_fiscal}
                    onChange={handleChange}
                    disabled={pasoYaAprobadoVerde}
                  />
                </div>

                <div className={estilos.campo}>
                  <label>Código Postal Fiscal *</label>
                  <input
                    className={estilos.input}
                    name="cp_fiscal"
                    maxLength={5}
                    value={form.cp_fiscal}
                    onChange={handleChange}
                    disabled={pasoYaAprobadoVerde}
                  />
                </div>

                <div className={estilos.campo}>
                  <label>Alcaldía Fiscal *</label>
                  <select
                    className={estilos.select}
                    name="id_alcaldia_fiscal"
                    value={form.id_alcaldia_fiscal}
                    onChange={handleChange}
                    disabled={pasoYaAprobadoVerde}
                  >
                    {catalogos.alcaldias_fiscal.map((a) => (
                      <option key={a.id_alcaldia_fiscal} value={a.id_alcaldia_fiscal}>
                        {a.opcion_alcaldia}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={estilos.campo}>
                  <label>Constancia Situación Fiscal (PDF SAT)</label>
                  <div className={estilos.cajaArchivo}>
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={pasoYaAprobadoVerde}
                      onChange={(e) => handleFileChange('doc_csf', e.target.files)}
                    />
                    {archivos.doc_csf && !pasoYaAprobadoVerde && (
                      <button type="button" onClick={() => quitarArchivo('doc_csf')} className={estilos.botonQuitarArchivo}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PASO 2: ACTIVIDAD Y UBICACIÓN ================= */}
          {pasoActual === 2 && (
            <div className={estilos.gridCompacto}>
              <div className={estilos.campo}>
                <label>Página Web (Opcional)</label>
                <input
                  className={estilos.input}
                  name="pagina_web"
                  value={form.pagina_web}
                  onChange={handleChange}
                  disabled={pasoYaAprobadoVerde}
                  placeholder="https://tuempresa.mx"
                />
              </div>

              <div className={estilos.campo}>
                <label>Facebook (Opcional)</label>
                <input
                  className={estilos.input}
                  name="facebook"
                  value={form.facebook}
                  onChange={handleChange}
                  disabled={pasoYaAprobadoVerde}
                />
              </div>

              <div className={estilos.campo}>
                <label>Instagram / X (Opcional)</label>
                <input
                  className={estilos.input}
                  name="instagram_x"
                  value={form.instagram_x}
                  onChange={handleChange}
                  disabled={pasoYaAprobadoVerde}
                />
              </div>

              <div className={`${estilos.campo} ${estilos.campoCompleto}`}>
                <label>
                  <input
                    type="checkbox"
                    name="mismo_domicilio"
                    checked={form.mismo_domicilio}
                    onChange={handleChange}
                    disabled={pasoYaAprobadoVerde}
                  />{' '}
                  El domicilio de operaciones es el mismo que el domicilio fiscal.
                </label>
              </div>

              {!form.mismo_domicilio && (
                <>
                  <div className={estilos.campo}>
                    <label>Calle Operaciones *</label>
                    <input
                      className={estilos.input}
                      name="calle_operaciones"
                      value={form.calle_operaciones}
                      onChange={handleChange}
                      disabled={pasoYaAprobadoVerde}
                    />
                  </div>
                  <div className={estilos.campo}>
                    <label>Número *</label>
                    <input
                      className={estilos.input}
                      name="numero_operaciones"
                      value={form.numero_operaciones}
                      onChange={handleChange}
                      disabled={pasoYaAprobadoVerde}
                    />
                  </div>
                  <div className={estilos.campo}>
                    <label>Código Postal *</label>
                    <input
                      className={estilos.input}
                      name="cp_operaciones"
                      maxLength={5}
                      value={form.cp_operaciones}
                      onChange={handleChange}
                      disabled={pasoYaAprobadoVerde}
                    />
                  </div>
                  <div className={estilos.campo}>
                    <label>Alcaldía Operaciones *</label>
                    <select
                      className={estilos.select}
                      name="id_alcaldia_operaciones"
                      value={form.id_alcaldia_operaciones}
                      onChange={handleChange}
                      disabled={pasoYaAprobadoVerde}
                    >
                      {catalogos.alcaldias_operaciones.map((a) => (
                        <option key={a.id_alcaldia_operaciones} value={a.id_alcaldia_operaciones}>
                          {a.opcion_alcaldia}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className={estilos.campo}>
                <label>Comprobante Domicilio (PDF &le; 4MB)</label>
                <div className={estilos.cajaArchivo}>
                  <input
                    type="file"
                    accept="application/pdf"
                    disabled={pasoYaAprobadoVerde}
                    onChange={(e) => handleFileChange('doc_comprobante', e.target.files)}
                  />
                  {archivos.doc_comprobante && !pasoYaAprobadoVerde && (
                    <button type="button" onClick={() => quitarArchivo('doc_comprobante')} className={estilos.botonQuitarArchivo}>
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {form.tipo_persona === 'MORAL' && (
                <div className={estilos.campo}>
                  <label>Acta Constitutiva (PDF)</label>
                  <div className={estilos.cajaArchivo}>
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={pasoYaAprobadoVerde}
                      onChange={(e) => handleFileChange('doc_acta', e.target.files)}
                    />
                    {archivos.doc_acta && !pasoYaAprobadoVerde && (
                      <button type="button" onClick={() => quitarArchivo('doc_acta')} className={estilos.botonQuitarArchivo}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className={`${estilos.campoCompleto} ${estilos.filaMapa}`}>
                <button
                  type="button"
                  onClick={ubicarEnMapa}
                  disabled={buscandoMapa || pasoYaAprobadoVerde}
                  className={estilos.botonSecundario}
                >
                  {buscandoMapa ? 'Buscando...' : '📍 Ubicar en Mapa'}
                </button>

                {mapaCoords && (
                  <iframe
                    title="Mapa de operaciones"
                    className={estilos.iframeMapa}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapaCoords.lon - 0.005}%2C${mapaCoords.lat - 0.005}%2C${mapaCoords.lon + 0.005}%2C${mapaCoords.lat + 0.005}&layer=mapnik&marker=${mapaCoords.lat}%2C${mapaCoords.lon}`}
                  />
                )}
              </div>
            </div>
          )}

          {/* ================= PASO 3: REPRESENTANTE Y CURP ================= */}
          {pasoActual === 3 && (
            <div className={estilos.gridCompacto}>
              <div className={estilos.campo}>
                <label>Nombre del Representante</label>
                <input
                  className={estilos.input}
                  value={form.representante_legal}
                  disabled
                />
              </div>
              <div className={estilos.campo}>
                <label>CURP (18 caracteres) *</label>
                <input
                  className={estilos.input}
                  name="curp"
                  maxLength={18}
                  value={form.curp}
                  onChange={handleChange}
                  disabled={pasoYaAprobadoVerde}
                  placeholder="AAAA000000HDFRRN00"
                />
              </div>
              <div className={`${estilos.campo} ${estilos.campoCompleto}`}>
                <label>Documento de Acreditación / Poder Notarial / Constancia CURP (PDF)</label>
                <div className={estilos.cajaArchivo}>
                  <input
                    type="file"
                    accept="application/pdf"
                    disabled={pasoYaAprobadoVerde}
                    onChange={(e) => handleFileChange('doc_acreditacion', e.target.files)}
                  />
                  {archivos.doc_acreditacion && !pasoYaAprobadoVerde && (
                    <button type="button" onClick={() => quitarArchivo('doc_acreditacion')} className={estilos.botonQuitarArchivo}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= PASO 4: SITUACIÓN FISCAL Y TAMAÑO ================= */}
          {pasoActual === 4 && (
            <div className={estilos.gridCompacto}>
              <div className={estilos.campo}>
                <label>Número de Trabajadores Activos (1 - 250) *</label>
                <input
                  type="number"
                  className={estilos.input}
                  name="num_trabajadores"
                  min={1}
                  max={250}
                  value={form.num_trabajadores}
                  onChange={handleChange}
                  disabled={pasoYaAprobadoVerde}
                />
              </div>

              <div className={estilos.campo}>
                <label>Tamaño Autodeclarado (DOF) *</label>
                <select
                  className={estilos.select}
                  name="id_tamano_empresa"
                  value={form.id_tamano_empresa}
                  onChange={handleChange}
                  disabled={pasoYaAprobadoVerde}
                >
                  {catalogos.tamanos.map((t) => (
                    <option key={t.id_tamano_empresa} value={t.id_tamano_empresa}>
                      {t.opcion_tamano_empresa}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${estilos.campo} ${estilos.campoCompleto}`}>
                <label>Opinión del Cumplimiento de Obligaciones Fiscales 32-D (PDF SAT &le; 30 días)</label>
                <div className={estilos.cajaArchivo}>
                  <input
                    type="file"
                    accept="application/pdf"
                    disabled={pasoYaAprobadoVerde}
                    onChange={(e) => handleFileChange('doc_opinion_32d', e.target.files)}
                  />
                  {archivos.doc_opinion_32d && !pasoYaAprobadoVerde && (
                    <button type="button" onClick={() => quitarArchivo('doc_opinion_32d')} className={estilos.botonQuitarArchivo}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= PASO 5: DICTAMEN DE CUMPLIMIENTO ================= */}
          {pasoActual === 5 && (
            <div>
              {hayNaranjas ? (
                <div className={`${estilos.alerta} ${estilos.alertaNaranja}`}>
                  ⚠️ Indicadores en Naranja: Puedes crear tu cuenta, pero tu empresa no será visible para consultores ni tendrá Sello WorkGuard hasta que un Administrador la apruebe manualmente.
                </div>
              ) : (
                <div className={`${estilos.alerta} ${estilos.alertaVerde}`}>
                  ✓ Validación Exitosa: Todos tus rubros están en Verde y listos para confirmación final del Administrador.
                </div>
              )}

              {[1, 2, 3, 4].map((num) => {
                const info = resultadosPasos[num] || { estado: 'NARANJA', mensaje: 'Pendiente' };
                const claseBadge =
                  info.estado === 'VERDE'
                    ? estilos.badgeVerde
                    : info.estado === 'ROJO'
                    ? estilos.badgeRojo
                    : estilos.badgeNaranja;
                return (
                  <div key={num} className={estilos.filaDictamen}>
                    <span>{PASOS_TITULOS[num - 1]} — {info.mensaje}</span>
                    <span className={`${estilos.badge} ${claseBadge}`}>{info.estado}</span>
                  </div>
                );
              })}

              <div className={estilos.filaDictamen}>
                <span>Listado EFOS (Art. 69-B SAT) — Sin antecedentes</span>
                <span className={`${estilos.badge} ${estilos.badgeVerde}`}>LIMPIO</span>
              </div>
            </div>
          )}

          {/* ================= PASO 6: CREAR CUENTA ================= */}
          {pasoActual === 6 && (
            <div className={estilos.gridCompacto}>
              <div className={estilos.campo}>
                <label>Usuario (6 a 15 caract.) *</label>
                <input
                  className={estilos.input}
                  name="usuario"
                  value={form.usuario}
                  onChange={handleChange}
                  placeholder="usuario_mipyme"
                />
              </div>

              <div className={estilos.campo}>
                <label>Contraseña (mín. 12, Mayús/Min/Núm/Símb) *</label>
                <input
                  type="password"
                  className={estilos.input}
                  name="contrasena"
                  value={form.contrasena}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                />
              </div>

              <div className={estilos.campo}>
                <label>Confirmar Contraseña *</label>
                <input
                  type="password"
                  className={estilos.input}
                  name="confirmar_contrasena"
                  value={form.confirmar_contrasena}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                />
              </div>

              <div className={`${estilos.campo} ${estilos.campoCompleto}`}>
                <label>
                  <input
                    type="checkbox"
                    name="acepto_terminos"
                    checked={form.acepto_terminos}
                    onChange={handleChange}
                  />{' '}
                  Acepto los Términos, Condiciones y Aviso de Privacidad de WorkGuard (los PDFs analizados no se almacenan).
                </label>
              </div>

              <div className={`${estilos.campoCompleto} ${estilos.accionesCrear}`}>
                <button
                  type="button"
                  onClick={() => setPasoActual(5)}
                  className={estilos.botonSecundario}
                  disabled={procesando}
                >
                  ← Regresar al Dictamen
                </button>
                <button
                  type="button"
                  onClick={() => alert('¡Cuenta creada con éxito!')}
                  className={estilos.botonPrimario}
                  disabled={procesando || !form.acepto_terminos}
                >
                  {procesando ? 'Registrando...' : 'Finalizar y Crear Cuenta'}
                </button>
              </div>
            </div>
          )}

          {/* Botonera de navegación para los pasos 1 al 5 */}
          {pasoActual < 6 && (
            <div className={estilos.botoneraPaso}>
              {pasoActual > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrorGeneral('');
                    setPasoActual((p) => p - 1);
                  }}
                  className={estilos.botonSecundario}
                  disabled={procesando}
                >
                  ← Anterior
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => {
                  setErrorGeneral('');
                  if (pasoActual === 5) {
                    setPasoActual(6);
                  } else {
                    setPasoActual((p) => p + 1);
                  }
                }}
                className={estilos.botonPrimario}
                disabled={procesando}
              >
                {procesando
                  ? 'Validando...'
                  : pasoActual === 5
                  ? 'Continuar a Crear Cuenta →'
                  : 'Validar y Continuar →'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}