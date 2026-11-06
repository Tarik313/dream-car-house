"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "./Input";
import { Select, type SelectOption } from "./Select";
import { Button } from "./Button";

export interface FilterOption {
  param?: string;
  key?: string;
  label: string;
  placeholder?: string;
  value?: string;
  options: readonly SelectOption[];
}

export interface FilterBarProps {
  searchParam?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filters?: readonly FilterOption[];
  onFilterChange?: (key: string, val: string) => void;
  actions?: ReactNode;
  className?: string;
}

export function FilterBar({
  searchParam = "q",
  searchPlaceholder = "Search records…",
  searchValue,
  onSearchChange,
  filters = [],
  onFilterChange,
  actions,
  className = "",
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [internalVal, setInternalVal] = useState(searchParams.get(searchParam) || "");
  const searchVal = searchValue !== undefined ? searchValue : internalVal;

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    // Changing filter or search MUST reset pagination to page 1
    params.set("page", "1");

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchVal);
    } else {
      updateQuery({ [searchParam]: searchVal });
    }
  }

  function handleClear() {
    setInternalVal("");
    if (onSearchChange) onSearchChange("");
    const clears: Record<string, null> = { [searchParam]: null, page: null };
    for (const f of filters) {
      const p = f.param || f.key;
      if (p) clears[p] = null;
    }
    updateQuery(clears);
  }

  const hasActiveFilters =
    Boolean(searchParams.get(searchParam)) ||
    filters.some((f) => Boolean(searchParams.get(f.param || f.key || "")));

  return (
    <div className={`ui-filterbar ${className}`.trim()} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)" }}>
      <form onSubmit={handleSearchSubmit} className="ui-filterbar__search-form" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={searchVal}
          onChange={(e) => {
            setInternalVal(e.target.value);
            if (onSearchChange) onSearchChange(e.target.value);
          }}
          aria-label={searchPlaceholder}
          className="ui-filterbar__search-input"
          disabled={isPending}
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          isLoading={isPending}
        >
          <Search size={14} style={{ marginRight: 4 }} /> Search
        </Button>
      </form>

      {filters.length > 0 && (
        <div className="ui-filterbar__filters" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)" }}>
          {filters.map((f) => {
            const paramKey = f.param || f.key || "";
            const currentValue = f.value !== undefined ? f.value : (searchParams.get(paramKey) || "");
            return (
              <div key={paramKey} className="ui-filterbar__filter-item">
                <Select
                  value={currentValue}
                  placeholder={f.placeholder || f.label}
                  options={f.options}
                  aria-label={f.label}
                  disabled={isPending}
                  onChange={(e) => {
                    if (onFilterChange) {
                      onFilterChange(paramKey, e.target.value);
                    } else {
                      updateQuery({ [paramKey]: e.target.value });
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={isPending}
          className="ui-filterbar__clear"
        >
          <RotateCcw size={12} style={{ marginRight: 4 }} /> Reset filters
        </Button>
      )}

      {actions && (
        <div className="ui-filterbar__actions" style={{ marginLeft: "auto" }}>
          {actions}
        </div>
      )}
    </div>
  );
}
