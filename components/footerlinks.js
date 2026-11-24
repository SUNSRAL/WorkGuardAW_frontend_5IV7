import Link from 'next/link';
import Image from 'next/image';
import estilos from './footerlinks.module.css';

export default function Footer() {
    return (
        <footer className={estilos.principalfooter}>
            <div className={estilos.contenidoFooter}>
                {/* Info */}
                <div className={estilos.informacion}>
                    <Image
                        src="/img/logo.png"
                        alt="Logo WorkGuard"
                        width={100}
                        height={100}
                    />
                    <p>
                        WorkGuard centraliza y valida información crítica sobre empresas, ofreciendo a los consultores una fuente de datos rigurosa, transparente y en tiempo real. Minimiza el riesgo en tus análisis y acelera la investigación corporativa con total confianza.
                    </p>
                </div>

                {/* Redes Sociales */}
                <div className={estilos.redesSociales}>
                    {/* Instagram */}
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <Image
                            src="/img/instagram.png"
                            alt="Instagram"
                            width={20}
                            height={20}
                        />
                    </a>

                    {/* Face*/}
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <Image
                            src="/img/facebook.png"
                            alt="Facebook"
                            width={20}
                            height={20}
                        />
                    </a>

                    {/* X */}
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <Image
                            src="/img/x.png"
                            alt="X"
                            width={20}
                            height={20}
                        />
                    </a>

                    {/* YouTube */}
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <Image
                            src="/img/youtube.png"
                            alt="YouTube"
                            width={20}
                            height={20}
                        />
                    </a>
                </div>

                {/*  Kairós Dev */}
                <div className={estilos.empresa}>
                    <Image
                        src="/img/kairosDev.png"
                        alt="KairósDev"
                        width={100}
                        height={100}
                    />
                </div>
            </div>

            {/*Servicios */}
            <div className={estilos.columna}>
                <h3 className={estilos.columnaTit}>Servicios</h3>
                <ul className={estilos.columnalinks}>
                    <li><Link href="/consulta">Consulta de empresas</Link></li>
                    <li><Link href="/registro">Registro de empresas</Link></li>
                    <li><Link href="/reportar">Reportar una empresa</Link></li>
                    <li><Link href="/faq">Preguntas frecuentes</Link></li>
                </ul>
            </div>

            {/*Información Legal */}
            <div className={estilos.columna}>
                <h3 className={estilos.columnaTit}>Información Legal</h3>
                <ul className={estilos.columnaLink}>
                    <li><Link href="/privacidad">Aviso de Privacidad</Link></li>
                    <li><Link href="/terminos">Términos y condiciones</Link></li>
                    <li><Link href="/politica-uso">Política de uso</Link></li>
                    <li><Link href="/soporte">Contacto y soporte</Link></li>
                </ul>
            </div>

            {/*Compañía */}
            <div className={estilos.columna}>
                <h3 className={estilos.columnaTit}>Compañía</h3>
                <ul className={estilos.columnaLink}>
                    <li><Link href="/nosotros">¿Quiénes somos?</Link></li>
                    <li><Link href="/mision">Misión</Link></li>
                    <li><Link href="/vision">Visión</Link></li>
                    <li><Link href="/respaldo">Organizaciones que nos respaldan</Link></li>
                </ul>
            </div>

            <div className={estilos.derechos}>
                © 2026 WorkGuard. Todos los derechos reservados.
            </div>
        </footer>
    );
}