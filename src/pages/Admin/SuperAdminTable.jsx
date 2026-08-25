import React from "react";
import { themeQuartz } from "ag-grid-community";
import SuperAdminService from "../../services/UserService";
import DataGrid from "../../components/DataGrid";
import ActionIconButton from "../../components/Common/ActionIconButton";

function SuperAdminTable({ data, onEdit, refreshData }) {
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const handleDelete = (superAdmin) => {
    const id =
      superAdmin?.userId ?? superAdmin?.user_id ?? superAdmin?.superAdminId;

    if (!id) {
      console.error("Cannot delete super admin without an ID:", superAdmin);
      alert("Unable to delete Super Admin: ID is missing.");
      return;
    }

    if (!window.confirm("Delete this Super Admin?")) return;

    SuperAdminService.deleteSuperAdmin(id)
      .then(() => {
        alert("Super Admin deleted successfully!");
        refreshData();
      })
      .catch((error) => {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to delete Super Admin.";

        console.error("Delete Error:", error.response?.data || error);
        alert(`Failed to delete Super Admin: ${message}`);
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
          <ActionIconButton
            type="edit"
            onClick={() => onEdit(params.data)}
            title="Edit super admin"
          />

          <ActionIconButton
            type="delete"
            onClick={() => handleDelete(params.data)}
            title="Delete super admin"
          />
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

export default SuperAdminTable;
