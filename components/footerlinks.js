import Link from 'next/link'; 
import Image from 'next/image'; 
import estilos from '/footerlinks.module.css'; 

export default function Footer(){
    return(
        <footer className={estilos[footer]}>
            <div className={estilos[contenidoFooter]}>
                {/*info*/}
                <div className={estilos[informacion]}>
                    <Image
                       src="/img/Logoworkguard.png"
                       alt='Logo'
                       width={30}
                       height={30}
                    ></Image>

                    <p>WorkGuard centraliza y valida información crítica sobre empresas, ofreciendo a los consultores una fuente de datos rigurosa, transparente y en tiempo real. Minimiza el riesgo en tus análisis y acelera la investigación corporativa con total confianza.</p>
                </div>

                {/*enlaces*/}
                  {/*Redes*/}

                <div className={estilos[redesSociales]}>
                    {/*INSTAGRAM*/}
                    <a
                    href=""
                    target="_blank">rel
                    rel="noopener noreferrer"
                        <Image>
                            src="/img/instagram.png"
                            alt="Instagram"
                            width={30}
                            height={30}
                        </Image>
                    </a>

                    {/* FACE*/}
                    <a
                    href=""
                    target="_blank">rel
                    rel="noopener noreferrer"
                        <Image>
                            src="/img/facebook.png"
                            alt="Facebook"
                            width={30}
                            height={30}
                        </Image>
                    </a>

                    {/*x */}
                    <a
                    href=""
                    target="_blank">rel
                    rel="noopener noreferrer"
                        <Image>
                            src="/img/x.png"
                            alt="X"
                            width={30}
                            height={30}
                        </Image>
                    </a>

                    {/*Youtube */}
                    <a
                    href=""
                    target="_blank">rel
                    rel="noopener noreferrer"
                        <Image>
                            src="/img/youtube.png"
                            alt="Youtube"
                            width={30}
                            height={30}
                        </Image>
                    </a>
                </div>
            </div>

            <div className={estilos[empresa]}>
                <Image>
                    src="/img/kairosDev.png"
                    alt="KairósDev"
                    width={30}
                    height={30}
                </Image>
            </div>

            {/*Columna */}
            <div className={estilos[columna]}>
                <h3 className={estilos[columnaTit]}>Servicios</h3>
                <ul className={estilos[columnalinks]}>
                    <li><a href="">Consulta de empresas</a></li>
                    <li><a href="">Registro de empresas</a></li>
                    <li><a href="">Reportar una empresa</a></li>
                    <li><a href="">Preguntas frecuentes</a></li>
                </ul>
            </div>

            <div className={estilos[columna]}>
                <h3 className={estilos[columnaTit]}>Información Legal</h3>
                <ul className={estilos[columnaLink]}>
                    <li><a href="">Aviso de Privacidad</a></li>
                    <li><a href="">Términos y condiciones</a></li>
                    <li><a href="">Política de uso</a></li>
                    <li><a href="">Contacto y soporte</a></li>
                </ul>
            </div>

            <div className={estilos[columna]}>
                <h3 className={estilos[columnaTit]}>Compañía</h3>
                <ul className={estilos[columnaLink]}>
                    <li><a href="">¿Quiénes somos?</a></li>
                    <li><a href="">Misión</a></li>
                    <li><a href="">Visión</a></li>
                    <li><a href="">Organizaciones que nos respaldan</a></li>
                </ul>
            </div>

             {/* DERECHOS RESERVADOS */}
            <div className={estilos[derechos]}>
                © 2026 WorkGuard. Todos los derechos reservados.
            </div>
            
        </footer>
    )
}