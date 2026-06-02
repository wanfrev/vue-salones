import { downloadCsv } from './csv'

export function exportToCsv(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h]
      return val !== null && val !== undefined ? String(val).replace(/,/g, '') : ''
    }).join(',')),
  ].join('\n')

  downloadCsv(filename, csvContent)
}
