import Link from "next/link";
import Image from "next/image";
import estilos from "../styles/registroCons.module.css";
import Footer from "../components/footerlinks.js";
import {useState} from "react"; 
import{useRouter} from "next/router"; 

export default function RegistroConsultor() {

    const router = useRouter(); 
    //Estados de campos
    const [usuario, setUsuario] = useState("");
    const[nombre, setNombre]= useState(""); 
    const[correo, setCorreo] =useState(""); 
    const [contrasena, setContrasena] = useState("");
    const [confirContrasena, setConfirmContrasena] = useState("");

    //Estados generales
    const[cargando, setCargando] = useState(false); 
    const[Estado]
  return (
    <>
      <div className={estilos["paginaCompleta"]}>
        {/**Carga */}
        {Cargando && <Cargando texto="Verificando datos en WorkGuard..." />}

        {/**logo */}
        <div className={estilos["logoEsquina"]}>
          <Link href="/">
            {/**REGRESO AL ROL.JS */}
            <Image
              src="/img/logo.png"
              alt="Logo WorkGuard"
              width={64}
              height={64}
            />
          </Link>
        </div>


        {/**Contenedor principal del forms registrp */}
        <main className={estilos['contenedorCentrado']}>
            <form
            onSubmit={} {/*/Manejode login¨*/}
            className={estilos['formulario-login']}
            >
                <div className={estilos['encabezado-registro']}>
                    <h2>Registro</h2>
                </div>

                {/**FALTA PONER MENSAJE ERROR CON COLORES VERDE ROJO */}

                <div className={estilos['campo']}>
                    <label htmlFor="usuario">Usuario</label>

                    <div className={estilos['campo-input']}>
                        <image
                        src="../public/img/user.png"
                        alt="Usuario"
                        width={16}
                        height={16}
                        className={estilos['icono-input']}
                        />

                        <input
                        type="text"
                        id="usuario"
                        placeholder="Ingresa un usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                        />
                    </div>

                    <div className={estilos['campo']}>
                        <label htmlFor="correo"></label>

                    </div>

                </div>

            </form>
        </main>
        



      </div>
    </>
  );
}
