import Link from "next/link";
import Image from "next/image";
import estilos from "../styles/rol.module.css";
import Footer from "../components/footerlinks";

export default function Roles() {
  return (
    <>
      <div className={estilos["logoEsquina"]}>
        <Link href="/">
          <Image
            src="/img/logo.png"
            alt="Logo WorkGuard"
            width={80}
            height={80}
          />
        </Link>
      </div>

      <p className={estilos["texto"]}>Registrate como...</p>

      <main className={estilos["contenedorbtnrol"]}>
        {/**Boton de consultor  */}
        <Link href="consultor/registroCons" className={estilos["btnOpcion"]}>
          <Image
            src="/img/Consultores.png"
            alt="Consultor"
            width={300}
            height={300}
          />
          <span>Consultor</span>

          <p className={estilos["btninformacion"]}>
            Consulta, revisa y verifica informacion acerca Micro, Pequeñas y
            Medianas Empresas.
          </p>
        </Link>

        {/**Boton de MIpyme */}
        <Link href="mipyme/registroMipyme" className={estilos["btnOpcion"]}>
          <Image src="/img/mipyme.png" alt="MiPyME" width={300} height={300} />
          <span>MiPyME</span>

          <p className={estilos["btninformacionEm"]}>
            Verifica la autenticidad de tus documentos, fortalece la
            credibilidad de tu MiPyME y genera mayor confianza a tus clientes.
          </p>
        </Link>
      </main>
      <Footer />
    </>
  );
}
