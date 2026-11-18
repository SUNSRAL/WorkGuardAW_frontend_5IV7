import { useRouter } from 'next/router';
import RutaProtegida from '../../components/RutaProtegida';

export default function PanelAdmin() {
    const router = useRouter();

    const cerrarSesion = async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        router.push('/login');
    };

    return (
        <RutaProtegida rolPermitido="mipyme">
            <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
                <h1>Panel de Administrador - WorkGuard</h1>
                <p>Si ves esto, tu sesión y rol de admin funcionan correctamente.</p>
                <button
                    onClick={cerrarSesion}
                    style={{ padding: '10px 20px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </RutaProtegida>
    );
}
