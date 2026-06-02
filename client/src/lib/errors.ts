export class AppError extends Error {
  code: string
  hint?: string

  constructor(message: string, code: string = 'UNKNOWN', hint?: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.hint = hint
  }
}

const DB_ERROR_MAP: Record<string, { message: string; hint?: string }> = {
  '23P01': {
    message: 'El empleado ya tiene una cita en ese horario.',
    hint: 'Selecciona otro horario o empleado.',
  },
  '23505': {
    message: 'Este registro ya existe.',
    hint: 'Verifica que los datos no estén duplicados.',
  },
  '23503': {
    message: 'No se puede eliminar porque tiene registros asociados.',
    hint: 'Elimina primero las referencias.',
  },
  '23502': {
    message: 'Faltan campos obligatorios.',
    hint: 'Completa todos los campos requeridos.',
  },
  '22P02': {
    message: 'Formato de datos inválido.',
    hint: 'Verifica que los valores tengan el formato correcto.',
  },
}

function extractDbError(error: unknown): { code: string; message: string; hint?: string } | null {
  if (!error || typeof error !== 'object') return null
  const err = error as Record<string, unknown>
  const code = String(err.code ?? '')
  if (code && DB_ERROR_MAP[code]) return { code, ...DB_ERROR_MAP[code] }
  return null
}

export function handleDbError(error: unknown, fallback: string): never {
  const mapped = extractDbError(error)
  if (mapped) {
    throw new AppError(mapped.message, mapped.code, mapped.hint)
  }
  if (error instanceof AppError) throw error
  if (error instanceof Error) throw new AppError(error.message)
  throw new AppError(fallback)
}
