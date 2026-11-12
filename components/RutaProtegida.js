import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function RutaProtegida({ children, rolPermitido }) {
    const router = useRouter();
    const [autorizado, setAutorizado] = useState(false);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        async function verificarAcceso() {
            try {

                //Verifica su sesion y lo manda a login si no tiene//
                const res = await fetch(`${API_URL}/api/auth/verificar`, {
                    credentials: 'include' 
                });
                if (!res.ok) {
                    router.replace('/login');
                    return;
                }

                //Verifica su rol y lo redirje a su rol//
                const datos = await res.json();

                if (rolPermitido && datos.usuario.rol !== rolPermitido) {
                    router.replace(`/${datos.usuario.rol}`); 
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
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Verificando sesión...</p>;
    }

    return children;
}
