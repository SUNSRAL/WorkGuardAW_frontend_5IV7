import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import TarjetaEmpresa from '../../components/tarjetaEmpresaVisPrev';
import { apiFetch } from '../../utils/api';
import styles from '../../styles/Cuenta.module.css';

export default function CuentaConsultor() {

    const router = useRouter();
    const inputFoto = useRef(null);

    // Datos del consultor
    const [idConsultor, setIdConsultor] = useState(null);
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [foto, setFoto] = useState(null);

    // Datos para editar
    const [editando, setEditando] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoCorreo, setNuevoCorreo] = useState('');

    // Estados de carga
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    // Obtener los datos del consultor al abrir la página
    useEffect(() => {

        async function cargarCuenta() {
            try {
                setCargando(true);
                setError('');

                // 1. Verificar quién inició sesión
                const sesion = await apiFetch('/api/auth/verificar');
                const id = sesion.usuario.id;
                if (!id) {
                    throw new Error('No se pudo identificar al consultor.');
                }
                setIdConsultor(id);

                // 2. Consultar los datos del consultor
                const datos = await apiFetch(
                    `/api/usuarios/consultores/${id}`
                );

                // 3. Mostrar los datos reales
                setNombre(datos.nombre_completo);
                setCorreo(datos.correo_electronico);
                setFoto(datos.foto_perfil || null);

                // 4. Preparar los datos para edición
                setNuevoNombre(datos.nombre_completo);
                setNuevoCorreo(datos.correo_electronico);
            } catch (error) {
                console.error('Error al cargar la cuenta:', error);
                setError(
                    error.message || 'No fue posible cargar la cuenta.'
                );
            } finally {
                setCargando(false);
            }
        }
        cargarCuenta();
    }, []);

    // Abrir el explorador de archivos
    const seleccionarFoto = () => {
        inputFoto.current.click();
    };

    //Funcion de cambiar la foto  dek perfil
