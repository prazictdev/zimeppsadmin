/**
 * Client-side CSV export for report section data. Works on the already-fetched
 * payload — no server round-trip. Handles quoting/escaping and heterogeneous
 * row shapes (the column set is the union of keys across rows).
 */
export const useCsvExport = () => {
  const escapeCell = (value) => {
    if (value === null || value === undefined) return ''
    let str
    if (typeof value === 'object') {
      str = JSON.stringify(value)
    } else {
      str = String(value)
    }
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const columnsOf = (rows) => {
    const keys = []
    rows.forEach((row) => {
      Object.keys(row ?? {}).forEach((key) => {
        if (!keys.includes(key)) keys.push(key)
      })
    })
    return keys
  }

  /**
   * Convert an array of row objects to a CSV string (with header row).
   */
  const rowsToCsv = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return ''
    const columns = columnsOf(rows)
    const header = columns.map(escapeCell).join(',')
    const body = rows
      .map((row) => columns.map((col) => escapeCell(row?.[col])).join(','))
      .join('\r\n')
    return `${header}\r\n${body}`
  }

  const triggerDownload = (filename, content) => {
    if (!import.meta.client) return
    const blob = new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const slug = (value) =>
    String(value ?? 'report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'report'

  /**
   * Download a single section's data as a CSV file.
   */
  const downloadRows = (filename, rows) => {
    triggerDownload(filename, rowsToCsv(rows))
  }

  /**
   * Download the whole report as one CSV, one block per section.
   */
  const downloadReport = (payload) => {
    if (!payload) return
    const blocks = (payload.sections ?? []).map((section) => {
      const csv = rowsToCsv(section.data ?? [])
      return `# ${section.title}\r\n${csv || '(no data)'}`
    })
    const content = blocks.join('\r\n\r\n')
    triggerDownload(`${slug(payload.report_type)}-report.csv`, content)
  }

  return { rowsToCsv, downloadRows, downloadReport, slug }
}
