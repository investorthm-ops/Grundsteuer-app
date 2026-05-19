const REQUIRED_HEADERS = ['name', 'bundesland', 'grundsteuer_b', 'datenstand', 'quellenname']

export type ParsedCsv = {
  headers: string[]
  rows: Record<string, string>[]
  delimiter: ',' | ';'
}

function splitCsvLine(line: string, delimiter: ',' | ';') {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function detectDelimiter(headerLine: string): ',' | ';' {
  const semicolonCount = (headerLine.match(/;/g) ?? []).length
  const commaCount = (headerLine.match(/,/g) ?? []).length
  return semicolonCount > commaCount ? ';' : ','
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase()
}

export function parseCsv(content: string): ParsedCsv {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error('Die CSV enthaelt keine Datenzeilen.')
  }

  const delimiter = detectDelimiter(lines[0])
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader)
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header))

  if (missingHeaders.length > 0) {
    throw new Error(`Pflichtspalten fehlen: ${missingHeaders.join(', ')}`)
  }

  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line, delimiter)
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index]?.trim() ?? ''
      return row
    }, {})
  })

  return { headers, rows, delimiter }
}
