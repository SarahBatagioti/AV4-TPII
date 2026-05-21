import type { ReactNode } from 'react'

type ColumnDefinition<T> = {
  header: string
  render: (item: T) => ReactNode
  className?: string
}

type PaginatedTableProps<T> = {
  items: T[]
  columns: Array<ColumnDefinition<T>>
  rowKey: (item: T) => string | number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  renderActions: (item: T) => ReactNode
  emptyTitle: string
  emptyDescription: string
  itemLabel: string
}

export function PaginatedTable<T>({
  items,
  columns,
  rowKey,
  page,
  pageSize,
  onPageChange,
  renderActions,
  emptyTitle,
  emptyDescription,
  itemLabel,
}: PaginatedTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const visibleItems = items.slice(startIndex, startIndex + pageSize)
  const startRecord = items.length === 0 ? 0 : startIndex + 1
  const endRecord = items.length === 0 ? 0 : Math.min(startIndex + pageSize, items.length)

  return (
    <div className="section-card">
      <div className="table-shell">
        {items.length === 0 ? (
          <div className="empty-state">
            <h3>{emptyTitle}</h3>
            <p>{emptyDescription}</p>
          </div>
        ) : (
          <table className="clients-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.header} className={column.className}>
                    {column.header}
                  </th>
                ))}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={rowKey(item)}>
                  {columns.map((column) => (
                    <td key={column.header} className={column.className}>
                      {column.render(item)}
                    </td>
                  ))}
                  <td>{renderActions(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination-bar">
        <div className="pagination-info">
          {items.length === 0
            ? 'Nenhum registro disponível.'
            : `Mostrando ${startRecord}-${endRecord} de ${items.length} ${itemLabel}`}
        </div>

        <div className="pagination-controls">
          <button type="button" className="pagination-button" onClick={() => onPageChange(1)} disabled={currentPage === 1 || items.length === 0}>
            «
          </button>
          <button
            type="button"
            className="pagination-button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || items.length === 0}
          >
            ‹
          </button>

          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>

          <button
            type="button"
            className="pagination-button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || items.length === 0}
          >
            ›
          </button>
          <button type="button" className="pagination-button" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || items.length === 0}>
            »
          </button>
        </div>
      </div>
    </div>
  )
}