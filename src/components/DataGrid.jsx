import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ValidationModule,
    ModuleRegistry,
    themeQuartz,
} from "ag-grid-community";
import { FaSearch } from "react-icons/fa";

import "ag-grid-community/styles/ag-theme-quartz.css";
import "./Common/AgGridTheme.css";

ModuleRegistry.registerModules([
    AllCommunityModule,
    ValidationModule,
]);

function DataGrid({
    rowData,
    columnDefs,
    height = 500,
    pageSize = 10,
    loading = false,
    defaultColDef,
    theme = themeQuartz,
    rowHeight = 50,
    popupParent,
    paginationPageSizeSelector = false,
    className,
    containerStyle = {},
    noRowsMessage = "No rows to show",
    title,
    description,
    toolbarFilters,
    quickFilterText,
    onQuickFilterTextChange,
    searchable = true,
    searchPlaceholder = "Search records...",
    countLabel = "record",
    countLabelPlural = `${countLabel}s`,
    ...rest
}) {
    const [internalQuickFilter, setInternalQuickFilter] = useState("");
    const activeQuickFilter = quickFilterText ?? internalQuickFilter;

    const mergedDefaultColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        ...defaultColDef,
    };

    const resolvedHeight =
        typeof height === "number" ? `${height}px` : height;
    const resolvedPopupParent =
        popupParent ?? (typeof document !== "undefined" ? document.body : undefined);

    const rows = Array.isArray(rowData) ? rowData : [];
    const hasToolbar = title || description || searchable || toolbarFilters;

    const handleQuickFilterChange = (value) => {
        if (onQuickFilterTextChange) {
            onQuickFilterTextChange(value);
        } else {
            setInternalQuickFilter(value);
        }
    };

    return (
        <div className={`shared-ag-grid-block${hasToolbar ? " has-toolbar" : ""}`}>
            {hasToolbar && (
                <div className={`shared-ag-grid-toolbar${toolbarFilters ? " has-filters" : ""}`}>
                    <div className="shared-ag-grid-toolbar-main">
                        <div className="shared-ag-grid-heading">
                            {title && <h3>{title}</h3>}
                            {description && <p>{description}</p>}
                        </div>
                        <div className="shared-ag-grid-tools">
                            <span className="shared-ag-grid-count">
                                {rows.length} {rows.length === 1 ? countLabel : countLabelPlural}
                            </span>
                            {searchable && (
                                <label className="shared-ag-grid-search">
                                    <FaSearch aria-hidden="true" />
                                    <input
                                        type="search"
                                        aria-label={searchPlaceholder}
                                        placeholder={searchPlaceholder}
                                        value={activeQuickFilter}
                                        onChange={(event) => handleQuickFilterChange(event.target.value)}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                    {toolbarFilters && (
                        <div className="shared-ag-grid-filter-row">{toolbarFilters}</div>
                    )}
                </div>
            )}
            <div
                className={className ? `ag-theme-quartz shared-ag-grid ${className}` : "ag-theme-quartz shared-ag-grid"}
                style={{
                    height: resolvedHeight,
                    width: "100%",
                    ...containerStyle,
                }}
            >
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={mergedDefaultColDef}
                    pagination
                    paginationPageSize={pageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                    loading={loading}
                    rowHeight={rowHeight}
                    popupParent={resolvedPopupParent}
                    theme={theme}
                    overlayNoRowsTemplate={noRowsMessage}
                    quickFilterText={activeQuickFilter}
                    {...rest}
                />
            </div>
        </div>
    );
}

export default DataGrid;
