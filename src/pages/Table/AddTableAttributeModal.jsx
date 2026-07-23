import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaTable,
  FaTag,
  FaColumns,
  FaSave,
} from "react-icons/fa";

import "./AddTableAttributeModal.css";
import toast from "react-hot-toast";
import TableHeaderService from "../../services/TableHeaderService";


function AddTableAttributeModal({ show, onClose, onSave }) {

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [tableHeaderName, setTableHeaderName] = useState("");
  const [tableHeaders,setTableHeaders] = useState([]);

  const loadTableHeaders = async () => {
    try {
      const result = await TableHeaderService.getAll();
      const data = await result.data;
      console.log("all data ",data);
      const allTableNames = data.map((obj)=>({"name":obj.name}));
      console.log("Final data is ",allTableNames);
      //  const namesOnly = response.data.map((item) => item.name);
      setTableHeaders(allTableNames);
    } catch (error) {
      console.log("Error: ",error);
      toast.error(error.message);
    }
  }

    useEffect(()=>{
    loadTableHeaders();
  },[]);

  if (!show) return null;


  const handleSave = () => {

    if (
      !name.trim() ||
      !tableHeaderName.trim()
    ) {
      toast.error("Please fill all the fields.");
      return;
    }


    const newTableAttribute = {
      name,
      shortName,
      tableHeaderName,
    };


    onSave(newTableAttribute);


    setName("");
    setShortName("");
    setTableHeaderName("");

    onClose();

  };

  return createPortal(

    <div className="modal-overlay">


      <div className="table-attribute-modal">


        {/* Header */}

        <div className="modal-header">

          <div>

            <h2>
              Add Table Attribute
            </h2>

            <p>
              Create a new table attribute.
            </p>

          </div>


          <button
            className="close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>


        </div>




        {/* Body */}

        <div className="modal-body">


          <div className="form-card">


            <h3 className="section-title">
              Table Attribute Information
            </h3>



            <div className="form-grid">



              {/* Name */}

              <div className="form-group">

                <label>
                  Name <span>*</span>
                </label>


                <div className="input-box">

                  <FaTable className="input-icon" />


                  <input
                    type="text"
                    placeholder="Enter Attribute Name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />

                </div>

              </div>




              {/* Short Name */}

              <div className="form-group">

                <label>
                  Short Name
                </label>


                <div className="input-box">

                  <FaTag className="input-icon" />


                  <input
                    type="text"
                    placeholder="Enter Short Name"
                    value={shortName}
                    onChange={(e) =>
                      setShortName(e.target.value)
                    }
                  />

                </div>

              </div>




              {/* Table Header Name */}

              <div className="form-group">

                <label>
                  Table Header Name <span>*</span>
                </label>


                <div className="input-box">

                  <FaColumns className="input-icon" />


                  <select
                    value={tableHeaderName}
                    onChange={(e) =>
                      setTableHeaderName(e.target.value)
                    }
                  >
                    <option value="">Select an option</option>
                    {tableHeaders.map((el,key)=>(
                      <option value={el.name} key={key}>{el.name}</option>
                    ))}
                  </select>

                </div>

              </div>



            </div>


          </div>


        </div>





        {/* Footer */}

        <div className="modal-footer">


          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>



          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >

            <FaSave className="me-2" />

            Save

          </button>


        </div>


      </div>


    </div>,


    document.body

  );

}


export default AddTableAttributeModal;