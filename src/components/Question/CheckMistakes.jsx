/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import QuestionAnswerService from "../../services/QuestionAnswerService";
import "./CheckMistakes.css";

const CheckMistakes = ({ userId, questionId }) => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMistakes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await QuestionAnswerService.getMistakesByQuestionId(
          userId,
          questionId,
        );
        setMistakes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to get mistakes:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load mistakes.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId && questionId) {
      loadMistakes();
    }
  }, [userId, questionId]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (mistakes.length === 0) {
    return (
      <Alert variant="success" className="mb-0">
        No mistakes found — nice work!
      </Alert>
    );
  }

  const formattedTime = (timeString) => {
    if (!timeString) return "N/A";

    const date = new Date(timeString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="check-mistakes-wrap">
      <div className="check-mistakes-scroll">
        <Table borderless size="sm" className="check-mistakes-table">
          <thead>
            <tr>
              <th className="date-cell">Date</th>
              <th className="date-cell">Element</th>
              <th className="date-cell">Option Selected</th>
            </tr>
          </thead>
          <tbody>
            {mistakes.map((mistake, idx) => (
              <tr key={idx}>
                <td className="date-cell">
                  {formattedTime(mistake.createdAt)}
                </td>
                <td>
                  <strong>{mistake.attributeName ?? ""}</strong>
                </td>
                <td className="date-cell">{mistake.userAnswer ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CheckMistakes;
