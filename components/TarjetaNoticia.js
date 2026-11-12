import estilo from "./TarjetaNoticia.module.css";

export default function TarjetaNoticia({ noticia }) {
    return (
        <div className={estilo['tarjeta-noticia']}>
            <h3>{noticia.titulo}</h3>
            <p>{noticia.descripcion}</p>
        </div>
    );
}