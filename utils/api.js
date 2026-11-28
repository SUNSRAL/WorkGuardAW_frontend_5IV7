const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch(endpoint, opciones = {}) {
    const config = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(opciones.headers || {})
        },
        ...opciones
    };

    // Si envías un objeto en body, lo convierte a JSON automáticamente
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    // Si es FormData (por ejemplo al subir fotos), quitamos Content-Type para que el navegador ponga el boundary
    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    const res = await fetch(`${API_URL}${endpoint}`, config);
    const datos = await res.json().catch(() => ({}));

   if (!res.ok) {

    console.error('ERROR EN LA PETICIÓN:', {
        url: `${API_URL}${endpoint}`,
        status: res.status,
        respuesta: datos
    });

    throw new Error(datos.error || 'Error en la petición al servidor');
}

    return datos;
}
