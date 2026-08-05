import { Navbar, Container, Button } from "react-bootstrap";
import useQuestionStore from "./questionStore";
import {
  FaBars,
  FaRedo,
  FaSave,
  FaPaperPlane,
  FaExclamationTriangle,
} from "react-icons/fa";

function Header() {
  const { question } = useQuestionStore();
  console.log("Header Question:", question);
  return (
    <>
      <Container fluid className="py-2">
        <div className="row align-items-center">
          {/* Left */}
          <div className="col-lg-8 col-md-7">
            <div className="d-flex align-items-center">
              <div>
                <h4 className="fw-bold mb-1">
                  {question
                    ? `Q${question.questionId}: ${question.questionText}`
                    : "Loading..."}
                </h4>

                <small className="text-muted">
                  {question &&
                    `${question.courseName} • ${question.chapterName} • ${question.categoryName}`}
                </small>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="col-lg-4 col-md-5">
            <div className="d-flex justify-content-end align-items-center gap-2 flex-wrap">
              <Button
                variant="light"
                size="sm"
                className="px-3 py-2 d-flex align-items-center"
              >
                <FaRedo className="me-1" />
                Reset
              </Button>

              <Button
                variant="warning"
                size="sm"
                className="px-3 py-2 d-flex align-items-center"
              >
                <FaExclamationTriangle className="me-1" />
                Check
              </Button>

              <Button
                variant="success"
                size="sm"
                className="px-3 py-2 d-flex align-items-center"
              >
                <FaSave className="me-1" />
                Save
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="px-3 py-2 d-flex align-items-center"
              >
                <FaPaperPlane className="me-1" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

export default Header;
