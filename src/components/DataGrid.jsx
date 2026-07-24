import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ValidationModule,
    ModuleRegistry
} from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
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
}) {

    const defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    };

//     const defaultColDef = {
//     sortable: true,
//     filter: true,
//     resizable: true
//   };

    return (
        <div
            className="ag-theme-quartz"
            style={{
                height,
                width: "100%",
            }}
        >
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination
                paginationPageSize={pageSize}
                loading={loading}
                rowHeight={50}
                popupParent={document.body}
            />
        </div>
    );
}

export default DataGrid;