import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import TarjetaNoticia from '../components/TarjetaNoticia';
import estilos from '../styles/Landing.module.css';

export default function Login() {

    const noticias = [
        {
            titulo: "+2000 MiPyMEs registradas",
            descripcion: "Consulta su información"
        },
        {
            titulo: "Verificamos la ubicación geográfica",
            descripcion: "Google APIs"
        },
        {
            titulo: "Reportes empresariales",
            descripcion: "Contribuye a mantener información relevante mediante reportes fundamentados"
        },
        {
            titulo: "Verificamos documentación empresarial",
            descripcion: "Solicitamos documentación verídica a las MiPyMEs"
        }
    ];

    useEffect(() => {
        const bolita = document.querySelector(`.${estilos['particula-principal']}`);
        const contenedor = document.querySelector(`.${estilos['contenedor-particulas']}`);

        if (!bolita || !contenedor) return;

        function crearParticula() {
            const particula = document.createElement('span');
            particula.classList.add(estilos['rastro-particula']);

            const rectangulo = bolita.getBoundingClientRect();
            const area = contenedor.getBoundingClientRect();

            particula.style.left = `${rectangulo.left - area.left + 5}px`;
            particula.style.top = `${rectangulo.top - area.top + 5}px`;

            contenedor.appendChild(particula);

            setTimeout(() => {
                particula.remove();
            }, 700);
        }

        const intervalo = setInterval(crearParticula, 80);
        return () => clearInterval(intervalo);
    }, []);

    const noticiasExtendidas = [...noticias, ...noticias];

    return (
        <>
            <header className={estilos['menu-usuario']}>
                {/* Uso Image de Next.js para el logo */}
                <Image 
                    src="/img/Logoworkguard.png" 
                    alt="Logo de workguard" 
                    width={45} 
                    height={45} 
                    style={{ width: 'auto', height: 'auto' }} 
                />
                <nav>
                    <Link href=""><span className={estilos['letrasworkguard']}>Work<span>Guard</span></span></Link>
                    <Link href="">Funcionamiento</Link>
                    <Link href="">Enfoque Técnico</Link>
                </nav>
            </header>

            <main className={estilos['contenedor-login']}>
                {/* Panel izquierdo */}
                <section className={estilos['panel-bienvenida']}>
                    <h1>¡BIENVENIDO A WORKGUARD!</h1>
                    <p>Accede a WorkGuard y mantén el control de la seguridad laboral</p>

                    <div className={estilos['fondo-ilustracion']}>
                        <svg className={`${estilos['onda']} ${estilos['onda-azul']}`} viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="wgGradLeft1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                                    <stop offset="60%" stopColor="#1D4ED8" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#0B162C" stopOpacity="0.8" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#wgGradLeft1)" d="M420,320Q360,390,290,410Q220,430,150,380Q80,330,90,240Q100,150,180,110Q260,70,350,110Q440,150,440,235Q440,320,420,320Z" />
                        </svg>

                        <svg className={`${estilos['onda']} ${estilos['onda-dorada']}`} viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="wgGradLeft2" x1="100%" y1="100%" x2="0%" y2="0%">
                                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
                                    <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.7" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#wgGradLeft2)" d="M450,360Q380,420,300,430Q220,440,160,380Q100,320,110,230Q120,140,200,100Q280,60,370,100Q460,140,490,230Q520,320,450,360Z" />
                        </svg>
                    </div>

                    <div className={estilos['contenido']}>
                        <div className={estilos['ilustracion']}>
                            {/* Usando Image para la ilustración principal */}
                            <Image 
                                src="/img/login.png" 
                                alt="Ilustración Login" 
                                width={450} 
                                height={450} 
                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                priority 
                            />
                        </div>
                    </div>
                </section>

                {/* Panel derecho */}
                <section className={estilos['panel-formulario']}>
                    <div className={estilos['contenedor-particulas']}>
                        <div className={estilos['particula-principal']}></div>
                    </div>

                    <div className={estilos['fondo-formulario']}></div>

                    <form id="formularioLogin" className={estilos['formulario-login']}>
                        <div className={estilos['formulario-login']}>
                            <div className={estilos['encabezado-formulario']}>
                                <h2>La información que necesitas a tu alcance</h2>
                            </div>
                        
                            <Link href="/login" className={estilos['btnlogin']} style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                                Iniciar Sesión
                            </Link>
                            <p className={estilos['registro']}>¿No tienes una cuenta? <Link href="/registro">Registrarse</Link></p>
                        </div>
                    </form>

                    <Image 
                    src="/img/documento.png" 
                    alt="Logo de workguard" 
                    width={500} 
                    height={500} 
                    className={estilos['imagen-documento']}
                />

                </section>
            </main>

            <section className={estilos['seccion-noticias']}>
                <div className={estilos['contenedor-noticias']} id="contenedorNoticias">
                    {noticiasExtendidas.map((noticia, index) => (
                        <TarjetaNoticia key={index} noticia={noticia} />
                    ))}
                </div>
            </section>

        {/* Sección de Fuentes Oficiales */}
            <div className={estilos['contenedorOrg']}>

                <h2 className={estilos['tituloOrg']}>Fuentes Oficiales de Consulta</h2>

                <div className={estilos['contenedorImagenes']}>
                    
                    {/* Tarjeta 1 (SAT) */}
                    <div className={estilos['tarjetaOrgItem']}>
                        <div className={estilos['tarjetaInner']}>
                            {/* Frente */}
                            <div className={estilos['tarjetaFrente']}>
                                <Image 
                                    src="/img/SAT.webp" 
                                    alt="Imagen del SAT" 
                                    width={160} 
                                    height={160} 
                                    className={estilos['imagenOrg']}
                                />
                                <p style={{ marginTop: '15px', fontWeight: '600' }}>Servicios de Administración Tributaria</p>
                            </div>
                            {/* Reverso (Texto que aparece al girar) */}
                            <div className={estilos['tarjetaReverso']}>
                                <p className={estilos['textoOrg']}>
                                    Validación oficial de datos fiscales y situación de MiPyMEs.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta 2 (Secretaría de Economía) */}
                    <div className={estilos['tarjetaOrgItem']}>
                        <div className={estilos['tarjetaInner']}>
                            {/* Frente */}
                            <div className={estilos['tarjetaFrente']}>
                                <Image 
                                    src="/img/secretariaeconomia.png" 
                                    alt="Secretaria de Economia" 
                                    width={160} 
                                    height={160} 
                                    className={estilos['imagenOrg']}
                                />
                                <p style={{ marginTop: '15px', fontWeight: '600' }}>Secretaría de Economía</p>
                            </div>
                            {/* Reverso (Texto que aparece al girar) */}
                            <div className={estilos['tarjetaReverso']}>
                                <p className={estilos['textoOrg']}>
                                    Consultamos normativas, registros y el fomento a la actividad económica.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

