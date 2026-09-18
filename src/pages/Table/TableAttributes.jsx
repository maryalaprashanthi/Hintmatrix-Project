import { useEffect, useState } from "react";
import AddTableAttributeModal from "./AddTableAttributeModal";
import "./TableAttributes.css";
import TableAttributeService from "../../services/TableAttributeService";
import DataGrid from "../../components/DataGrid";
import ConfirmDialog from "../../components/Common/ConfirmDialog";
import ActionIconButton from "../../components/Common/ActionIconButton";
import { useDeleteConfirm } from "../../hooks/useDeleteConfirm";
import { useToast } from "../../components/Toast/useToast";
import { getApiErrorMessage } from "../../utils/apiError";
import ManagementCountTiles from "../../components/Common/ManagementCountTiles";
import { FaTags } from "react-icons/fa";

function TableAttributes() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [tableAttributes, setTableAttributes] = useState([]);
  const [id, setId] = useState(null);
  const tableAttributeCounts = {
    total: tableAttributes.length,
    active: tableAttributes.filter((item) => item.activeRow !== false).length,
    inactive: tableAttributes.filter((item) => item.activeRow === false).length,
  };

  const loadTableAttributes = async () => {
    try {
      const result = await TableAttributeService.getAll();
      const data = await result.data;

      const allTableAttributes = data.map((obj) => ({
        name: obj.name,
        id: obj.attributeId,
        amount1: obj.amount1,
        amount2: obj.amount2,
        tableHeaderName: obj.tableHeaderName,
        activeRow: obj.activeRow !== false,
      }));

      setTableAttributes(allTableAttributes);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    loadTableAttributes();
  }, []);

  const del = useDeleteConfirm({
    entity: "table attribute",
    deleteFn: (row) => TableAttributeService.delete(row.id ?? row),
    onDeleted: loadTableAttributes,
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      const response = await TableAttributeService.uploadExcel(file);

      toast.success(
        typeof response.data === "string" ? response.data : "Upload complete.",
      );

      loadTableAttributes();
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "Excel upload failed."));
    }

    e.target.value = "";
  };

  const handleStatusToggle = async (attribute) => {
    const nextStatus = attribute.activeRow === false;

    try {
      await TableAttributeService.update(attribute.id, {
        name: attribute.name,
        tableHeaderName: attribute.tableHeaderName,
        amount1: attribute.amount1,
        amount2: attribute.amount2,
        activeRow: nextStatus,
      });
      toast.success(`Table attribute ${nextStatus ? "activated" : "deactivated"}.`);
      await loadTableAttributes();
    } catch (error) {
      console.error("Error updating table attribute status:", error);
      toast.error(getApiErrorMessage(error, "Unable to update status."));
    }
  };

  const columnDefs = [
    { field: "name", headerName: "Table Attribute Name", flex: 1 },
    {
      field: "tableHeaderName",
      headerName: "Table Header Name",
      flex: 1,
    },
    { field: "amount1", headerName: "Amount 1", flex: 1 },
    { field: "amount2", headerName: "Amount 2", flex: 1 },
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
            className={`table-attribute-status ${isActive ? "active" : "inactive"}`}
            onClick={() => handleStatusToggle(params.data)}
            title={`Set ${params.data.name} ${isActive ? "inactive" : "active"}`}
          >
            <span className="table-attribute-status-dot" />
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
                let editedData = {
                  name: params.data.name,
                  amount1: params.data.amount1,
                  amount2: params.data.amount2,
                  tableHeaderName: params.data.tableHeaderName,
                  activeRow: params.data.activeRow !== false,
                };

                setEditingAttribute(editedData);
                setId(params.data.id);
                setShowModal(true);
              }}
              title="Edit table attribute"
            />

            <ActionIconButton
              type="delete"
              onClick={() => del.request(params.data)}
              title="Delete table attribute"
            />
          </div>
        );
      },
    },
  ];
  const handleSave = async (newAttribute) => {
    try {
      if (id != null) {
        await TableAttributeService.update(id, newAttribute);
        toast.success("Table attribute updated.");
      } else {
        await TableAttributeService.create(newAttribute);
        toast.success("Table attribute added.");
      }
      setEditingAttribute(null);
      setId(null);
      setShowModal(false);
      loadTableAttributes();
    } catch (error) {
      console.error("Error:", error);
      toast.error(getApiErrorMessage(error, "Operation failed."));
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Table Attribute Management</h2>

          <p className="text-muted">Manage all table attributes.</p>
        </div>

        {/* Hidden Upload Input */}

        <input
          type="file"
          id="tableAttributeUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() =>
              document.getElementById("tableAttributeUpload").click()
            }
          >
            ⬆ Upload
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingAttribute(null);
              setId(null);
              setShowModal(true);
            }}
          >
            + Add Table Attribute
          </button>
        </div>
      </div>

      <ManagementCountTiles
        label="Table Attributes"
        counts={tableAttributeCounts}
        icon={FaTags}
      />

      {/* Data Grid */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <DataGrid rowData={tableAttributes} columnDefs={columnDefs} />
        </div>
      </div>

      {/* Modal */}

      <AddTableAttributeModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAttribute(null);
          setId(null);
        }}
        onSave={handleSave}
        initialData={editingAttribute}
      />
      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.name || "this table attribute"}"?`}
        body="Questions and rules that use this attribute may be affected. This can't be undone."
        confirmLabel="Delete table attribute"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default TableAttributes;
