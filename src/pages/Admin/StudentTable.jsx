import React from "react";
import { themeQuartz } from "ag-grid-community";
import StudentService from "../../services/UserService";
import DataGrid from "../../components/DataGrid";
import ActionIconButton from "../../components/Common/ActionIconButton";

function StudentTable({ data, onEdit, onDeleted, refreshData }) {
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const handleDelete = (student) => {
    const userId = student.userId || student.user_id;

    if (!userId) {
      console.error("Cannot delete student without an ID:", student);
      alert("Unable to delete Student: student ID is missing.");
      return;
    }

    if (!window.confirm("Delete this Student?")) return;

    StudentService.deleteStudent(userId)
      .then(async () => {
        if (onDeleted) {
          await onDeleted(userId);
        } else {
          await refreshData();
        }

        alert("Student deleted successfully!");
      })
      .catch((error) => {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to delete Student.";

        console.error("Delete Error:", error.response?.data || error);
        alert(`Failed to delete Student: ${message}`);
      });
  };

  const columnDefs = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "email",
      headerName: "Email Address",
      flex: 1,
      minWidth: 250,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      width: 170,
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
            title="Edit student"
          />

          <ActionIconButton
            type="delete"
            onClick={() => handleDelete(params.data)}
            title="Delete student"
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

export default StudentTable;
