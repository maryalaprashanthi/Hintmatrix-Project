import { themeQuartz } from "ag-grid-community";
import BranchAdminService from "../../services/UserService";
import DataGrid from "../../components/DataGrid";
import ActionIconButton from "../../components/Common/ActionIconButton";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";

function BranchAdminTable({ data, onEdit, refreshData }) {
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const del = useDeleteConfirm({
    entity: "branch admin",
    deleteFn: (admin) =>
      BranchAdminService.deleteBranchAdmin(
        admin?.userId ?? admin?.branchAdminId ?? admin?.studentId,
      ),
    onDeleted: refreshData,
  });

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
      width: 110,
      minWidth: 110,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        if (!params.data) return null;

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
            <ActionIconButton
              type="edit"
              onClick={() => onEdit(params.data)}
              title="Edit branch admin"
            />

            <ActionIconButton
              type="delete"
              onClick={() => del.request(params.data)}
              title="Delete branch admin"
            />
          </div>
        );
      },
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
        title={`Delete "${del.pending?.name || "this branch admin"}"?`}
        body="This person will lose access to the admin console. This can't be undone."
        confirmLabel="Delete branch admin"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default BranchAdminTable;
