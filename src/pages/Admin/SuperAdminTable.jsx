import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ValidationModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";

ModuleRegistry.registerModules([AllCommunityModule, ValidationModule]);

function SuperAdminTable({ data, onEdit }) {
  const [superAdmins, setSuperAdmins] = useState(data || []);

  useEffect(() => {
    setSuperAdmins(data || []);
  }, [data]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this Super Admin?")) {
      setSuperAdmins((prev) => prev.filter((item) => item.superAdminId !== id));
    }
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
      width: 150,
    },
    {
      field: "designation",
      headerName: "Designation",
      width: 170,
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
            onClick={() => onEdit(params.data)}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "4px 14px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(params.data.superAdminId)}
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "4px 14px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
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
          rowData={superAdmins}
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

export default SuperAdminTable;
