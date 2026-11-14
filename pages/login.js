import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import estilos from '../styles/Login.module.css'; 

export default function Login() {
    const router = useRouter();
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [mostrarPass, setMostrarPass] = useState(false); 
    const [estado, setEstado] = useState({ tipo: '', mensaje: '' });
    const [cargando, setCargando] = useState(false);

    const manejarLogin = async (e) => {
        e.preventDefault();
        setEstado({ tipo: '', mensaje: '' });
        setCargando(true);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        try {
            const respuesta = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ usuario, contrasena }),
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                setEstado({
                    tipo: 'error',
                    mensaje: datos.error || 'Error al iniciar sesión',
                });
                setCargando(false);
                return;
            }

            setEstado({
                tipo: 'exito',
                mensaje: `¡Bienvenido ${datos.usuario.nombre}! Rol detectado: ${datos.usuario.rol}. Redirigiendo...`,
            });

            setTimeout(() => {
                const rol = datos.usuario.rol;
                if (rol === 'admin') router.push('/admin');
                else if (rol === 'consultor') router.push('/consultor');
                else if (rol === 'mipyme') router.push('/mipyme');
            }, 1200);

        } catch (error) {
            console.error('Error de red:', error);
            setEstado({
                tipo: 'error',
                mensaje: 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.',
            });
            setCargando(false);
        }
    };

    return (
       <div className={estilos['paginaCompleta']}>

            {/* COMPONENTE DE CARGA */}
            {cargando && (
                <Cargando texto="Autenticando en WorkGuard..." />
            )}

            {/* LOGO */}
            <div className={estilos['logoEsquina']}>
                <Link href="/">
                    <Image
                        src="/img/logo.png"
                        alt="Logo WorkGuard"
                        width={64}
                        height={64}
                    />
                </Link>
            </div>

            {/* ILUSTRACIÓN IZQUIERDA */}
            <div className={estilos['ilustracionLateral']}>
                <Image
                    src="/img/persona1.png"
                    alt="Ilustración izquierda"
                    width={300}
                    height={300}
                    priority
                />
            </div>


            {/* FORMULARIO CENTRAL */}
            <div className={estilos['contenedorCentral']}>
                <main className={estilos['contenedorCentrado']}>
                    <form
                        onSubmit={manejarLogin}
                        className={estilos['formulario-login']}
                    >

                        {/* ENCABEZADO */}
                        <div className={estilos['encabezado-formulario']}>
                            <h2>Iniciar Sesión</h2>
                        </div>

                        {/* MENSAJE DE ESTADO */}
                        {estado.mensaje && (
                            <p
                                className={estilos['mensaje-estado']}
                                style={{
                                    color: estado.tipo === 'error'
                                        ? '#F87171'
                                        : '#34D399'
                                }}>
                                {estado.mensaje}
                            </p>
                        )}


                        {/* CAMPO USUARIO */}
                        <div className={estilos['campo']}>
                            <label htmlFor="usuario">
                                Usuario
                            </label>

                            <div className={estilos['campo-input']}>
                                <Image
                                    src="/img/user.png"
                                    alt="Usuario"
                                    width={16}
                                    height={16}
                                    className={estilos['icono-input']}
                                />
                                <input
                                    type="text"
                                    id="usuario"
                                    placeholder="Ingresa tu usuario"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* CAMPO CONTRASEÑA */}
                        <div className={estilos['campo']}>
                            <label htmlFor="contrasena">
                                Contraseña
                            </label>
                            <div className={estilos['campo-input']}>
                                <Image
                                    src="/img/password.png"
                                    alt="Contraseña"
                                    width={16}
                                    height={16}
                                    className={estilos['icono-input']}
                                />
                                <input
                                    type={mostrarPass ? "text" : "password"}
                                    id="contrasena"
                                    placeholder="Ingresa tu contraseña"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    required
                                />

                                {/* BOTÓN DEL OJO */}
                                <button
                                    type="button"
                                    className={estilos['boton-ojo']}
                                    onClick={() => setMostrarPass(!mostrarPass)}
                                    aria-label={
                                        mostrarPass
                                            ? "Ocultar contraseña"
                                            : "Mostrar contraseña"
                                    }
                                >
                                    {mostrarPass ? (

                                        /* OJO CERRADO */
                                        <svg viewBox="0 0 24 24" fill="none">

                                            <path
                                                d="M3 3L21 21"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M10.6 10.6A2 2 0 0013.4 13.4"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />

                                            <path
                                                d="M9.9 5.2A10.9 10.9 0 0112 5c5 0 9 4 10 7-0.4 1.2-1.3 2.4-2.5 3.4"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />

                                            <path
                                                d="M6.2 6.2C4.1 7.4 2.6 9.4 2 12c1 3 5 7 10 7 1.2 0 2.3-.2 3.3-.6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                    ) : (

                                        /* OJO ABIERTO */
                                        <svg viewBox="0 0 24 24" fill="none">

                                            <path
                                                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />

                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />

                                        </svg>
                                    )}

                                </button>
                            </div>
                        </div>


                        {/* BOTÓN INICIAR SESIÓN */}
                        <button
                            type="submit"
                            className={estilos['btnlogin']}
                            disabled={cargando}
                        >

                            {cargando
                                ? 'Verificando...'
                                : 'Iniciar Sesión'
                            }

                        </button>


                        {/* REGISTRO */}
                        <p className={estilos['registro']}>

                            ¿No tienes una cuenta?

                            <Link href="/registro">
                                Registrarse
                            </Link>
                        </p>
                    </form>
                </main>
            </div>


            {/* ILUSTRACIÓN DERECHA */}
            <div className={estilos['ilustracionLateral']}>
                <Image
                    src="/img/persona2.png"
                    alt="Ilustración derecha"
                    width={300}
                    height={300}
                    priority
                />
            </div>
        </div>
    );
}
