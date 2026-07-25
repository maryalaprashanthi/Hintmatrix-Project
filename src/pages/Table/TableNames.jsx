import { useEffect, useState } from "react";
import "./TableNames.css";
import AddTableNameModal from "./AddTableNameModal";
import TableNameService from "../../services/TableNameService";
import DataGrid from "../../components/DataGrid";

function TableNames() {
  const [showModal, setShowModal] = useState(false);
  const [tableNames, setTableNames] = useState([]);
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
   // Upload Handler
  const handleFileUpload = (e) => {
  const file = e.target.files[0];

  if (file) {
    alert(`Selected File: ${file.name}`);
    // TODO: Upload API logic
  }
};

  const handleSave = async (newTableName) => {
    try {
      if(id==null)
      {
        console.log("I got here");
        
        const response = await TableNameService.create(newTableName);
      }
      else
      {
        const reposnse = await TableNameService.update(id, newTableName);
        const data = await reposnse.data;
      }
      setId(null);
      setName("");
      setShowModal(false);
      loadTableNames();
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const reposnse = await TableNameService.delete(id);
      const data = await reposnse.data;
    } catch (error) {
      console.error("Error: ", error);
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
        <div className="d-flex gap-2">

    {/* Hidden Upload Input */}
    <input
      type="file"
      id="courseUpload"
      accept=".csv,.xlsx,.xls"
      style={{ display: "none" }}
      onChange={handleFileUpload}
    />

    {/* Upload Button */}
    <button
      className="btn btn-primary"
      onClick={() =>
        document.getElementById("courseUpload").click()
      }
    >
      ⬆ Upload
    </button>

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

      <DataGrid rowData={tableNames} columnDefs={columnDefs} />

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
    </div>
  );
}

export default TableNames;
