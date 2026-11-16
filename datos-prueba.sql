-- ============================================================
--  DATOS DE PRUEBA — WorkGuard
--  Tablas: consultor, reporte
--  Motor: PostgreSQL
--  Instrucciones:
--    1. Ejecuta este script en tu cliente SQL (pgAdmin, DBeaver, psql)
--    2. Ajusta los id_mipyme a IDs válidos de tu tabla de empresas
--    3. Las contraseñas son texto plano de prueba — reemplaza
--       por hashes bcrypt antes de pasar a producción
-- ============================================================

-- ──────────────────────────────────────────
-- 1. Agregar columna foto_perfil al consultor
--    (se salta si ya existe)
-- ──────────────────────────────────────────
ALTER TABLE consultor
  ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(255);

-- ──────────────────────────────────────────
-- 2. Insertar consultores de prueba
--    (ON CONFLICT evita duplicados si ya existen)
-- ──────────────────────────────────────────
INSERT INTO consultor (usuario, contrasena, correo_electronico, nombre_completo, foto_perfil)
VALUES
  ('roberto64',  'consul123', 'roberto64@workguard.mx',  'Roberto Mendoza García',  NULL),
  ('sofia_mend', 'consul123', 'sofia.mend@workguard.mx', 'Sofía Mendoza Torres',    NULL),
  ('carlos_v',   'consul123', 'carlosv@workguard.mx',    'Carlos Vega Ramírez',     NULL)
ON CONFLICT (usuario) DO NOTHING;

-- ──────────────────────────────────────────
-- 3. Insertar reportes de prueba
--
--    ⚠  AJUSTA los id_mipyme a IDs reales
--       de tu tabla mipyme/empresa.
--       Si solo tienes id_mipyme = 1, usa 1 en todos.
-- ──────────────────────────────────────────

-- Reporte 1 — roberto64 / id_mipyme 1
INSERT INTO reporte (id_mipyme, id_consultor, motivo, otro_motivo, descripcion, estado, id_administrador, fecha_reporte, fecha_revision)
SELECT
  1,
  (SELECT id_consultor FROM consultor WHERE usuario = 'roberto64'),
  'COBRO_POR_CONTRATACION',
  NULL,
  'Se detectó estado ''Negativa'' en portal SAT durante la validación automatizada matutina. Afecta facturación del periodo vigente y contratos activos con proveedores nacionales. Se recomienda suspender operaciones hasta regularizar situación fiscal.',
  'PENDIENTE',
  NULL,
  NOW(),
  NULL;

-- Reporte 2 — sofia_mend / id_mipyme 1
INSERT INTO reporte (id_mipyme, id_consultor, motivo, otro_motivo, descripcion, estado, id_administrador, fecha_reporte, fecha_revision)
SELECT
  1,
  (SELECT id_consultor FROM consultor WHERE usuario = 'sofia_mend'),
  'EMPRESA_INEXISTENTE',
  NULL,
  'Folio padrón venció hace 48 horas. Se requiere congelar asignación a contratos vigentes hasta actualización de documentación ante autoridades competentes. El domicilio fiscal no pudo ser verificado en campo.',
  'PENDIENTE',
  NULL,
  NOW() - INTERVAL '1 hour',
  NULL;

-- Reporte 3 — roberto64 / id_mipyme 1
INSERT INTO reporte (id_mipyme, id_consultor, motivo, otro_motivo, descripcion, estado, id_administrador, fecha_reporte, fecha_revision)
SELECT
  1,
  (SELECT id_consultor FROM consultor WHERE usuario = 'roberto64'),
  'DOCUMENTOS_FALSOS',
  NULL,
  'Se identificaron inconsistencias en acta constitutiva proporcionada. Los datos del RFC no coinciden con el nombre registrado ante el SAT al momento de la validación automática del sistema.',
  'PENDIENTE',
  NULL,
  NOW() - INTERVAL '3 hours',
  NULL;

-- Reporte 4 — carlos_v / id_mipyme 1
INSERT INTO reporte (id_mipyme, id_consultor, motivo, otro_motivo, descripcion, estado, id_administrador, fecha_reporte, fecha_revision)
SELECT
  1,
  (SELECT id_consultor FROM consultor WHERE usuario = 'carlos_v'),
  'COBRO_POR_CONTRATACION',
  NULL,
  'El representante legal exigió pago en efectivo previo al inicio del contrato, sin emitir comprobante fiscal. La conducta fue reportada de forma independiente por dos consultores distintos.',
  'PENDIENTE',
  NULL,
  NOW() - INTERVAL '5 hours',
  NULL;

-- Reporte 5 — consul_1 (original) / id_mipyme 1 — ya REVISADO
INSERT INTO reporte (id_mipyme, id_consultor, motivo, otro_motivo, descripcion, estado, id_administrador, fecha_reporte, fecha_revision)
SELECT
  1,
  (SELECT id_consultor FROM consultor WHERE usuario = 'consul_1'),
  'EMPRESA_INEXISTENTE',
  NULL,
  'La dirección fiscal registrada en el RFC no corresponde a ningún domicilio válido verificado en campo. El número telefónico proporcionado no existe en ningún directorio comercial.',
  'REVISADO',
  NULL,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day';

-- ──────────────────────────────────────────
-- 4. Verificación rápida
-- ──────────────────────────────────────────
SELECT
  r.id_reporte,
  c.usuario,
  c.nombre_completo,
  r.motivo,
  r.estado,
  r.fecha_reporte
FROM reporte r
JOIN consultor c ON r.id_consultor = c.id_consultor
ORDER BY r.fecha_reporte DESC;
