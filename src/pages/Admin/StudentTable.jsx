import { themeQuartz } from "ag-grid-community";
import StudentService from "../../services/UserService";
import { isGuestUser, visibleUsers } from "../../utils/userEdit";
import DataGrid from "../../components/DataGrid";
import ActionIconButton from "../../components/Common/ActionIconButton";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import "../Table/TableNames.css";

function StudentTable({ data, onEdit, onDeleted, refreshData, canManageGuests = false }) {
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const del = useDeleteConfirm({
    entity: "student",
    deleteFn: async (student) => {
      const userId = student.userId || student.user_id;
      if (isGuestUser(student) && !canManageGuests) throw new Error("Only Super Admin can delete guests.");
      await StudentService.deleteStudentOrGuest(student);
      if (onDeleted) {
        await onDeleted(userId);
      } else {
        await refreshData();
      }
    },
  });

  const toggleStatus = async (student) => {
    await StudentService.updateStudent(student.userId, {
      ...student,
      activeRow: student.activeRow === false,
    });
    await refreshData();
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
      field: "activeRow",
      headerName: "Status",
      width: 150,
      cellRenderer: ({ data: student }) => {
        if (!student) return null;
        const isActive = student.activeRow !== false;
        if (isGuestUser(student)) {
          return canManageGuests ? <span className={`table-name-status ${isActive ? "active" : "inactive"}`}>{isActive ? "Active" : "Inactive"}</span> : null;
        }
        return (
          <button type="button" className={`table-name-status ${isActive ? "active" : "inactive"}`} onClick={() => toggleStatus(student)} title={`Set ${student.name} ${isActive ? "inactive" : "active"}`}>
            <span className="table-name-status-dot" />
            {isActive ? "Active" : "Inactive"}
          </button>
        );
      },
    },
    {
      headerName: "Action",
      width: 190,
      sortable: false,
      filter: false,
      cellRenderer: (params) => isGuestUser(params.data) && !canManageGuests ? null : (
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
            title={isGuestUser(params.data) ? "Edit guest" : "Edit student"}
          />

          <ActionIconButton
            type="delete"
            onClick={() => del.request(params.data)}
            title={isGuestUser(params.data) ? "Delete guest" : "Delete student"}
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
        rowData={visibleUsers(data ?? [], canManageGuests)}
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
        body="This account will be deactivated."
        confirmLabel={isGuestUser(del.pending) ? "Delete guest" : "Delete student"}
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default StudentTable;
