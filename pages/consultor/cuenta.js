import { useRef, useState } from 'react';
import TarjetaEmpresa from '../../components/tarjetaEmpresaVisPrev';
import styles from '../../styles/Cuenta.module.css';

export default function CuentaConsultor() {

    const inputFoto = useRef(null);

    // Información temporal del consultor
    const [nombre, setNombre] = useState('Nombre del consultor');
    const [correo, setCorreo] = useState('consultor@correo.com');

    // Fotografía de perfil
    const [foto, setFoto] = useState(null);

    // Edición del correo
    const [editandoCorreo, setEditandoCorreo] = useState(false);
    const [nuevoCorreo, setNuevoCorreo] = useState(correo);

    // Empresas de prueba
    const empresas = [
        {
            id: 1,
            nombre: 'Cafetería El Buen Café',
            giro: 'Preparación y venta de alimentos',
            ubicacion: 'Gustavo A. Madero, CDMX',
            imagen: '/img/empresa1.jpg'
        },
        {
            id: 2,
            nombre: 'Papelería Central',
            giro: 'Comercio de artículos escolares',
            ubicacion: 'Azcapotzalco, CDMX',
            imagen: '/img/empresa2.jpg'
        },
        {
            id: 3,
            nombre: 'Tecnología Digital',
            giro: 'Servicios de tecnología',
            ubicacion: 'Cuauhtémoc, CDMX',
            imagen: '/img/empresa3.jpg'
        }
    ];

    // Abrir el explorador de archivos
    const seleccionarFoto = () => {
        inputFoto.current.click();
    };

    // Mostrar vista previa de la fotografía
    const cambiarFoto = (evento) => {
        const archivo = evento.target.files[0];

        if (!archivo) return;

        if (!archivo.type.startsWith('image/')) {
            alert('Selecciona un archivo de imagen válido.');
            evento.target.value = '';
            return;
        }

        const imagenURL = URL.createObjectURL(archivo);
        setFoto(imagenURL);
    };

    // Guardar el correo editado
    const guardarCorreo = () => {
        if (!nuevoCorreo.trim()) {
            alert('El correo electrónico no puede estar vacío.');
            return;
        }

        const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!expresionCorreo.test(nuevoCorreo)) {
            alert('Escribe un correo electrónico válido.');
            return;
        }

        setCorreo(nuevoCorreo);
        setEditandoCorreo(false);
    };

    // Cancelar edición
    const cancelarEdicion = () => {
        setNuevoCorreo(correo);
        setEditandoCorreo(false);
    };

    // Cerrar sesión (lo conectaremos después)
    const cerrarSesion = () => {
        alert('Después conectaremos este botón con el cierre de sesión.');
    };

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

                    <h1>{nombre}</h1>

                    <div className={styles.contenedorCorreo}>

                        {editandoCorreo ? (

                            <div className={styles.edicionCorreo}>

                                <input
                                    type="email"
                                    value={nuevoCorreo}
                                    onChange={(e) =>
                                        setNuevoCorreo(e.target.value)
                                    }
                                    className={styles.inputCorreo}
                                />

                                <button
                                    onClick={guardarCorreo}
                                    className={styles.botonGuardar}
                                >
                                    Guardar
                                </button>

                                <button
                                    onClick={cancelarEdicion}
                                    className={styles.botonCancelar}
                                >
                                    Cancelar
                                </button>

                            </div>

                        ) : (

                            <>
                                <p>{correo}</p>

                                <button
                                    onClick={() => setEditandoCorreo(true)}
                                    className={styles.botonEditar}
                                >
                                    Editar correo
                                </button>
                            </>

                        )}

                    </div>

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
                        {empresas.length} empresas
                    </span>

                </div>


                <div className={styles.listaEmpresas}>

                    {empresas.map((empresa) => (

                        <TarjetaEmpresa
                            key={empresa.id}
                            imagen={empresa.imagen}
                            nombre={empresa.nombre}
                            giro={empresa.giro}
                            ubicacion={empresa.ubicacion}
                        />

                    ))}

                </div>

            </section>

        </main>
    );
}