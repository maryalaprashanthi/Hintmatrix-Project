import { useEffect, useState } from "react";
import "./TableNames.css";
import AddTableNameModal from "./AddTableNameModal";
import TableNameService from "../../services/TableNameService";
import toast from "react-hot-toast";

function TableNames() {
  const [showModal, setShowModal] = useState(false);
  const [tableNames, setTableNames] = useState([]);

  const handleSave = async (newTableName) => {
    // setTableNames([...tableNames, newTableName]);
    // create a new Table name
    // console.log("Hello ",newTableName);
    try {
      const response = await TableNameService.create(newTableName);
      toast.success("Data saved successfully");
      loadTableNames();
    } catch (error) {
      console.log("Error: ",error);
      toast.error(error.message);
    }
    
  };

  const loadTableNames = async () => {
    try {
      const result = await TableNameService.getAll();
      const data = await result.data;
      const allTableNames = data.map((obj)=>({"name":obj.name}));
      console.log(allTableNames);
      //  const namesOnly = response.data.map((item) => item.name);
      setTableNames(allTableNames);
    } catch (error) {
      console.log("Error: ",error);
      toast.error(error.message);
    }
  }

  useEffect(()=>{
    loadTableNames();
  },[])

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Table Name Management</h2>
          <p className="text-muted">
            Manage all table names.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Table Name
        </button>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <table className="table table-bordered table-hover align-middle">

            <thead className="table-light">
              <tr>
                <th>Table Name</th>
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
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </div>

      <AddTableNameModal
        show={showModal}
        onClose={() => setShowModal(false)}
        loader={loadTableNames}
        onSave={handleSave}
      />

    </div>
  );
}

export default TableNames;