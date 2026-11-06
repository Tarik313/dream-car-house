"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRows?: number;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalRows,
  pageSize = 12,
  pageSizeOptions = [12, 24, 48],
  className = "",
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function createPageUrl(page: number, size?: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    if (size) params.set("page_size", String(size));
    return `${pathname}?${params.toString()}`;
  }

  if (totalPages <= 1 && !totalRows) return null;

  return (
    <nav
      aria-label="Pagination"
      className={`ui-pagination ${className}`.trim()}
    >
      {totalRows !== undefined && (
        <span className="ui-pagination__info">
          Showing page <strong>{currentPage}</strong> of <strong>{Math.max(1, totalPages)}</strong> ({totalRows} total)
        </span>
      )}

      <div className="ui-pagination__controls">
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="ui-pagination__button"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} style={{ marginRight: 4 }} /> Prev
          </Link>
        ) : (
          <span className="ui-pagination__button ui-pagination__button--disabled" aria-disabled="true">
            <ChevronLeft size={14} style={{ marginRight: 4 }} /> Prev
          </span>
        )}

        <span className="ui-pagination__pages" aria-current="page">
          {currentPage} / {Math.max(1, totalPages)}
        </span>

        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="ui-pagination__button"
            aria-label="Next page"
          >
            Next <ChevronRight size={14} style={{ marginLeft: 4 }} />
          </Link>
        ) : (
          <span className="ui-pagination__button ui-pagination__button--disabled" aria-disabled="true">
            Next <ChevronRight size={14} style={{ marginLeft: 4 }} />
          </span>
        )}
      </div>

      {pageSizeOptions.length > 0 && (
        <div className="ui-pagination__size">
          <label htmlFor="ui-page-size-select" className="ui-pagination__size-label">
            Rows per page:
          </label>
          <select
            id="ui-page-size-select"
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              window.location.href = createPageUrl(1, newSize);
            }}
            className="ui-select ui-select--sm"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </nav>
  );
}
