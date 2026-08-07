import React from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ValidationModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";

import BranchAdminService from "../../services/UserService";

import "ag-grid-community/styles/ag-grid.css";

ModuleRegistry.registerModules([AllCommunityModule, ValidationModule]);

function BranchAdminTable({ data, onEdit, refreshData }) {
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this Branch Admin?")) return;

    BranchAdminService.deleteBranchAdmin(id)
      .then(() => {
        alert("Branch Admin deleted successfully!");
        refreshData();
      })
      .catch((error) => {
        console.error("Delete Error:", error);
        alert("Failed to delete Branch Admin.");
      });
  };

  const columnDefs = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 170,
    },
    {
      field: "employeeId",
      headerName: "Employee ID",
      width: 140,
    },
    {
      field: "designation",
      headerName: "Designation",
      width: 170,
    },
      {
      field: "collegeName",
      headerName: "college Name",
      width: 130,
    },
  
    {
      field: "branchName",
      headerName: "Branch Name",
      width: 130,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 220,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      width: 160,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
      minWidth: 220,
    },
    {
      headerName: "Action",
      width: 190,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "100%",
          }}
        >
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onEdit(params.data)}
          >
            Edit
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(params.data.branchAdminId)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ marginTop: "20px" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .ag-popup {
              min-width: 280px !important;
            }

            .ag-filter-wrapper {
              min-width: 260px !important;
              padding: 16px !important;
            }
          `,
        }}
      />

      <div style={{ height: "500px", width: "100%" }}>
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme={themeQuartz}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={false}
          rowHeight={50}
        />
      </div>
    </div>
  );
}

export default BranchAdminTable;
