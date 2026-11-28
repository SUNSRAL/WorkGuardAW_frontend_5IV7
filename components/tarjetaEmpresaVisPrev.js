import { useState } from 'react';
import estilo from './tarjetaEmpresaVisPrev.module.css';

export default function TarjetaEmpresa({
    imagen,
    nombre,
    giro,
    ubicacion
}) {
    const [errorImagen, setErrorImagen] = useState(false);

    return (
        <article className={estilo.tarjeta}>

            <div className={estilo.contenedorImagen}>
                {imagen && !errorImagen ? (
                    <img
                        src={imagen}
                        alt={`Fotografía de ${nombre}`}
                        className={estilo.imagen}
                        onError={() => setErrorImagen(true)}
                    />
                ) : (
                    <div className={estilo.imagenPredeterminada}>
                        WG
                    </div>
                )}
            </div>

            <div className={estilo.informacion}>

                <h3 className={estilo.nombre}>
                    {nombre}
                </h3>

                <p className={estilo.giro}>
                    {giro}
                </p>

                <p className={estilo.ubicacion}>
                    <span>⌖</span> {ubicacion}
                </p>

            </div>

        </article>
    );
}