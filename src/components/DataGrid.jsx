import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ValidationModule,
    ModuleRegistry,
    themeQuartz,
} from "ag-grid-community";

import "ag-grid-community/styles/ag-theme-quartz.css";

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
    ...rest
}) {
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

    return (
        <div
            className={className ? `ag-theme-quartz ${className}` : "ag-theme-quartz"}
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
                {...rest}
            />
        </div>
    );
}

export default DataGrid;