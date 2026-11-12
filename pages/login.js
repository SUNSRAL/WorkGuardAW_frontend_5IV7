import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import estilos from '../styles/Login.module.css'; 

export default function Login() {
    const router = useRouter();
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
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
        <div className={estilos.pantalla}>
            {/* Barra superior sencilla */}
            <header className={estilos.header}>
                <div className={estilos.marca}>
                    <Image
                        src="/img/Logoworkguard.png"
                        alt="Logo WorkGuard"
                        width={38}
                        height={38}
                    />
                    <span className={estilos['titulo-marca']}>
                        Work<span style={{ color: '#F59E0B' }}>Guard</span>
                    </span>
                </div>
                <Link href="/" className={estilos['enlace-volver']}>
                    ← Volver al inicio
                </Link>
            </header>

            {/* Contenedor centrado de la tarjeta de Login */}
            <main className={estilos['contenedor-central']}>
                <div className={estilos.tarjeta}>
                    <div className={estilos['borde-superior']}></div>

                    <h1 className={estilos.titulo}>Iniciar Sesión</h1>
                    <p className={estilos.subtitulo}>
                        Ingresa tu usuario y contraseña para validar tu rol
                    </p>

                    {/* Formulario de login */}
                    {estado.mensaje && (
                        <div
                            className={estilos.alerta}
                            style={{
                                backgroundColor: estado.tipo === 'error' ? '#FEE2E2' : '#DCFCE7',
                                color: estado.tipo === 'error' ? '#B91C1C' : '#15803D',
                                borderColor: estado.tipo === 'error' ? '#F87171' : '#4ADE80',
                            }}
                        >
                            {estado.mensaje}
                        </div>
                    )}

                    <form onSubmit={manejarLogin} className={estilos.formulario}>
                        <div className={estilos['grupo-input']}>
                            <label htmlFor="usuario" className={estilos.etiqueta}>
                                Usuario
                            </label>
                            <input
                                id="usuario"
                                type="text"
                                placeholder="Ej. admin_wg"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                required
                                className={estilos.input}
                            />
                        </div>

                        <div className={estilos['grupo-input']}>
                            <label htmlFor="contrasena" className={estilos.etiqueta}>
                                Contraseña
                            </label>
                            <input
                                id="contrasena"
                                type="password"
                                placeholder="••••••••"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                required
                                className={estilos.input}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className={estilos.boton}
                            style={{
                                opacity: cargando ? 0.7 : 1,
                                cursor: cargando ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {cargando ? 'Validando credenciales...' : 'Entrar'}
                        </button>
                    </form>

                    {/* Indicador */}
                    <div className={estilos['pie-prueba']}>
                        Conectando a:{' '}
                        <code>{process.env.NEXT_PUBLIC_API_URL}</code>
                    </div>
                </div>
            </main>
        </div>
    );
}
