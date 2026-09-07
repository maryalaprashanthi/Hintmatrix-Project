import { themeQuartz } from "ag-grid-community";
import StudentService from "../../services/UserService";
import DataGrid from "../../components/DataGrid";
import ActionIconButton from "../../components/Common/ActionIconButton";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";

function StudentTable({ data, onEdit, onDeleted, refreshData }) {
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const del = useDeleteConfirm({
    entity: "student",
    deleteFn: async (student) => {
      const userId = student.userId || student.user_id;
      await StudentService.deleteStudent(userId);
      if (onDeleted) {
        await onDeleted(userId);
      } else {
        await refreshData();
      }
    },
  });

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
            onClick={() => del.request(params.data)}
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

      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.name || "this student"}"?`}
        body="Their practice history and results will be removed. This can't be undone."
        confirmLabel="Delete student"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default StudentTable;
