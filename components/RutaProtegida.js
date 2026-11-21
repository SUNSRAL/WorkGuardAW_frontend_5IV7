import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Mapa exacto entre el rol que devuelve tu backend y las carpetas/archivos de tu Next.js
const RUTAS_INICIO_POR_ROL = {
    administrador: '/admin',
    consultor: '/consultor',
    mipyme: '/mipyme'
};

export default function RutaProtegida({ children, rolPermitido }) {
    const router = useRouter();
    const [autorizado, setAutorizado] = useState(false);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ;

        async function verificarAcceso() {
            try {
                // Consulta al backend enviando la cookie de sesión
                const res = await fetch(`${API_URL}/api/auth/verificar`, {
                    credentials: 'include'
                });

                // Si no hay sesión válida, manda al login
                if (!res.ok) {
                    router.replace('/login');
                    return;
                }

                const datos = await res.json();

                // Si tiene sesión pero su rol no corresponde a esta pantalla, lo redirige a su inicio
                if (rolPermitido && datos.usuario.rol !== rolPermitido) {
                    const rutaDestino = RUTAS_INICIO_POR_ROL[datos.usuario.rol] || '/login';
                    router.replace(rutaDestino);
                    return;
                }

                setAutorizado(true);
            } catch (error) {
                router.replace('/login');
            }
        }

        verificarAcceso();
    }, [router, rolPermitido]);

    if (!autorizado) {
        return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando...</p>;
    }

    return children;
}
