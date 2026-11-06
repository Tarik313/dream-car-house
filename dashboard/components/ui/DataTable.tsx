"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useMemo, type ReactNode } from "react";
import { Checkbox } from "./Checkbox";
import { Dropdown } from "./Dropdown";
import { Button } from "./Button";
import { Pagination } from "./Pagination";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export interface ColumnDef<T> {
  id: string;
  header: string;
  cell?: (row: T) => ReactNode;
  accessor?: (row: T) => ReactNode;
  isIdentifying?: boolean; // pinned, non-hideable
  sortable?: boolean;
  width?: string;
}

export interface DataTableAction<T> {
  id: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  permission?: string;
  onClick: (rows: readonly T[]) => void;
}

export interface DataTableProps<T extends { id: string | number }> {
  columns: readonly ColumnDef<T>[];
  data: readonly T[];
  totalRows?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  identifyingKey?: keyof T;
  identifyingColumnIndex?: number;
  actions?: readonly DataTableAction<T>[];
  userPermissions?: readonly string[];
  sortParam?: string;
  orderParam?: string;
  isLoading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  totalRows,
  currentPage,
  pageSize,
  identifyingKey,
  identifyingColumnIndex,
  actions = [],
  userPermissions = [],
  sortParam = "ordering",
  isLoading = false,
  emptyState,
  className = "",
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Explicit selection state
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Column visibility state (identifying column is strictly immutable)
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(new Set());

