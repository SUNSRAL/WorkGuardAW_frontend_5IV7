import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Reportar.module.css';
import { apiFetch } from '../../utils/api';

export default function Reporte() {

    const router = useRouter();

    // Obtenemos el ID de la MiPyME desde la URL.
    const idMipyme = router.query.id_mipyme;

    // Guardamos un solo motivo.
    const [motivo, setMotivo] = useState('');

    // Guardamos el motivo personalizado cuando seleccionan "Otro".
    const [otroMotivo, setOtroMotivo] = useState('');

    // Guardamos la descripción del caso.
    const [descripcion, setDescripcion] = useState('');

    // Guardamos el archivo PDF seleccionado.
    const [archivo, setArchivo] = useState(null);

    // Mensajes del formulario.
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    // Estado del envío.
    const [enviando, setEnviando] = useState(false);


    // MOTIVOS DISPONIBLES.
    const opcionesMotivo = [
        {
            valor: 'COBRO_POR_CONTRATACION',
            texto: 'Cobro por contratación'
        },
        {
            valor: 'OFERTA_FALSA',
            texto: 'Oferta falsa'
        },
        {
            valor: 'SUPLANTACION_DE_IDENTIDAD',
            texto: 'Suplantación de identidad'
        },
        {
            valor: 'CONDICIONES_ABUSIVAS',
            texto: 'Condiciones abusivas'
        },
        {
            valor: 'EMPRESA_INEXISTENTE',
            texto: 'Empresa inexistente en la práctica'
        },
        {
            valor: 'OTRO',
            texto: 'Otro'
        }
    ];


    // SELECCIONAR MOTIVO.
    function manejarMotivo(event) {

        const nuevoMotivo = event.target.value;

        setMotivo(nuevoMotivo);

        // Si ya no selecciona "Otro", limpiamos el texto.
        if (nuevoMotivo !== 'OTRO') {
            setOtroMotivo('');
        }

        setError('');
        setExito('');
    }


    // SELECCIONAR ARCHIVO.
    function manejarArchivo(event) {

        const archivoSeleccionado = event.target.files[0];

        setError('');
        setExito('');

        if (!archivoSeleccionado) {
            setArchivo(null);
            return;
        }

        // Comprobamos que sea un PDF.
        if (
            archivoSeleccionado.type !== 'application/pdf' ||
            !archivoSeleccionado.name.toLowerCase().endsWith('.pdf')
        ) {
            setError('El archivo debe tener formato PDF.');
            setArchivo(null);
            event.target.value = '';
            return;
        }

        // Tamaño máximo: 5 MB.
        const maximo = 5 * 1024 * 1024;

        if (archivoSeleccionado.size > maximo) {
            setError('El PDF no debe superar los 5 MB.');
            setArchivo(null);
            event.target.value = '';
            return;
        }

        setArchivo(archivoSeleccionado);
    }


    // VALIDAR ID DE LA MIPYME.
    const idMipymeValido =
        router.isReady &&
        typeof idMipyme === 'string' &&
        /^\d+$/.test(idMipyme) &&
        Number(idMipyme) > 0;


    // COMPROBAR SI EL FORMULARIO ESTÁ COMPLETO.
    const formularioValido =
        idMipymeValido &&
        motivo !== '' &&
        (motivo !== 'OTRO' || otroMotivo.trim() !== '') &&
        descripcion.trim() !== '' &&
        descripcion.trim().length <= 2000 &&
        archivo !== null;


    // ENVIAR REPORTE.
    async function enviarReporte(event) {

        event.preventDefault();

        setError('');
        setExito('');

        // Evitamos enviar formularios incompletos.
        if (!formularioValido) {
            setError('Debes completar todos los campos.');
            return;
        }

        try {

            setEnviando(true);

            // Creamos el paquete que enviaremos al backend.
            const datos = new FormData();

            datos.append('id_mipyme', String(idMipyme));
            datos.append('motivo', motivo);
            datos.append('otroMotivo', otroMotivo);
            datos.append('descripcion', descripcion);
            datos.append('archivo', archivo);


            // Enviamos la información mediante apiFetch.
            const respuesta = await apiFetch('/api/reportes', {
                method: 'POST',
                body: datos
            });


            // apiFetch devuelve directamente los datos JSON.
            setExito(
                respuesta.mensaje || '¡Reporte enviado exitosamente!'
            );


            // LIMPIAMOS EL FORMULARIO.
            setMotivo('');
            setOtroMotivo('');
            setDescripcion('');
            setArchivo(null);

            document.getElementById('archivo').value = '';

        } catch (error) {

            // Mostramos el error enviado por el backend.
            setError(
                error.message || 'Ocurrió un error al enviar el reporte.'
            );

        } finally {

            setEnviando(false);

        }
    }


    return (

        <main className={styles.contenedor}>

            {/* ENCABEZADO */}

            <header className={styles.encabezado}>

                <img
                    src="/img/logo.png"
                    alt="Logo WorkGuard"
                    className={styles.logoEsquina}
                />

            </header>


            {/* CONTENIDO PRINCIPAL */}

            <section className={styles.contenido}>

                {/* LADO IZQUIERDO */}

                <div className={styles.panelImagen}>

                    <img
                        src="/img/reporte.png"
                        alt="Ilustración de reporte"
                        className={styles.ilustracion}
                    />

                    <h2>Tu seguridad es importante</h2>

                    <p>
                        Ayúdanos a mantener un entorno laboral
                        seguro y confiable. Si identificas alguna
                        irregularidad, puedes reportarla aquí.
                    </p>

                </div>


                {/* LADO DERECHO */}

                <div className={styles.panelFormulario}>

                    <h1>Reporte</h1>

                    <p className={styles.subtitulo}>
                        Completa los siguientes campos para
                        registrar una incidencia.
                    </p>


                    <form onSubmit={enviarReporte}>

                        {/* MOTIVO DEL REPORTE */}

                        <div className={styles.grupo}>

                            <label className={styles.tituloCampo}>
                                Motivo del reporte *
                            </label>

                            <div className={styles.opciones}>

                                {opcionesMotivo.map((opcion) => (

                                    <label
                                        key={opcion.valor}
                                        className={styles.opcion}
                                    >

                                        <input
                                            type="radio"
                                            name="motivo"
                                            value={opcion.valor}
                                            checked={motivo === opcion.valor}
                                            onChange={manejarMotivo}
                                        />

                                        <span>
                                            {opcion.texto}
                                        </span>

                                    </label>

                                ))}

                            </div>

                        </div>


                        {/* CAMPO PARA OTRO MOTIVO */}

                        {motivo === 'OTRO' && (

                            <div className={styles.grupo}>

                                <label htmlFor="otroMotivo">
                                    Especifica otro motivo *
                                </label>

                                <input
                                    id="otroMotivo"
                                    type="text"
                                    placeholder="Escribe el motivo"
                                    value={otroMotivo}
                                    onChange={(e) => setOtroMotivo(e.target.value)}
                                />

                            </div>

                        )}


                        {/* DESCRIPCIÓN DEL CASO */}

                        <div className={styles.grupo}>

                            <label htmlFor="descripcion">
                                Descripción del caso *
                            </label>

                            <textarea
                                id="descripcion"
                                placeholder="Describe detalladamente lo sucedido..."
                                value={descripcion}
                                maxLength={2000}
                                onChange={(e) => {
                                    setDescripcion(e.target.value);
                                    setError('');
                                    setExito('');
                                }}
                            />

                            <small>
                                {descripcion.length}/2000 caracteres.
                            </small>

                        </div>


                        {/* ADJUNTAR ARCHIVO */}

                        <div className={styles.grupo}>

                            <label htmlFor="archivo">
                                Adjuntar evidencia (PDF) *
                            </label>

                            <input
                                id="archivo"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={manejarArchivo}
                            />

                            <small>
                                Solo un archivo PDF de máximo 5 MB.
                            </small>

                            {archivo && (

                                <p className={styles.archivoSeleccionado}>
                                    Archivo seleccionado: {archivo.name}
                                </p>

                            )}

                        </div>


                        {/* MENSAJES */}

                        {error && (

                            <p className={styles.error}>
                                {error}
                            </p>

                        )}

                        {exito && (

                            <p className={styles.exito}>
                                {exito}
                            </p>

                        )}


                        {/* BOTÓN DE ENVÍO */}

                        <button
                            type="submit"
                            disabled={!formularioValido || enviando}
                            className={styles.botonEnviar}
                        >

                            {enviando ? 'Enviando...' : 'Enviar reporte'}

                        </button>

                    </form>

                </div>

            </section>

        </main>

    );

}