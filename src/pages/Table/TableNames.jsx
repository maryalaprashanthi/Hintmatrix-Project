import { useEffect, useState, useRef } from "react";
import "./TableNames.css";
import AddTableNameModal from "./AddTableNameModal";
import TableNameService from "../../services/TableNameService";
import DataGrid from "../../components/DataGrid";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import ActionIconButton from "../../components/Common/ActionIconButton";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";
import { getApiErrorMessage } from "../../utils/apiError";
import ManagementCountTiles from "../../components/Common/ManagementCountTiles";
import { FaTable } from "react-icons/fa";

function TableNames() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [tableNames, setTableNames] = useState([]);

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [activeRow, setActiveRow] = useState(true);
  const fileInputRef = useRef(null);
  const tableNameCounts = {
    total: tableNames.length,
    active: tableNames.filter((item) => item.activeRow !== false).length,
    inactive: tableNames.filter((item) => item.activeRow === false).length,
  };

  // ================= SAVE =================
  const handleSave = async (newTableName) => {
    try {
      if (id == null) {
        await TableNameService.create(newTableName);
        toast.success("Table name added.");
      } else {
        await TableNameService.update(id, newTableName);
        toast.success("Table name updated.");
      }

      setId(null);
      setName("");
      setActiveRow(true);
      setShowModal(false);

      loadTableNames();
    } catch (error) {
      console.error("Error:", error);
      toast.error(getApiErrorMessage(error, "Operation failed."));
    }
  };

  // ================= GET ALL =================

  const loadTableNames = async () => {
    try {
      const result = await TableNameService.getAll();

      const data = result.data;

      const allTableNames = data.map((obj) => ({
        name: obj.name,
        id: obj.tableNameId,
        activeRow: obj.activeRow !== false,
      }));

      setTableNames(allTableNames);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // ================= DELETE =================

  const del = useDeleteConfirm({
    entity: "table name",
    deleteFn: (row) => TableNameService.delete(row.id ?? row),
    onDeleted: loadTableNames,
  });

  // ================= FILE UPLOAD =================

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const response = await TableNameService.uploadExcel(file);

      toast.success(
        typeof response.data === "string" ? response.data : "Upload complete.",
      );

      loadTableNames();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Excel upload failed."));
    }

    // Reset input so the same file can be selected again
    event.target.value = "";
  };

  useEffect(() => {
    loadTableNames();
  }, []);

  const handleStatusToggle = async (tableName) => {
    const nextStatus = tableName.activeRow === false;

    try {
      await TableNameService.update(tableName.id, {
        name: tableName.name,
        activeRow: nextStatus,
      });
      toast.success(`Table name ${nextStatus ? "activated" : "deactivated"}.`);
      await loadTableNames();
    } catch (error) {
      console.error("Error updating table name status:", error);
      toast.error(getApiErrorMessage(error, "Unable to update status."));
    }
  };

  const columnDefs = [
    {
      field: "name",
      headerName: "Table Name",
      flex: 1,
      minWidth: 160,
    },

    {
      field: "activeRow",
      headerName: "Status",
      width: 130,
      cellRenderer: (params) => {
        if (!params.data) return null;

        const isActive = params.value !== false;
        return (
          <button
            type="button"
            className={`table-name-status ${isActive ? "active" : "inactive"}`}
            onClick={() => handleStatusToggle(params.data)}
            title={`Set ${params.data.name} ${isActive ? "inactive" : "active"}`}
          >
            <span className="table-name-status-dot" />
            {isActive ? "Active" : "Inactive"}
          </button>
        );
      },
    },

    {
      headerName: "Action",

      flex: 1,

      cellRenderer: (params) => {
        if (!params.data) return null;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              gap: "8px",
            }}
          >
            <ActionIconButton
              type="edit"
              onClick={() => {
                setId(params.data.id);
                setName(params.data.name);
                setActiveRow(params.data.activeRow !== false);
                setShowModal(true);
              }}
              title="Edit table name"
            />

            <ActionIconButton
              type="delete"
              onClick={() => del.request(params.data)}
              title="Delete table name"
            />
          </div>
        );
      },
    },
  ];
  return (
    <div className="container-fluid py-4">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Table Name Management</h2>

          <p className="text-muted">Manage all table names.</p>
        </div>

        <div className="d-flex gap-2">
          {/* Hidden File Input */}

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />

          {/* Upload Button */}

          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current.click()}
          >
            ⬆ Upload
          </button>

          {/* Add Button */}

          <button
            className="btn btn-primary"
            onClick={() => {
              setId(null);
              setName("");
              setActiveRow(true);
              setShowModal(true);
            }}
          >
            + Add Table Name
          </button>
        </div>
      </div>

      <ManagementCountTiles
        label="Table Names"
        counts={tableNameCounts}
        icon={FaTable}
      />

      {/* Data Grid */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <DataGrid rowData={tableNames} columnDefs={columnDefs} />
        </div>
      </div>

      {/* Add / Edit Modal */}

      <AddTableNameModal
        show={showModal}
        onClose={() => {
          setShowModal(false);

          setId(null);

          setName("");
          setActiveRow(true);
        }}
        onSave={handleSave}
        Inputname={name}
        Inputstatus={activeRow}
      />
      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.name || "this table name"}"?`}
        body="Headers, attributes and rules that reference this table may be affected. This can't be undone."
        confirmLabel="Delete table name"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default TableNames;
