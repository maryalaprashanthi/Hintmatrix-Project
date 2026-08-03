import { Navbar, Container, Button } from "react-bootstrap";
import {
  FaBars,
  FaRedo,
  FaSave,
  FaPaperPlane,
  FaExclamationTriangle,
} from "react-icons/fa";

function Header() {
  return (
    <>
      <Container
        fluid
        // flex-column (stacked) by default, flex-xxl-row (side-by-side) at 1400px
        className="d-flex flex-column flex-xxl-row justify-content-between align-items-start align-items-xxl-center gap-3 py-3"
      >
        {/* Left Side */}
        {/* Kept solely as d-flex so the icon and text stay perfectly centered at all sizes */}
        <div className="d-flex align-items-center">
          <FaBars size={22} className="me-3 text-secondary" />

          <div>
            <h3 className="fw-bold mb-1">Q4: Prepare Final Accounts</h3>
            <small className="text-muted">
              Complete the following accounts to prepare final accounts of the
              business.
            </small>
          </div>
        </div>

        {/* Right Side */}
        {/* Kept solely as d-flex. flex-wrap prevents buttons from squishing on tiny screens */}
        <div className="d-flex flex-wrap gap-2">
          <Button
            variant="light"
            className="d-flex align-items-center"
            style={{ height: "50px" }}
          >
            <FaRedo className="me-2" />
            Reset
          </Button>

          <Button
            variant="warning"
            className="d-flex align-items-center"
            style={{ height: "50px" }}
          >
            <FaExclamationTriangle className="me-2" />
            Check Mistakes
          </Button>

          <Button
            variant="success"
            className="d-flex align-items-center"
            style={{ height: "50px" }}
          >
            <FaSave className="me-2" />
            Save
          </Button>

          <Button
            variant="primary"
            className="d-flex align-items-center"
            style={{ height: "50px" }}
          >
            <FaPaperPlane className="me-2" />
            Submit
          </Button>
        </div>
      </Container>
    </>
  );
}

export default Header;
