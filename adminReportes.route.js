// ============================================================
//  RUTA BACKEND: /api/admin/reportes
//  Framework: Express.js + PostgreSQL (pg)
//
//  INSTRUCCIONES DE INTEGRACIÓN:
//  1. Coloca este archivo en tu carpeta de rutas (ej. routes/)
//  2. En tu archivo principal (server.js / index.js) agrega:
//       import adminReportesRouter from './routes/adminReportes.route.js';
//       app.use('/api/admin/reportes', adminReportesRouter);
//  3. Para fotos de perfil, agrega en server.js:
//       import path from 'path';
//       app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//     Y crea la carpeta: uploads/fotos-perfil/
//  4. Ajusta la importación de `pool` según la ubicación de tu db.js
//  5. Descomenta el middleware `verificarAdmin` y adáptalo a tu sesión
// ============================================================

import express from 'express';
import pool from '../db.js'; // ← AJUSTA la ruta a tu archivo de conexión PostgreSQL

const router = express.Router();

// ──────────────────────────────────────────────────────────
// MIDDLEWARE: Verificar que el usuario tenga rol de admin
// Descomenta y adapta a tu implementación de sesiones
// ──────────────────────────────────────────────────────────
// function verificarAdmin(req, res, next) {
//   if (!req.session?.usuario || req.session.usuario.rol !== 'admin') {
//     return res.status(403).json({ error: 'Acceso denegado' });
//   }
//   next();
// }

// ══════════════════════════════════════════════════════════
//  GET /api/admin/reportes
//  Devuelve todos los reportes con datos del consultor
//  que los generó y el nombre de la empresa reportada.
//
//  Response JSON:
//  {
//    "total_nuevos": 4,
//    "reportes": [
//      {
//        "id_reporte": 1,
//        "id_mipyme": 1,
//        "id_consultor": 2,
//        "motivo": "COBRO_POR_CONTRATACION",
//        "otro_motivo": null,
//        "descripcion": "...",
//        "estado": "PENDIENTE",
//        "fecha_reporte": "2026-11-15T...",
//        "fecha_revision": null,
//        "usuario": "roberto64",
//        "nombre_completo": "Roberto Mendoza García",
//        "correo_electronico": "roberto64@workguard.mx",
//        "foto_perfil": null,
//        "nombre_empresa": "Empresa XYZ"  ← viene del JOIN con mipyme
//      },
//      ...
//    ]
//  }
// ══════════════════════════════════════════════════════════
router.get('/', /* verificarAdmin, */ async (req, res) => {
  try {
    const query = `
      SELECT
        r.id_reporte,
        r.id_mipyme,
        r.id_consultor,
        r.motivo,
        r.otro_motivo,
        r.descripcion,
        r.estado,
        r.fecha_reporte,
        r.fecha_revision,
        -- Datos del consultor que generó el reporte:
        c.usuario,
        c.nombre_completo,
        c.correo_electronico,
        c.foto_perfil,
        -- ⚠ Nombre de la empresa:
        -- Ajusta "mipyme" y "nombre_empresa" al nombre real
        -- de tu tabla y columna de empresas/MiPyMEs.
        -- Si tu tabla se llama "empresa" y la columna "razon_social":
        --   e.razon_social AS nombre_empresa
        m.nombre_empresa
      FROM reporte r
      INNER JOIN consultor c ON r.id_consultor = c.id_consultor
      LEFT  JOIN mipyme m    ON r.id_mipyme    = m.id_mipyme
      ORDER BY r.fecha_reporte DESC
    `;

    const { rows } = await pool.query(query);

    // Contar los reportes en estado PENDIENTE
    const total_nuevos = rows.filter(r => r.estado === 'PENDIENTE').length;

    res.json({
      total_nuevos,
      reportes: rows,
    });

  } catch (error) {
    console.error('[adminReportes] Error al obtener reportes:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ══════════════════════════════════════════════════════════
//  GET /api/admin/reportes/:id
//  Devuelve el detalle completo de un reporte por su ID.
//  Usado por la página reporteDetalle.js
// ══════════════════════════════════════════════════════════
router.get('/:id', /* verificarAdmin, */ async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID de reporte inválido' });
  }

  try {
    const query = `
      SELECT
        r.id_reporte,
        r.id_mipyme,
        r.id_consultor,
        r.motivo,
        r.otro_motivo,
        r.descripcion,
        r.estado,
        r.fecha_reporte,
        r.fecha_revision,
        c.usuario,
        c.nombre_completo,
        c.correo_electronico,
        c.foto_perfil,
        m.nombre_empresa
      FROM reporte r
      INNER JOIN consultor c ON r.id_consultor = c.id_consultor
      LEFT  JOIN mipyme m    ON r.id_mipyme    = m.id_mipyme
      WHERE r.id_reporte = $1
    `;

    const { rows } = await pool.query(query, [Number(id)]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json({ reporte: rows[0] });

  } catch (error) {
    console.error('[adminReportes] Error al obtener detalle:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
