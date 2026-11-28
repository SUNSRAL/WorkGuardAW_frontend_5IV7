import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '../utils/api';

const RUTAS_INICIO_POR_ROL = {
    administrador: '/admin',
    consultor: '/consultor',
    mipyme: '/mipyme'
};

export default function RutaProtegida({ children, rolPermitido }) {
    const router = useRouter();
    const [autorizado, setAutorizado] = useState(false);

    useEffect(() => {
        async function verificarAcceso() {
            try {
                const datos = await apiFetch('/api/auth/verificar');

                // Rol en arreglo para varios roles y valida el rol del usuario
                if (rolPermitido) {
                    const rolesValidos = Array.isArray(rolPermitido) ? rolPermitido : [rolPermitido];
                    if (!rolesValidos.includes(datos.usuario.rol)) {
                        const rutaDestino = RUTAS_INICIO_POR_ROL[datos.usuario.rol] || '/login';
                        router.replace(rutaDestino);
                        return;
                    }
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
