import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MatchingQuestionService from "../../services/MatchingQuestionService";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

const MatchFollowingPage = () => {
  const { questionId } = useParams();

  const [question, setQuestion] = useState(null);
  const [pairs, setPairs] = useState([]);

  const [selectedColumnA, setSelectedColumnA] = useState(null);
  const [answers, setAnswers] = useState({});

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMatchingQuestion();
  }, [questionId]);

  const loadMatchingQuestion = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response =
        await MatchingQuestionService.getById(questionId);

      console.log(
        "Matching question response:",
        response,
      );

      console.log(
        "Matching question data:",
        response.data,
      );

      const data = response.data;

      setQuestion(data);

      const sortedPairs = Array.isArray(data?.pairs)
        ? [...data.pairs].sort(
            (a, b) =>
              Number(a.displayOrder || 0) -
              Number(b.displayOrder || 0),
          )
        : [];

      setPairs(sortedPairs);
    } catch (err) {
      console.error(
        "Failed to load matching question:",
        err,
      );

      setError(
        "Failed to load the matching question.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];

    for (
      let i = shuffled.length - 1;
      i > 0;
      i--
    ) {
      const j = Math.floor(
        Math.random() * (i + 1),
      );

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i],
      ];
    }

    return shuffled;
  };

  const shuffledColumnB = shuffleArray(
    pairs,
  );

  const handleColumnAClick = (pairId) => {
    if (submitted) return;

    setSelectedColumnA(pairId);
  };

  const handleColumnBClick = (pairId) => {
    if (
      submitted ||
      selectedColumnA === null
    ) {
      return;
    }

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [selectedColumnA]: pairId,
    }));

    setSelectedColumnA(null);
  };

  const handleSubmit = () => {
    let correct = 0;

    pairs.forEach((pair) => {
      const selectedAnswer =
        answers[pair.pairId];

      if (
        Number(selectedAnswer) ===
        Number(pair.pairId)
      ) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSelectedColumnA(null);
    setSubmitted(false);
    setScore(0);
  };

  const getSelectedColumnB = (columnBId) => {
    const entry = Object.entries(
      answers,
    ).find(
      ([, value]) =>
        Number(value) ===
        Number(columnBId),
    );

    return entry ? Number(entry[0]) : null;
  };

  const getPairAnswerText = (pairId) => {
    const selectedId =
      answers[pairId];

    if (!selectedId) {
      return "Select an answer";
    }

    const selectedPair =
      pairs.find(
        (pair) =>
          Number(pair.pairId) ===
          Number(selectedId),
      );

    return (
      selectedPair?.columnB ||
      "Select an answer"
    );
  };

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          Loading question...
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">
          {error}
        </div>
      </Container>
    );
  }

  if (!question) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">
          Question not found.
        </div>
      </Container>
    );
  }

  if (pairs.length === 0) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">
          No matching pairs found for this
          question.
        </div>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="py-4"
    >
      <Row className="justify-content-center">
        <Col
          xs={12}
          lg={10}
          xl={9}
        >
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="mb-4">
                <h3 className="fw-bold mb-2">
                  {question.questionText}
                </h3>

                <p className="text-muted mb-0">
                  Match each item in Column A
                  with the correct item in
                  Column B.
                </p>
              </div>

              {submitted && (
                <div className="alert alert-success">
                  <strong>
                    Score: {score} /{" "}
                    {pairs.length}
                  </strong>
                </div>
              )}

              <Row className="g-4">
                {/* COLUMN A */}
                <Col
                  xs={12}
                  md={6}
                >
                  <div className="border rounded-4 p-3 h-100">
                    <h5 className="fw-bold text-primary mb-3">
                      Column A
                    </h5>

                    {pairs.map(
                      (
                        pair,
                        index,
                      ) => {
                        const isSelected =
                          Number(
                            selectedColumnA,
                          ) ===
                          Number(
                            pair.pairId,
                          );

                        return (
                          <div
                            key={
                              pair.pairId
                            }
                            className={`border rounded-3 p-3 mb-3 ${
                              isSelected
                                ? "border-primary bg-light"
                                : ""
                            }`}
                            style={{
                              cursor:
                                submitted
                                  ? "default"
                                  : "pointer",
                            }}
                            onClick={() =>
                              handleColumnAClick(
                                pair.pairId,
                              )
                            }
                          >
                            <div className="d-flex align-items-center">
                              <span className="badge bg-primary me-3">
                                {index +
                                  1}
                              </span>

                              <div className="flex-grow-1">
                                <div className="fw-semibold">
                                  {
                                    pair.columnA
                                  }
                                </div>

                                <small className="text-muted">
                                  {
                                    getPairAnswerText(
                                      pair.pairId,
                                    )
                                  }
                                </small>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </Col>

                {/* COLUMN B */}
                <Col
                  xs={12}
                  md={6}
                >
                  <div className="border rounded-4 p-3 h-100">
                    <h5 className="fw-bold text-success mb-3">
                      Column B
                    </h5>

                    {shuffledColumnB.map(
                      (
                        pair,
                        index,
                      ) => {
                        const selectedFor =
                          getSelectedColumnB(
                            pair.pairId,
                          );

                        const isSelected =
                          selectedFor !==
                          null;

                        return (
                          <div
                            key={
                              pair.pairId
                            }
                            className={`border rounded-3 p-3 mb-3 ${
                              isSelected
                                ? "bg-light border-success"
                                : ""
                            }`}
                            style={{
                              cursor:
                                submitted
                                  ? "default"
                                  : selectedColumnA !==
                                      null
                                    ? "pointer"
                                    : "default",
                            }}
                            onClick={() =>
                              handleColumnBClick(
                                pair.pairId,
                              )
                            }
                          >
                            <div className="d-flex align-items-center">
                              <span className="badge bg-success me-3">
                                {String.fromCharCode(
                                  65 +
                                    index,
                                )}
                              </span>

                              <div className="flex-grow-1">
                                <div className="fw-semibold">
                                  {
                                    pair.columnB
                                  }
                                </div>

                                {isSelected && (
                                  <small className="text-success">
                                    Matched
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </Col>
              </Row>

              <div className="mt-4">
                <div className="alert alert-info">
                  {selectedColumnA !==
                  null
                    ? "Now select the matching item from Column B."
                    : "Select an item from Column A, then select its match from Column B."}
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 mt-4">
                {!submitted ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={
                      handleSubmit
                    }
                    disabled={
                      Object.keys(
                        answers,
                      ).length !==
                      pairs.length
                    }
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={
                      handleReset
                    }
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MatchFollowingPage;