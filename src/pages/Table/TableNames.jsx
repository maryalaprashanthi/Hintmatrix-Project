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

function TableNames() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [tableNames, setTableNames] = useState([]);

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const fileInputRef = useRef(null);

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

  const columnDefs = [
    {
      field: "name",
      headerName: "Table Name",
      flex: 1,
      minWidth: 160,
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
              setShowModal(true);
            }}
          >
            + Add Table Name
          </button>
        </div>
      </div>

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
        }}
        onSave={handleSave}
        Inputname={name}
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
