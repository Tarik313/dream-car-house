"use client";

import { useState, type ReactNode, type KeyboardEvent } from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items?: readonly TabItem[];
  tabs?: readonly TabItem[];
  activeId?: string;
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ items, tabs, activeId, activeTab, onChange, className = "" }: TabsProps) {
  const resolvedItems = items || tabs || [];
  const resolvedActive = activeId !== undefined ? activeId : activeTab;
  const [internalActive, setInternalActive] = useState(resolvedActive || resolvedItems[0]?.id || "");
  const currentActive = resolvedActive !== undefined ? resolvedActive : internalActive;

  function selectTab(id: string) {
    if (resolvedActive === undefined) setInternalActive(id);
    onChange?.(id);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const enabledTabs = resolvedItems.filter((t) => !t.disabled);
    const currentIndex = enabledTabs.findIndex((t) => t.id === currentActive);
    if (currentIndex === -1) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
      if (nextTab) selectTab(nextTab.id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevTab = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
      if (prevTab) selectTab(prevTab.id);
    } else if (e.key === "Home") {
      e.preventDefault();
      const first = enabledTabs[0];
      if (first) selectTab(first.id);
    } else if (e.key === "End") {
      e.preventDefault();
      const last = enabledTabs[enabledTabs.length - 1];
      if (last) selectTab(last.id);
    }
  }

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={`ui-tablist ${className}`.trim()}
    >
      {resolvedItems.map((tab) => {
        const isSelected = tab.id === currentActive;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={isSelected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isSelected ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => selectTab(tab.id)}
            className={`ui-tab ${isSelected ? "ui-tab--selected" : ""}`}
          >
            <span>{tab.label}</span>
            {tab.badge && <span className="ui-tab__badge">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
