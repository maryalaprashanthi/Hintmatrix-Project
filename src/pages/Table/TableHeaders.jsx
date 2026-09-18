import { useState, useEffect } from "react";
import "./TableHeaders.css";
import AddTableHeaderModal from "./AddTableHeaderModal";
import TableHeaderService from "../../services/TableHeaderService";
import DataGrid from "../../components/DataGrid";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import ActionIconButton from "../../components/Common/ActionIconButton";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";
import { getApiErrorMessage } from "../../utils/apiError";
import ManagementCountTiles from "../../components/Common/ManagementCountTiles";
import { FaHeading } from "react-icons/fa";

function TableHeaders() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);

  const [tableHeaders, setTableHeaders] = useState([]);
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [activeRow, setActiveRow] = useState(true);
  const tableHeaderCounts = {
    total: tableHeaders.length,
    active: tableHeaders.filter((item) => item.activeRow !== false).length,
    inactive: tableHeaders.filter((item) => item.activeRow === false).length,
  };

  // Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      const response = await TableHeaderService.uploadExcel(file);

      toast.success(
        typeof response.data === "string" ? response.data : "Upload complete.",
      );

      loadTableHeaders();
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "Excel upload failed."));
    }

    e.target.value = "";
  };

  const handleSave = async (newTableHeader) => {
    try {
      if (id == null) {
        await TableHeaderService.create(newTableHeader);
        toast.success("Table header added.");
      } else {
        await TableHeaderService.update(id, newTableHeader);
        toast.success("Table header updated.");
      }
      setId(null);
      setName("");
      setActiveRow(true);
      setShowModal(false);
      loadTableHeaders();
    } catch (error) {
      console.error("Error:", error);
      toast.error(getApiErrorMessage(error, "Operation failed."));
    }
  };
  const loadTableHeaders = async () => {
    try {
      const result = await TableHeaderService.getAll();
      const data = await result.data;

      const allTableNames = data.map((obj) => ({
        name: obj.name,
        id: obj.headerId,
        activeRow: obj.activeRow !== false,
      }));

      setTableHeaders(allTableNames);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const del = useDeleteConfirm({
    entity: "table header",
    deleteFn: (row) => TableHeaderService.delete(row.id ?? row),
    onDeleted: loadTableHeaders,
  });

  useEffect(() => {
    loadTableHeaders();
  }, []);

  const handleStatusToggle = async (tableHeader) => {
    const nextStatus = tableHeader.activeRow === false;

    try {
      await TableHeaderService.update(tableHeader.id, {
        name: tableHeader.name,
        activeRow: nextStatus,
      });
      toast.success(`Table header ${nextStatus ? "activated" : "deactivated"}.`);
      await loadTableHeaders();
    } catch (error) {
      console.error("Error updating table header status:", error);
      toast.error(getApiErrorMessage(error, "Unable to update status."));
    }
  };

  const columnDefs = [
    {
      field: "name",
      headerName: "Table Header Name",
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
            className={`table-header-status ${isActive ? "active" : "inactive"}`}
            onClick={() => handleStatusToggle(params.data)}
            title={`Set ${params.data.name} ${isActive ? "inactive" : "active"}`}
          >
            <span className="table-header-status-dot" />
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
              title="Edit table header"
            />

            <ActionIconButton
              type="delete"
              onClick={() => del.request(params.data)}
              title="Delete table header"
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
          <h2 className="fw-bold">Table Header Management</h2>

          <p className="text-muted">Manage all table headers.</p>
        </div>

        {/* Hidden Upload Input */}

        <input
          type="file"
          id="tableHeaderUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById("tableHeaderUpload").click()}
          >
            ⬆ Upload
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setId(null);
              setName("");
              setActiveRow(true);
              setShowModal(true);
            }}
          >
            + Add Table Header
          </button>
        </div>
      </div>

      <ManagementCountTiles
        label="Table Headers"
        counts={tableHeaderCounts}
        icon={FaHeading}
      />

      {/* Data Grid */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <DataGrid rowData={tableHeaders} columnDefs={columnDefs} />
        </div>
      </div>

      {/* Modal */}

      <AddTableHeaderModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setId(null);
          setName("");
          setActiveRow(true);
        }}
        onSave={handleSave}
        Inputdata={name}
        Inputstatus={activeRow}
      />
      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.name || "this table header"}"?`}
        body="Attributes and rules that reference this header may be affected. This can't be undone."
        confirmLabel="Delete table header"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default TableHeaders;
