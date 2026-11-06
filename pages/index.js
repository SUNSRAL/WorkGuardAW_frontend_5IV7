import { useEffect, useState } from 'react';
import Link from 'next/link';

// URL del backend. En local apunta a localhost:3001, en producción
// se configura en Vercel como variable de entorno apuntando a Render.

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
    return (
        <main>
            <h1>Bienvenido a WorkGuard</h1>
        </main>
    );
}