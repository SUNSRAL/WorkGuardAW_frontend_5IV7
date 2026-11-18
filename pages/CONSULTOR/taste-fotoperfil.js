import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient'; // Ajusta si la ruta de tu utils es diferente

export default function TestFoto() {
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [urlImagen, setUrlImagen] = useState('');

  // ID de prueba (puedes usar el id_consultor = 23 de Roberto que metimos en la base de datos)
  const idConsultorPrueba = 23; 

  const manejarCambioArchivo = async (e) => {
    try {
      setSubiendo(true);
      setMensaje('');

      const archivo = e.target.files[0];
      if (!archivo) return;

      // 1. Crear un nombre único para el archivo
      const ext = archivo.name.split('.').pop();
      const nombreArchivo = `consultor_${idConsultorPrueba}_${Date.now()}.${ext}`;

      // 2. Subir al bucket "fotos_perfil" que configuraste en Supabase
      const { data, error } = await supabase.storage
        .from('fotos_perfil')
        .upload(nombreArchivo, archivo);

      if (error) throw error;

      // 3. Obtener la URL pública permanente
      const { data: urlData } = supabase.storage
        .from('fotos_perfil')
        .getPublicUrl(nombreArchivo);

      const urlPublica = urlData.publicUrl;
      setUrlImagen(urlPublica);
      setMensaje('¡Foto subida con éxito a Supabase Storage!');

      console.log('URL para guardar en la BD:', urlPublica);

    } catch (error) {
      console.error('Error al subir:', error.message);
      setMensaje(`Error: ${error.message}`);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2>Prueba de Subida de Foto de Perfil - WorkGuard</h2>
      <p>Selecciona una imagen desde tu explorador para probar la subida a la nube:</p>

      {/* Input nativo que abre el explorador de archivos */}
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/jpg" 
        onChange={manejarCambioArchivo} 
        disabled={subiendo}
      />

      {subiendo && <p style={{ color: 'blue' }}>Subiendo imagen a Supabase...</p>}
      {mensaje && <p style={{ fontWeight: 'bold' }}>{mensaje}</p>}

      {/* Vista previa de la imagen subida */}
      {urlImagen && (
        <div style={{ marginTop: '20px' }}>
          <p>Vista previa desde la nube:</p>
          <img src={urlImagen} alt="Foto subida" width="150" style={{ borderRadius: '50%' }} />
          <p style={{ fontSize: '12px', color: 'gray' }}>URL: {urlImagen}</p>
        </div>
      )}
    </div>
  );
}