const cambiarFoto = async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    const formatosPermitidos = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];
    if (!formatosPermitidos.includes(archivo.type)) {
        alert('Selecciona una imagen JPG, PNG o WEBP.');
        evento.target.value = '';
        return;
    }
    if (archivo.size > 2 * 1024 * 1024) {
        alert('La imagen no puede superar los 2 MB.');
        evento.target.value = '';
        return;
    }
    try {
        const formulario = new FormData();
        formulario.append('foto', archivo);
        const respuesta = await apiFetch(
            `/api/usuarios/consultores/${idConsultor}/foto`,
            {
                method: 'PUT',
                body: formulario
            }
        );
        setFoto(respuesta.foto_perfil);
        alert('Fotografía actualizada correctamente.');
    } catch (error) {
        console.error('Error al subir fotografía:', error);
        alert(error.message || 'No se pudo actualizar la fotografía.');
    } finally {
        evento.target.value = '';

    }
};

    // Abrir la edición
    const iniciarEdicion = () => {
        setNuevoNombre(nombre);
        setNuevoCorreo(correo);
        setEditando(true);
    };

    // Guardar los cambios en la base de datos
    const guardarCambios = async () => {

        if (!nuevoNombre.trim() || !nuevoCorreo.trim()) {
            alert('Todos los campos son obligatorios.');
            return;
        }

        const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!expresionCorreo.test(nuevoCorreo.trim())) {
            alert('Escribe un correo electrónico válido.');
            return;
        }

        try {
            setGuardando(true);

            // Enviar los cambios al backend
            const respuesta = await apiFetch(
                `/api/usuarios/consultores/${idConsultor}`,
                {
                    method: 'PUT',
                    body: {
                        nombre_completo: nuevoNombre.trim(),
                        correo_electronico: nuevoCorreo.trim()
                    }
                }
            );

            // Actualizar la información que aparece en pantalla
            setNombre(respuesta.consultor.nombre_completo);
            setCorreo(respuesta.consultor.correo_electronico);

            setNuevoNombre(respuesta.consultor.nombre_completo);
            setNuevoCorreo(respuesta.consultor.correo_electronico);

            setEditando(false);

            alert('Tu información se actualizó correctamente.');

        } catch (error) {

            console.error('Error al actualizar la cuenta:', error);

            alert(error.message || 'No se pudieron guardar los cambios.');

        } finally {

            setGuardando(false);
        }

    };

    // Cancelar la edición
    const cancelarEdicion = () => {
        setNuevoNombre(nombre);
        setNuevoCorreo(correo);
        setEditando(false);
    };

    // Cerrar sesión
    const cerrarSesion = async () => {
        try {
            await apiFetch('/api/auth/logout', {
                method: 'POST'
            });
            router.push('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);

            alert('No fue posible cerrar la sesión.');
        }

    };

    // Mientras se consultan los datos
    if (cargando) {
        return (
            <main className={styles.contenedor}>
                <p>Cargando información de tu cuenta...</p>
            </main>
        );
    }

    // Si ocurrió un error al cargar
    if (error) {

        return (
            <main className={styles.contenedor}>
                <p>{error}</p>

                <button onClick={() => router.reload()}>
                    Volver a intentar
                </button>
            </main>
        );

    }

    return (

        <main className={styles.contenedor}>
            {/* ENCABEZADO */}
            <header className={styles.encabezado}>
                <img
                    src="/img/logo.png"
                    alt="Logo WorkGuard"
                    className={styles.logo}
                />
                <button
                    className={styles.botonCerrar}
                    onClick={cerrarSesion}
                >
                    Cerrar sesión
                </button>
            </header>


            {/* INFORMACIÓN DEL CONSULTOR */}

            <section className={styles.seccionPerfil}>
                <div className={styles.contenedorFoto}>
                    <div
                        className={styles.fotoPerfil}
                        onClick={seleccionarFoto}
                    >
                        {foto ? (

                            <img
                                src={foto}
                                alt="Fotografía de perfil"
                            />
                        ) : (

                            <span>+</span>

                        )}

                        <div className={styles.capaFoto}>
                            Cambiar foto
                        </div>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={inputFoto}
                        onChange={cambiarFoto}
                        hidden
                    />
                </div>


                <div className={styles.informacionPerfil}>

                    {editando ? (

                        <div className={styles.edicionCorreo}>

                            <input
                                type="text"
                                value={nuevoNombre}
                                onChange={(e) =>
                                    setNuevoNombre(e.target.value)
                                }
                                className={styles.inputCorreo}
                                placeholder="Nombre completo"
                            />

                            <input
                                type="email"
                                value={nuevoCorreo}
                                onChange={(e) =>
                                    setNuevoCorreo(e.target.value)
                                }
                                className={styles.inputCorreo}
                                placeholder="Correo electrónico"
                            />

                            <button
                                onClick={guardarCambios}
                                className={styles.botonGuardar}
                                disabled={guardando}
                            >
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                                onClick={cancelarEdicion}
                                className={styles.botonCancelar}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <>

                            <h1>{nombre}</h1>
                            <div className={styles.contenedorCorreo}>
                                <p>{correo}</p>
                                <button
                                    onClick={iniciarEdicion}
                                    className={styles.botonEditar}
                                >
                                    Editar información
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>


            {/* EMPRESAS GUARDADAS */}

            <section className={styles.seccionEmpresas}>
                <div className={styles.encabezadoEmpresas}>
                    <div>
                        <h2>Empresas guardadas</h2>
                        <p>
                            Consulta las empresas que has agregado a tus favoritos.
                        </p>
                    </div>
                    <span className={styles.contador}>
                        0 empresas
                    </span>
                </div>

                <div className={styles.listaEmpresas}>
                    {/* 
                        AQUÍ CONECTAREMOS LOS FAVORITOS.

                        Cuando tengamos la tabla de favoritos,
                        consultaremos las empresas guardadas
                        por el consultor que inició sesión.
                    */}
                    <p>
                        Todavía no hay empresas guardadas.
                    </p>
                </div>
            </section>
        </main>

    );

}