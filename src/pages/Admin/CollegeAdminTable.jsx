import React from "react";
import { themeQuartz } from "ag-grid-community";
import UserService from "../../services/UserService";
import DataGrid from "../../components/DataGrid";
import ActionIconButton from "../../components/Common/ActionIconButton";

function CollegeAdminTable({ data, onEdit, refreshData }) {
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  // DELETE COLLEGE ADMIN

  const handleDelete = (id) => {
    if (!id) {
      alert("College Admin ID is missing.");
      return;
    }

    if (!window.confirm("Delete this College Admin?")) {
      return;
    }

    UserService.deleteCollegeAdmin(id)
      .then(() => {
        alert("College Admin deleted successfully!");
        refreshData();
      })
      .catch((error) => {
        console.error("Delete Error:", error);

        alert(
          error?.response?.data?.message || "Failed to delete College Admin.",
        );
      });
  };

  // COLUMN DEFINITIONS

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
      headerName: "College Name",
      width: 180,
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

    // ACTION

    {
      headerName: "Action",
      width: 110,
      minWidth: 110,
      sortable: false,
      filter: false,

      cellRenderer: (params) => {
        if (!params.data) {
          return null;
        }

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "100%",
              width: "100%",
            }}
          >
            {/* EDIT */}

            <ActionIconButton
              type="edit"
              onClick={() => onEdit(params.data)}
              title="Edit College Admin"
            />

            {/* DELETE */}

            <ActionIconButton
              type="delete"
              onClick={() => handleDelete(params.data.userId)}
              title="Delete College Admin"
            />
          </div>
        );
      },
    },
  ];

  // UI

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

      <DataGrid
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={themeQuartz}
        height="500px"
        pageSize={10}
        paginationPageSizeSelector={false}
        rowHeight={50}
      />
    </div>
  );
}

export default CollegeAdminTable;
