"use client";

import { useEffect, useMemo, useState } from "react";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createProblem(operation) {
  var left = randomInt(10, 99);
  var right = randomInt(10, 99);

  if (operation === "-" && right > left) {
    var temp = left;
    left = right;
    right = temp;
  }

  return {
    left: left,
    right: right,
    operation: operation,
    answer: operation === "+" ? left + right : left - right,
  };
}

function createMainSet() {
  var list = [];
  var i;

  for (i = 0; i < 10; i += 1) {
    list.push(createProblem(i % 2 === 0 ? "+" : "-"));
  }

  return list;
}

function createFollowUpSet(mistakes) {
  var list = [];
  var i;

  if (!mistakes || mistakes.length === 0) {
    return list;
  }

  for (i = 0; i < 5; i += 1) {
    var source = mistakes[i % mistakes.length];
    list.push(createProblem(source.operation));
  }

  return list;
}

function formatTime(totalSeconds) {
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = totalSeconds % 60;
  var minuteText = String(minutes).padStart(2, "0");
  var secondText = String(seconds).padStart(2, "0");
  return minuteText + ":" + secondText;
}

function clampAnswerInput(value) {
  return value.replace(/[^0-9-]/g, "");
}

function pageStyle() {
  return {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "24px",
    color: "#172033",
    fontFamily: "Arial, Helvetica, sans-serif",
  };
}

function shellStyle() {
  return {
    maxWidth: "980px",
    margin: "0 auto",
  };
}

function cardStyle() {
  return {
    backgroundColor: "#ffffff",
    border: "1px solid #dbe2ea",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    marginBottom: "16px",
  };
}

function buttonStyle(primary, disabled) {
  return {
    appearance: "none",
    border: primary ? "1px solid #1f3c88" : "1px solid #c9d3df",
    backgroundColor: disabled ? "#d7dce3" : primary ? "#1f3c88" : "#ffffff",
    color: disabled ? "#6b7280" : primary ? "#ffffff" : "#172033",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: disabled ? "not-allowed" : "pointer",
    marginRight: "10px",
    marginBottom: "10px",
  };
}

function badgeStyle() {
  return {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #dbe2ea",
    backgroundColor: "#f8fafc",
    fontSize: "13px",
    fontWeight: "700",
    marginRight: "8px",
    marginBottom: "8px",
  };
}

function questionRowStyle() {
  return {
    display: "grid",
    gridTemplateColumns: "1fr 140px",
    gap: "10px",
    alignItems: "center",
    border: "1px solid #e5eaf0",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    backgroundColor: "#ffffff",
  };
}

function inputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #c9d3df",
    fontSize: "16px",
  };
}

function statGridStyle() {
  return {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  };
}

function miniCardStyle() {
  return {
    border: "1px solid #e5eaf0",
    borderRadius: "14px",
    padding: "14px",
    backgroundColor: "#ffffff",
  };
}

function renderQuestionList(items, answers, setAnswers, disabled, placeholderText) {
  return items.map(function (item, index) {
    return (
      <div key={index} style={questionRowStyle()}>
        <div style={{ fontSize: "22px", fontWeight: "700" }}>
          {index + 1}. {item.left} {item.operation} {item.right} =
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={answers[index] || ""}
          disabled={disabled}
          placeholder={placeholderText}
          onChange={function (event) {
            var next = answers.slice();
            next[index] = clampAnswerInput(event.target.value);
            setAnswers(next);
          }}
          style={inputStyle()}
        />
      </div>
    );
  });
}

function renderResultRows(details) {
  return details.map(function (item, index) {
    return (
      <div
        key={index}
        style={{
          border: "1px solid #e5eaf0",
          borderRadius: "14px",
          padding: "12px",
          marginBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          backgroundColor: "#ffffff",
        }}
      >
        <div>
          <div style={{ fontWeight: "700", marginBottom: "4px" }}>
            {index + 1}. {item.left} {item.operation} {item.right} = {item.answer}
          </div>
          <div style={{ color: "#5b6576", fontSize: "14px" }}>
            Your answer: {item.userAnswer === "" ? "(blank)" : item.userAnswer}
          </div>
        </div>
        <div style={{ fontWeight: "700", color: item.correct ? "#0f8a3b" : "#b42318" }}>
          {item.correct ? "Correct" : "Incorrect"}
        </div>
      </div>
    );
  });
}