  // Current ordering from URL
  const currentOrdering = searchParams.get(sortParam) || "";

  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((c) => c.isIdentifying || !hiddenColumnIds.has(c.id)),
    [columns, hiddenColumnIds]
  );

  const identifyingColumn = useMemo(() => {
    if (typeof identifyingColumnIndex === "number" && columns[identifyingColumnIndex]) {
      return columns[identifyingColumnIndex];
    }
    if (identifyingKey) {
      return columns.find((c) => c.id === String(identifyingKey)) || columns[0];
    }
    return columns.find((c) => c.isIdentifying) || columns[0];
  }, [columns, identifyingKey, identifyingColumnIndex]);

  // Filter actions based on permissions
  const availableActions = useMemo(() => {
    return actions.filter((act) => {
      if (!act.permission) return true;
      if (userPermissions.includes("*")) return true;
      return userPermissions.includes(act.permission);
    });
  }, [actions, userPermissions]);

  // Checkbox selection calculations
  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(row.id));
  const isIndeterminate = data.some((row) => selectedIds.has(row.id)) && !allSelected;

  function handleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((r) => r.id)));
    }
  }

  function handleSelectRow(id: string | number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSort(columnId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Sorting always resets page to 1

    let nextOrdering = columnId;
    if (currentOrdering === columnId) {
      nextOrdering = `-${columnId}`;
    } else if (currentOrdering === `-${columnId}`) {
      nextOrdering = ""; // Reset
    }

    if (nextOrdering) {
      params.set(sortParam, nextOrdering);
    } else {
      params.delete(sortParam);
    }

    // Reset row selection on sorting change to prevent selection desynchronization
    setSelectedIds(new Set());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function toggleColumnVisibility(colId: string) {
    if (identifyingColumn && colId === identifyingColumn.id) return; // Cannot hide identifying column
    setHiddenColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  }

  const selectedRows = useMemo(
    () => data.filter((row) => selectedIds.has(row.id)),
    [data, selectedIds]
  );

  return (
    <div className={`ui-datatable-wrapper ${className}`.trim()}>
      {/* Table Toolbar */}
      <div className="ui-datatable-toolbar">
        <div className="ui-datatable-toolbar__selection">
          {selectedIds.size > 0 && (
            <span className="ui-datatable-toolbar__badge">
              {selectedIds.size} row(s) selected
            </span>
          )}
        </div>

        <div className="ui-datatable-toolbar__actions">
          {/* Permission-aware Batch Actions */}
          {selectedIds.size > 0 && availableActions.length > 0 && (
            <div className="ui-datatable-batch-actions">
              {availableActions.map((act) => (
                <Button
                  key={act.id}
                  variant={act.danger ? "danger" : "secondary"}
                  size="sm"
                  leftIcon={act.icon}
                  onClick={() => act.onClick(selectedRows)}
                >
                  {act.label}
                </Button>
              ))}
            </div>
          )}

          {/* Column Visibility Control */}
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm">
                Columns ▾
              </Button>
            }
            items={columns.map((col) => {
              const isColIdentifying = col.id === identifyingColumn?.id;
              const isVisible = isColIdentifying || !hiddenColumnIds.has(col.id);
              return {
                id: col.id,
                label: `${isVisible ? "✓ " : "   "}${col.header}${isColIdentifying ? " (Pinned)" : ""}`,
                disabled: isColIdentifying,
                onClick: () => toggleColumnVisibility(col.id),
              };
            })}
          />
        </div>
      </div>

      {/* Main Table Scroll Container */}
      <div className="ui-datatable-container" tabIndex={0} role="region" aria-label="Data Table">
        <table className="ui-datatable">
          <thead className="ui-datatable__head">
            <tr>
              {/* Sticky Checkbox Header */}
              <th className="ui-datatable__th ui-datatable__th--sticky-checkbox">
                <Checkbox
                  id="select-all-rows"
                  checked={allSelected}
                  isIndeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>

              {visibleColumns.map((col) => {
                const isIdCol = col.id === identifyingColumn?.id;
                const isSorted = currentOrdering === col.id;
                const isSortedDesc = currentOrdering === `-${col.id}`;

                const thClasses = [
                  "ui-datatable__th",
                  isIdCol ? "ui-datatable__th--sticky-identifying" : "",
                  col.sortable ? "ui-datatable__th--sortable" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <th
                    key={col.id}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    className={thClasses}
                    aria-sort={isSorted ? "ascending" : isSortedDesc ? "descending" : undefined}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className="ui-datatable__sort-btn"
                        disabled={isPending}
                      >
                        <span>{col.header}</span>
                        <span className="ui-datatable__sort-indicator" aria-hidden="true" style={{ display: "inline-flex", alignItems: "center" }}>
                          {isSorted ? <ArrowUp size={12} /> : isSortedDesc ? <ArrowDown size={12} /> : <ArrowUpDown size={12} />}
                        </span>
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="ui-datatable__body">
            {isLoading ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="ui-datatable__td-loading">
                  <div className="ui-datatable__loading-state">
                    <span className="ui-spinner" aria-hidden="true" />
                    <span>Loading records…</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="ui-datatable__td-empty">
                  {emptyState || (
                    <div className="ui-datatable__empty-state">
                      <p>No records found.</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`ui-datatable__tr ${isSelected ? "ui-datatable__tr--selected" : ""}`}
                  >
                    {/* Sticky Checkbox Cell */}
                    <td className="ui-datatable__td ui-datatable__td--sticky-checkbox">
                      <Checkbox
                        id={`select-row-${row.id}`}
                        checked={isSelected}
                        onChange={() => handleSelectRow(row.id)}
                        aria-label={`Select record ${row.id}`}
                      />
                    </td>

                    {/* Columns Cells */}
                    {visibleColumns.map((col) => {
                      const isIdCol = col.id === identifyingColumn?.id;
                      const tdClasses = [
                        "ui-datatable__td",
                        isIdCol ? "ui-datatable__td--sticky-identifying" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      const renderFn = col.cell || col.accessor;
                      return (
                        <td key={col.id} className={tdClasses}>
                          {renderFn ? renderFn(row) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {currentPage !== undefined && totalRows !== undefined && (
        <div style={{ marginTop: "var(--space-3)" }}>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalRows / (pageSize || 12))}
            totalRows={totalRows}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
}
