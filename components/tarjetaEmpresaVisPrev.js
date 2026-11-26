import { useState } from 'react';
import styles from './tarjetaEmpresaVisPrev.css';

export default function TarjetaEmpresa({
    imagen,
    nombre,
    giro,
    ubicacion
}) {
    const [errorImagen, setErrorImagen] = useState(false);

    return (
        <article className={styles.tarjeta}>

            <div className={styles.contenedorImagen}>
                {imagen && !errorImagen ? (
                    <img
                        src={imagen}
                        alt={`Fotografía de ${nombre}`}
                        className={styles.imagen}
                        onError={() => setErrorImagen(true)}
                    />
                ) : (
                    <div className={styles.imagenPredeterminada}>
                        WG
                    </div>
                )}
            </div>

            <div className={styles.informacion}>

                <h3 className={styles.nombre}>
                    {nombre}
                </h3>

                <p className={styles.giro}>
                    {giro}
                </p>

                <p className={styles.ubicacion}>
                    <span>⌖</span> {ubicacion}
                </p>

            </div>

        </article>
    );
}