export default function Page() {
  var initialQuestions = createMainSet();
  var initialAnswers = ["", "", "", "", "", "", "", "", "", ""];

  var modeState = useState("practice");
  var mode = modeState[0];
  var setMode = modeState[1];

  var questionsState = useState(initialQuestions);
  var questions = questionsState[0];
  var setQuestions = questionsState[1];

  var answersState = useState(initialAnswers);
  var answers = answersState[0];
  var setAnswers = answersState[1];

  var startedState = useState(false);
  var started = startedState[0];
  var setStarted = startedState[1];

  var submittedState = useState(false);
  var submitted = submittedState[0];
  var setSubmitted = submittedState[1];

  var timeState = useState(0);
  var time = timeState[0];
  var setTime = timeState[1];

  var followUpState = useState([]);
  var followUpQuestions = followUpState[0];
  var setFollowUpQuestions = followUpState[1];

  var followUpAnswersState = useState([]);
  var followUpAnswers = followUpAnswersState[0];
  var setFollowUpAnswers = followUpAnswersState[1];

  var followUpSubmittedState = useState(false);
  var followUpSubmitted = followUpSubmittedState[0];
  var setFollowUpSubmitted = followUpSubmittedState[1];

  var historyState = useState([]);
  var history = historyState[0];
  var setHistory = historyState[1];

  useEffect(function () {
    if (!started || submitted) {
      return;
    }

    var timerId = window.setInterval(function () {
      setTime(function (previous) {
        return previous + 1;
      });
    }, 1000);

    return function () {
      window.clearInterval(timerId);
    };
  }, [started, submitted]);

  var mainResults = useMemo(function () {
    if (!submitted) {
      return null;
    }

    var details = questions.map(function (item, index) {
      var userAnswer = answers[index] || "";
      var correct = Number(userAnswer) === item.answer;
      return {
        left: item.left,
        right: item.right,
        operation: item.operation,
        answer: item.answer,
        userAnswer: userAnswer,
        correct: correct,
      };
    });

    var correctCount = details.filter(function (item) {
      return item.correct;
    }).length;

    var mistakes = details.filter(function (item) {
      return !item.correct;
    });

    var additionMistakes = mistakes.filter(function (item) {
      return item.operation === "+";
    }).length;

    var subtractionMistakes = mistakes.filter(function (item) {
      return item.operation === "-";
    }).length;

    return {
      details: details,
      correctCount: correctCount,
      mistakes: mistakes,
      accuracy: Math.round((correctCount / questions.length) * 100),
      additionMistakes: additionMistakes,
      subtractionMistakes: subtractionMistakes,
    };
  }, [submitted, questions, answers]);

  var followUpResults = useMemo(function () {
    if (!followUpSubmitted) {
      return null;
    }

    var details = followUpQuestions.map(function (item, index) {
      var userAnswer = followUpAnswers[index] || "";
      var correct = Number(userAnswer) === item.answer;
      return {
        left: item.left,
        right: item.right,
        operation: item.operation,
        answer: item.answer,
        userAnswer: userAnswer,
        correct: correct,
      };
    });

    var correctCount = details.filter(function (item) {
      return item.correct;
    }).length;

    return {
      details: details,
      correctCount: correctCount,
      accuracy: followUpQuestions.length ? Math.round((correctCount / followUpQuestions.length) * 100) : 0,
    };
  }, [followUpSubmitted, followUpQuestions, followUpAnswers]);

  var statistics = useMemo(function () {
    var totalSets = history.length;
    var totalCorrect = 0;
    var totalAccuracy = 0;
    var totalTime = 0;
    var bestScore = 0;
    var fastest = 0;
    var totalAddMistakes = 0;
    var totalSubMistakes = 0;

    history.forEach(function (item, index) {
      totalCorrect += item.correctCount;
      totalAccuracy += item.accuracy;
      totalTime += item.time;
      totalAddMistakes += item.additionMistakes;
      totalSubMistakes += item.subtractionMistakes;

      if (item.correctCount > bestScore) {
        bestScore = item.correctCount;
      }

      if (index === 0 || item.time < fastest) {
        fastest = item.time;
      }
    });

    return {
      totalSets: totalSets,
      averageAccuracy: totalSets ? Math.round(totalAccuracy / totalSets) : 0,
      averageTime: totalSets ? Math.round(totalTime / totalSets) : 0,
      bestScore: bestScore,
      fastest: fastest,
      totalAddMistakes: totalAddMistakes,
      totalSubMistakes: totalSubMistakes,
    };
  }, [history]);

  function startNewSet() {
    setQuestions(createMainSet());
    setAnswers(["", "", "", "", "", "", "", "", "", ""]);
    setStarted(true);
    setSubmitted(false);
    setTime(0);
    setFollowUpQuestions([]);
    setFollowUpAnswers([]);
    setFollowUpSubmitted(false);
  }

  function resetEverything() {
    setQuestions(createMainSet());
    setAnswers(["", "", "", "", "", "", "", "", "", ""]);
    setStarted(false);
    setSubmitted(false);
    setTime(0);
    setFollowUpQuestions([]);
    setFollowUpAnswers([]);
    setFollowUpSubmitted(false);
    setMode("practice");
  }

  function checkMainAnswers() {
    var evaluatedDetails;
    var mistakes;

    if (!started || submitted) {
      return;
    }

    evaluatedDetails = questions.map(function (item, index) {
      return {
        left: item.left,
        right: item.right,
        operation: item.operation,
        answer: item.answer,
        userAnswer: answers[index] || "",
        correct: Number(answers[index] || "") === item.answer,
      };
    });

    mistakes = evaluatedDetails.filter(function (item) {
      return !item.correct;
    });

    setSubmitted(true);

    setHistory(function (previous) {
      var correctCount = evaluatedDetails.filter(function (item) {
        return item.correct;
      }).length;

      return [
        {
          completedAt: new Date().toLocaleString(),
          correctCount: correctCount,
          accuracy: Math.round((correctCount / 10) * 100),
          time: time,
          additionMistakes: mistakes.filter(function (item) {
            return item.operation === "+";
          }).length,
          subtractionMistakes: mistakes.filter(function (item) {
            return item.operation === "-";
          }).length,
        },
      ].concat(previous);
    });

    if (mistakes.length > 0) {
      var nextSet = createFollowUpSet(mistakes);
      setFollowUpQuestions(nextSet);
      setFollowUpAnswers(["", "", "", "", ""]);
    } else {
      setFollowUpQuestions([]);
      setFollowUpAnswers([]);
    }
  }

  return (
    <div style={pageStyle()}>
      <div style={shellStyle()}>
        <div style={cardStyle()}>
          <h1 style={{ marginTop: 0, marginBottom: "8px", fontSize: "34px" }}>Basic Math Practice</h1>
          <p style={{ marginTop: 0, color: "#5b6576", lineHeight: "1.5" }}>
            Practice 2-digit addition and subtraction with a timer, checked answers, a report for each set, progress statistics, and 5 similar follow-up questions when you make mistakes.
          </p>
          <div>
            <span style={badgeStyle()}>2-digit only</span>
            <span style={badgeStyle()}>10 questions</span>
            <span style={badgeStyle()}>Timed sets</span>
            <span style={badgeStyle()}>Statistics page</span>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <button
            type="button"
            onClick={function () {
              setMode("practice");
            }}
            style={buttonStyle(mode === "practice", false)}
          >
            Practice
          </button>
          <button
            type="button"
            onClick={function () {
              setMode("stats");
            }}
            style={buttonStyle(mode === "stats", false)}
          >
            Statistics
          </button>
        </div>

        {mode === "practice" ? (
          <div>
            <div style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ marginTop: 0, marginBottom: "6px" }}>Main Practice Set</h2>
                  <p style={{ marginTop: 0, color: "#5b6576" }}>
                    Press Start to begin the timer. The timer stops when you click Check Answers.
                  </p>
                </div>
                <div style={{ fontWeight: "700", fontSize: "20px" }}>Time: {formatTime(time)}</div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <button type="button" onClick={startNewSet} style={buttonStyle(true, false)}>
                  {started && !submitted ? "Restart Set" : "Start"}
                </button>
                <button type="button" onClick={resetEverything} style={buttonStyle(false, false)}>
                  Reset
                </button>
              </div>

              <div>{renderQuestionList(questions, answers, setAnswers, !started || submitted, started ? "Answer" : "Press Start")}</div>

              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={checkMainAnswers}
                  disabled={!started || submitted}
                  style={buttonStyle(true, !started || submitted)}
                >
                  Check Answers
                </button>
              </div>
            </div>

            {submitted && mainResults ? (
              <div>
                <div style={cardStyle()}>
                  <h2 style={{ marginTop: 0 }}>Report</h2>
                  <p style={{ color: "#5b6576" }}>
                    Score: {mainResults.correctCount}/10. Accuracy: {mainResults.accuracy}%. Time used: {formatTime(time)}.
                    {mainResults.mistakes.length > 0
                      ? " You made " + mainResults.mistakes.length + " mistake(s), so 5 similar questions are ready below."
                      : " Perfect set. No extra questions needed."}
                  </p>
                  <div
                    style={{
                      width: "100%",
                      height: "12px",
                      backgroundColor: "#e7edf4",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: mainResults.accuracy + "%",
                        height: "100%",
                        backgroundColor: "#1f3c88",
                      }}
                    />
                  </div>
                </div>

                <div style={cardStyle()}>
                  <h2 style={{ marginTop: 0 }}>Checked Answers</h2>
                  {renderResultRows(mainResults.details)}
                </div>
              </div>
            ) : null}

            {submitted && followUpQuestions.length > 0 ? (
              <div style={cardStyle()}>
                <h2 style={{ marginTop: 0 }}>5 Similar Questions</h2>
                <p style={{ color: "#5b6576" }}>These follow-up questions match the type of mistakes from your main set.</p>
                <div>{renderQuestionList(followUpQuestions, followUpAnswers, setFollowUpAnswers, followUpSubmitted, "Answer")}</div>
                <div style={{ marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={function () {
                      setFollowUpSubmitted(true);
                    }}
                    disabled={followUpSubmitted}
                    style={buttonStyle(true, followUpSubmitted)}
                  >
                    Check Follow-Up
                  </button>
                  <button
                    type="button"
                    onClick={function () {
                      var nextSet = createFollowUpSet(mainResults.mistakes);
                      setFollowUpQuestions(nextSet);
                      setFollowUpAnswers(["", "", "", "", ""]);
                      setFollowUpSubmitted(false);
                    }}
                    style={buttonStyle(false, false)}
                  >
                    New Similar 5
                  </button>
                </div>
              </div>
            ) : null}

            {followUpSubmitted && followUpResults ? (
              <div style={cardStyle()}>
                <h2 style={{ marginTop: 0 }}>Follow-Up Results</h2>
                <p style={{ color: "#5b6576" }}>
                  Score: {followUpResults.correctCount}/5. Accuracy: {followUpResults.accuracy}%.
                </p>
                {renderResultRows(followUpResults.details)}
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <div style={statGridStyle()}>
              <div style={miniCardStyle()}>
                <div style={{ color: "#5b6576", fontSize: "14px" }}>Total sets</div>
                <div style={{ fontSize: "30px", fontWeight: "700" }}>{statistics.totalSets}</div>
              </div>
              <div style={miniCardStyle()}>
                <div style={{ color: "#5b6576", fontSize: "14px" }}>Average accuracy</div>
                <div style={{ fontSize: "30px", fontWeight: "700" }}>{statistics.averageAccuracy}%</div>
              </div>
              <div style={miniCardStyle()}>
                <div style={{ color: "#5b6576", fontSize: "14px" }}>Best score</div>
                <div style={{ fontSize: "30px", fontWeight: "700" }}>{statistics.bestScore}/10</div>
              </div>
              <div style={miniCardStyle()}>
                <div style={{ color: "#5b6576", fontSize: "14px" }}>Fastest time</div>
                <div style={{ fontSize: "30px", fontWeight: "700" }}>
                  {statistics.totalSets > 0 ? formatTime(statistics.fastest) : "--:--"}
                </div>
              </div>
            </div>

            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0 }}>Focus Areas</h2>
              <div style={{ marginBottom: "10px" }}>Average time: {statistics.totalSets > 0 ? formatTime(statistics.averageTime) : "--:--"}</div>
              <div style={{ marginBottom: "10px" }}>Addition mistakes: {statistics.totalAddMistakes}</div>
              <div>Subtraction mistakes: {statistics.totalSubMistakes}</div>
            </div>

            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0 }}>Set History</h2>
              {history.length === 0 ? (
                <div style={{ color: "#5b6576" }}>No completed sets yet. Finish one timed set to start tracking progress.</div>
              ) : (
                history.map(function (item, index) {
                  return (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #e5eaf0",
                        borderRadius: "14px",
                        padding: "12px",
                        marginBottom: "10px",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div style={{ fontWeight: "700", marginBottom: "4px" }}>Set {history.length - index}</div>
                      <div style={{ color: "#5b6576", fontSize: "14px", marginBottom: "6px" }}>{item.completedAt}</div>
                      <div>Score: {item.correctCount}/10</div>
                      <div>Accuracy: {item.accuracy}%</div>
                      <div>Time: {formatTime(item.time)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
