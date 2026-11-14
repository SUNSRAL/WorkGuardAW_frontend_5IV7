import estilos from '../styles/Cargando.module.css'; 

export default function Cargando({ texto = "Cargando información..." }) {
    return (
        <div className={estilos.overlayCargando}>
            <div className={estilos.spinnerContainer}>
                <div className={estilos.spinner}></div>
                <p className={estilos.textoCargando}>{texto}</p>
            </div>
        </div>
    );
}