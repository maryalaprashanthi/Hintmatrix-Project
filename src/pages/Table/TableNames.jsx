import { useEffect, useState } from "react";
import "./TableNames.css";
import AddTableNameModal from "./AddTableNameModal";
import TableNameService from "../../services/TableNameService";
import toast, { ToastBar } from "react-hot-toast";
import DataGrid from "../../components/DataGrid";

function TableNames() {
  const [showModal, setShowModal] = useState(false);
  const [tableNames, setTableNames] = useState([]);
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const handleSave = async (newTableName) => {
    if (id == null) {
      try {
        const response = await TableNameService.create(newTableName);
        toast.success("Data saved successfully");
        loadTableNames();
      } catch (error) {
        console.log("Error: ", error);
        toast.error(error.message);
      }
    } else {
      try {
        const reposnse = await TableNameService.update(id, newTableName);
        const data = await reposnse.data;
        toast.success("Data updated successfully");
        loadTableNames();
      } catch (error) {
        console.error("Error: ", error);
        toast.error(error.message);
      }
    }
    setId(null);
    setName(null);
  };

  const handleDelete = async (id) => {
    try {
      const reposnse = await TableNameService.delete(id);
      const data = await reposnse.data;
      toast.success("Data deleted successfully");
    } catch (error) {
      console.error("Error: ", error);
      toast.error(error.message);
    }
    loadTableNames();
  };

  const loadTableNames = async () => {
    try {
      const result = await TableNameService.getAll();
      const data = await result.data;
      const allTableNames = data.map((obj) => ({
        name: obj.name,
        id: obj.tableNameId,
      }));
      setTableNames(allTableNames);
    } catch (error) {
      console.log("Error: ", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadTableNames();
  }, []);

  const columnDefs = [
    { field: "id", headerName: "ID", width: 80, flex: 1 },
    { field: "name", headerName: "Institute Name", flex: 1, minWidth: 160 },
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
            <button
              // onClick={() => handleEdit(params.data.id,params.data)}
              onClick={() => {
                setId(params.data.id);
                setName(params.data.name);
                setShowModal(true);
                
              }}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "2px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(params.data.id)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "2px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Delete
            </button>
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

        <button
          className="btn btn-primary"
          onClick={() => {
            setId(null);
            setName(null);
            setShowModal(true);
          }}
        >
          + Add Table Name
        </button>
      </div>

      {/* Table */}
      {/* <div className="card shadow-sm border-0">
        <div className="card-body">

          <table className="table table-bordered table-hover align-middle">

            <thead className="table-light">
              <tr>
                <th>Table Name</th>
                <th>Table name id</th>
                <th>active row</th>
                <th>created at</th>
                <th>updated at</th>
              </tr>
            </thead>

            <tbody>

              {tableNames.length === 0 ? (
                <tr>
                  <td className="text-center">
                    No Table Names Added
                  </td>
                </tr>
              ) : (
                tableNames.map((table, index) => (
                  <tr key={index}>
                    <td>{table.name}</td>
                    <td>{table.id}</td>
                    <td>{table.activeRow==true?"✅":"❌"}</td>
                    <td>{table.createdAt}</td>
                    <td>{table.updatedAt}</td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </div> */}

      <DataGrid rowData={tableNames} columnDefs={columnDefs} />

      <AddTableNameModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setId(null);
          setName(null);
        }}
        onSave={handleSave}
        Inputname={name}
      />
    </div>
  );
}

export default TableNames;
