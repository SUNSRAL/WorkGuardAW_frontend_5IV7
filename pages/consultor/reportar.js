import { useState } from 'react';
import styles from '../../styles/Reportar.module.css';
import { apiFetch } from '../../utils/api';
import Image from "next/image";

export default function Reporte() {

    // Guardamos los motivos seleccionados
    const [motivos, setMotivos] = useState([]);

    // Guardamos el motivo personalizado cuando seleccionan "Otro"
    const [otroMotivo, setOtroMotivo] = useState('');

    // Guardamos la descripción del caso
    const [descripcion, setDescripcion] = useState('');

    // Guardamos el archivo PDF seleccionado
    const [archivo, setArchivo] = useState(null);

    // Guardamos los mensajes de error
    const [error, setError] = useState('');

    // Guardamos el mensaje de éxito
    const [exito, setExito] = useState('');

    // Guardamos el estado del envío
    const [enviando, setEnviando] = useState(false);


    // Función para seleccionar o deseleccionar motivos
    function manejarMotivos(event) {

        const { value, checked } = event.target;

        if (checked) {
            setMotivos([...motivos, value]);
        } else {
            setMotivos(motivos.filter(motivo => motivo !== value));
        }

        setError('');
        setExito('');
    }


    // Función para seleccionar el archivo
    function manejarArchivo(event) {

        const archivoSeleccionado = event.target.files[0];

        setError('');
        setExito('');

        if (!archivoSeleccionado) {
            setArchivo(null);
            return;
        }

        // Comprobamos que sea un PDF
        if (
            archivoSeleccionado.type !== 'application/pdf' ||
            !archivoSeleccionado.name.toLowerCase().endsWith('.pdf')
        ) {
            setError('El archivo debe tener formato PDF.');
            setArchivo(null);
            event.target.value = '';
            return;
        }

        // Establecemos los tamaño permitido
        const maximo = 5 * 1024 * 1024;

        // Comprobamos el tamaño del archivo
        if (
            archivoSeleccionado.size > maximo
        ) {
            setError('El PDF no debe superar los 5 MB.');
            setArchivo(null);
            event.target.value = '';
            return;
        }

        setArchivo(archivoSeleccionado);
    }


    // Comprobamos si todos los campos están completos
    const formularioValido =
        motivos.length > 0 &&
        (!motivos.includes('Otro') || otroMotivo.trim() !== '') &&
        descripcion.trim() !== '' &&
        archivo !== null;


    // Función para enviar el reporte
    async function enviarReporte(event) {

        event.preventDefault();

        setError('');
        setExito('');

        // Evitamos enviar formularios incompletos
        if (!formularioValido) {
            setError('Debes completar todos los campos.');
            return;
        }

        try {

            setEnviando(true);

            // Creamos el paquete que enviaremos al Backend
            const datos = new FormData();

            datos.append('motivos', JSON.stringify(motivos));
            datos.append('otroMotivo', otroMotivo);
            datos.append('descripcion', descripcion);
            datos.append('archivo', archivo);

            // Enviamos la información al Backend
            const respuesta = await apiFetch('/api/reportes', {
                method: 'POST',
                body: datos
            });

            if (!respuesta.ok) {
                throw new Error('No se pudo enviar el reporte.');
            }

            // Mostramos el mensaje de éxito
            setExito('¡Reporte enviado exitosamente!');

            // Limpiamos el formulario
            setMotivos([]);
            setOtroMotivo('');
            setDescripcion('');
            setArchivo(null);

            document.getElementById('archivo').value = '';

        } catch (error) {

            setError(error.message || 'Ocurrió un error al enviar el reporte.');

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

                    <h1>Enviar reporte</h1>

                    <p className={styles.subtitulo}>
                        Completa los siguientes campos para
                        registrar una incidencia.
                    </p>


                    <form onSubmit={enviarReporte}>

                        {/* MOTIVOS DEL REPORTE */}

                        <div className={styles.grupo}>

                            <label className={styles.tituloCampo}>
                                Motivo del reporte *
                            </label>

                            <div className={styles.opciones}>

                                {[
                                    'Cobro por contratación',
                                    'Oferta falsa',
                                    'Suplantación de identidad',
                                    'Condiciones abusivas',
                                    'Empresa inexistente en la práctica',
                                    'Otro'
                                ].map((motivo) => (

                                    <label key={motivo} className={styles.opcion}>

                                        <input
                                            type="checkbox"
                                            value={motivo}
                                            checked={motivos.includes(motivo)}
                                            onChange={manejarMotivos}
                                        />

                                        <span>{motivo}</span>

                                    </label>

                                ))}

                            </div>

                        </div>


                        {/* CAMPO PARA OTRO MOTIVO */}

                        {motivos.includes('Otro') && (

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
                                onChange={(e) => setDescripcion(e.target.value)}
                            />

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