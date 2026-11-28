// PAGINA PRINCIPAL PARA TODOS LOS USUARIOS

import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/footerlinks.js';
import estilos from '../styles/Landing.module.css';

export default function Login() {
    return (
        <div className={estilos['pagina-envoltura']}>
            <header className={estilos['menu-usuario']}>
                <div className={estilos['marca-grupo']}>
                    <Image
                        src="/img/Logoworkguard.png"
                        alt="Logo de workguard"
                        width={45}
                        height={45}
                        style={{ width: 'auto', height: 'auto' }}
                    />
                    <span className={estilos['letrasworkguard']}>
                        Work<span>Guard</span>
                    </span>
                    <nav>
                        <Link href="">Funcionamiento</Link>
                        <Link href="">Enfoque Técnico</Link>
                    </nav>
                </div>

                <div className={estilos['acciones-header']}>
                    <Link href="/login" className={estilos['btnlogin']}>
                        Iniciar Sesión
                    </Link>
                    <Link href="/rol" className={estilos['link-registro-header']}>
                        Registrarse
                    </Link>
                </div>
            </header>

            <main className={estilos['contenedor-login']}>
            
                <section className={estilos['panel-formulario']}>
                    <div className={estilos['formulario-login']}>
                        <span className={estilos['etiqueta-superior']}>
                            ¡BIENVENIDO A WORKGUARD!
                        </span>

                        <div className={estilos['encabezado-formulario']}>
                            <h1>La información que necesitas a tu alcance</h1>
                            <p>
                                Accede a WorkGuard y mantén el control de la seguridad laboral.
                                Una solución de software diseñada para verificar y validar la
                                autenticidad de las empresas.
                            </p>
                        </div>

                        <div className={estilos['conocer-mas-bloque']}>
                            <Link href="" className={estilos['letrasworkguard-link']}>
                                Work<span>Guard</span>
                            </Link>
                            <p className={estilos['texto-conocer-mas']}>
                                Conocer más acerca de WorkGuard
                            </p>
                        </div>
                    </div>
                </section>

               
                <section className={estilos['panel-bienvenida']}>
                
                    <img
                        src="/img/xd.png"
                        alt=""
                        aria-hidden="true"
                        className={estilos['fondo-imagen-derecha']}
                    />

                    <div className={estilos['contenido']}>
                        <div className={estilos['ilustracion']}>
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
            </main>

            {/* Sección de Funcionamiento */}
            <div className={estilos['documento-icono']}>
                <div className={estilos['panel-pdf']}>
                    <h2>Funcionamiento</h2>
                    <p>Descubre la manera correcta de usar WorkGuard.</p>
                    <a
                        href="/pdf/GUÍA DE USABILIDAD DE WORKGUARD.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={estilos['tarjeta-pdf']}
                        aria-label="Consultar documentación de WorkGuard"
                    >
                        <i className="fa-solid fa-file-pdf"></i>
                        <span>PDF</span>
                        <small>Consultar documento</small>
                    </a>
                </div>

                <div className={estilos['panel-imagen']}>
                    <img
                        src="/img/funcionamiento.jpg"
                        alt="Funcionamiento técnico de WorkGuard"
                    />
                </div>
            </div>

            {/* Sección de Funcionamiento Técnico */}
            <div className={estilos['documento-icono']}>
                <div className={estilos['panel-pdf']}>
                    <h2>Funcionamiento Técnico</h2>
                    <p>Descubre cómo verificamos a las Micro, Pequeñas y Medianas Empresas.</p>
                    <a
                        href="/pdf/Especificación de metodología.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={estilos['tarjeta-pdf']}
                        aria-label="Consultar documentación de WorkGuard"
                    >
                        <i className="fa-solid fa-file-pdf"></i>
                        <span>PDF</span>
                        <small>Consultar documento</small>
                    </a>
                </div>

                <div className={estilos['panel-imagen']}>
                    <img
                        src="/img/mipyme.png"
                        alt="Funcionamiento técnico de WorkGuard"
                    />
                </div>
            </div>

            {/* Sección de Fuentes Oficiales */}
            <div className={estilos['contenedorOrg']}>
                <h2 className={estilos['tituloOrg']}>Fuentes Oficiales de Consulta</h2>

                <div className={estilos['contenedorImagenes']}>
                    {/* Tarjeta 1 (SAT) */}
                    <div className={estilos['tarjetaOrgItem']}>
                        <div className={estilos['tarjetaInner']}>
                            <div className={estilos['tarjetaFrente']}>
                                <Image
                                    src="/img/SAT.webp"
                                    alt="Imagen del SAT"
                                    width={160}
                                    height={160}
                                    className={estilos['imagenOrg']}
                                />
                                <p style={{ marginTop: '15px', fontWeight: '600' }}>
                                    Servicios de Administración Tributaria
                                </p>
                            </div>
                            <div className={estilos['tarjetaReverso']}>
                                <p className={estilos['textoOrg']}>
                                    Validación oficial de datos fiscales y situación de MiPyMEs.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secretaría de Economía */}
                    <div className={estilos['tarjetaOrgItem']}>
                        <div className={estilos['tarjetaInner']}>
                            <div className={estilos['tarjetaFrente']}>
                                <Image
                                    src="/img/secretariaeconomia.png"
                                    alt="Secretaria de Economia"
                                    width={160}
                                    height={160}
                                    className={estilos['imagenOrg']}
                                />
                                <p style={{ marginTop: '15px', fontWeight: '600' }}>
                                    Secretaría de Economía
                                </p>
                            </div>
                            <div className={estilos['tarjetaReverso']}>
                                <p className={estilos['textoOrg']}>
                                    Consultamos normativas, registros y el fomento a la actividad económica.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secretaría de Trabajo y Previsión Social */}
                    <div className={estilos['tarjetaOrgItem']}>
                        <div className={estilos['tarjetaInner']}>
                            <div className={estilos['tarjetaFrente']}>
                                <Image
                                    src="/img/STPS.png"
                                    alt="Secretaria de Trabajo y Prevención Social"
                                    width={160}
                                    height={160}
                                    className={estilos['imagenOrg']}
                                />
                                <p style={{ marginTop: '15px', fontWeight: '600' }}>
                                    Secretaría de Trabajo y Prevención Social
                                </p>
                            </div>
                            <div className={estilos['tarjetaReverso']}>
                                <p className={estilos['textoOrg']}>
                                    Apoyándonos en el cumplimiento de los derechos laborales, fomentando el empleo digno y mantener el equilibrio entre trabajadores y empleadores.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}