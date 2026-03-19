"use client";

import React, { useEffect, useMemo, useState } from "react";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeProblem(operation: "+" | "-") {
  let a = randInt(10, 99);
  let b = randInt(10, 99);

  if (operation === "-" && b > a) {
    [a, b] = [b, a];
  }

  return {
    a,
    b,
    operation,
    answer: operation === "+" ? a + b : a - b,
  };
}

function makeSet(count = 10) {
  return Array.from({ length: count }, (_, i) =>
    makeProblem(i % 2 === 0 ? "+" : "-")
  );
}

function similarPracticeFromMistakes(
  mistakes: Array<{ a: number; b: number; operation: "+" | "-"; answer: number }>
) {
  if (!mistakes.length) return [];

  const source = mistakes.slice(0, 5);
  while (source.length < 5) {
    source.push(mistakes[source.length % mistakes.length]);
  }

  return source.map((m) => {
    const deltaA = randInt(-8, 8);
    const deltaB = randInt(-8, 8);
    let a = Math.min(99, Math.max(10, m.a + deltaA));
    let b = Math.min(99, Math.max(10, m.b + deltaB));

    if (m.operation === "-" && b > a) {
      [a, b] = [b, a];
    }

    return {
      a,
      b,
      operation: m.operation,
      answer: m.operation === "+" ? a + b : a - b,
    };
  });
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Page() {
  const [mode, setMode] = useState<"practice" | "stats">("practice");
  const [questions, setQuestions] = useState(() => makeSet(10));
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [extraQuestions, setExtraQuestions] = useState<any[]>([]);
  const [extraAnswers, setExtraAnswers] = useState<string[]>([]);
  const [extraSubmitted, setExtraSubmitted] = useState(false);

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!hasStarted || submitted) return;
    const interval = window.setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [hasStarted, submitted]);

  const mainResults = useMemo(() => {
    if (!submitted) return null;

    const details = questions.map((q, i) => {
      const userAnswer = Number(answers[i]);
      const correct = userAnswer === q.answer;
      return { ...q, userAnswer: answers[i], correct, index: i + 1 };
    });

    const correctCount = details.filter((d) => d.correct).length;
    const mistakes = details.filter((d) => !d.correct);

    return {
      details,
      correctCount,
      mistakes,
      accuracy: Math.round((correctCount / questions.length) * 100),
    };
  }, [submitted, questions, answers]);

  const extraResults = useMemo(() => {
    if (!extraSubmitted) return null;

    const details = extraQuestions.map((q, i) => {
      const userAnswer = Number(extraAnswers[i]);
      const correct = userAnswer === q.answer;
      return { ...q, userAnswer: extraAnswers[i], correct, index: i + 1 };
    });

    const correctCount = details.filter((d) => d.correct).length;

    return {
      details,
      correctCount,
      accuracy: Math.round((correctCount / Math.max(1, extraQuestions.length)) * 100),
    };
  }, [extraSubmitted, extraQuestions, extraAnswers]);

  const stats = useMemo(() => {
    const totalSets = history.length;
    const averageAccuracy = totalSets
      ? Math.round(history.reduce((sum: number, item: any) => sum + item.accuracy, 0) / totalSets)
      : 0;
    const averageTimeSeconds = totalSets
      ? Math.round(history.reduce((sum: number, item: any) => sum + item.timeSeconds, 0) / totalSets)
      : 0;
    const bestScore = totalSets ? Math.max(...history.map((item: any) => item.correctCount)) : 0;
    const fastestTimeSeconds = totalSets ? Math.min(...history.map((item: any) => item.timeSeconds)) : 0;
    const totalAdditionMistakes = history.reduce((sum: number, item: any) => sum + item.additionMistakes, 0);
    const totalSubtractionMistakes = history.reduce((sum: number, item: any) => sum + item.subtractionMistakes, 0);

    return {
      totalSets,
      averageAccuracy,
      averageTimeSeconds,
      bestScore,
      fastestTimeSeconds,
      totalAdditionMistakes,
      totalSubtractionMistakes,
    };
  }, [history]);

  const reportText = useMemo(() => {
    if (!mainResults) return "Complete a set to see your report.";

    if (mainResults.mistakes.length === 0) {
      return `Excellent work. You got everything correct in ${formatSeconds(timeElapsed)}.`;
    }

    const addMistakes = mainResults.mistakes.filter((m: any) => m.operation === "+").length;
    const subMistakes = mainResults.mistakes.filter((m: any) => m.operation === "-").length;

    const focus = [
      addMistakes ? `${addMistakes} addition slip${addMistakes > 1 ? "s" : ""}` : null,
      subMistakes ? `${subMistakes} subtraction slip${subMistakes > 1 ? "s" : ""}` : null,
    ]
      .filter(Boolean)
      .join(" and ");

    return `You finished in ${formatSeconds(timeElapsed)} and made ${mainResults.mistakes.length} mistake${mainResults.mistakes.length > 1 ? "s" : ""}, mostly in ${focus}.`;
  }, [mainResults, timeElapsed]);

  function startSet() {
    if (hasStarted && !submitted) return;
    setHasStarted(true);
    setSubmitted(false);
    setExtraSubmitted(false);
    setTimeElapsed(0);
    setAnswers(Array(10).fill(""));
    setExtraQuestions([]);
    setExtraAnswers([]);
    setQuestions(makeSet(10));
  }

  function resetMain() {
    setQuestions(makeSet(10));
    setAnswers(Array(10).fill(""));
    setSubmitted(false);
    setHasStarted(false);
    setTimeElapsed(0);
    setExtraQuestions([]);
    setExtraAnswers([]);
    setExtraSubmitted(false);
    setMode("practice");
  }

  function submitMain() {
    if (!hasStarted || submitted) return;

    const details = questions.map((q, i) => ({
      ...q,
      userAnswer: answers[i],
      correct: Number(answers[i]) === q.answer,
    }));

    const mistakes = details.filter((d) => !d.correct);
    const correctCount = details.filter((d) => d.correct).length;
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const additionMistakes = mistakes.filter((d) => d.operation === "+").length;
    const subtractionMistakes = mistakes.filter((d) => d.operation === "-").length;

    setSubmitted(true);

    setHistory((prev) => [
      {
        id: Date.now(),
        completedAt: new Date().toLocaleString(),
        correctCount,
        accuracy,
        mistakes: mistakes.length,
        additionMistakes,
        subtractionMistakes,
        timeSeconds: timeElapsed,
      },
      ...prev,
    ]);

    if (mistakes.length > 0) {
      const next = similarPracticeFromMistakes(mistakes);
      setExtraQuestions(next);
      setExtraAnswers(Array(next.length).fill(""));
    } else {
      setExtraQuestions([]);
      setExtraAnswers([]);
    }
  }

  function cardStyle(): React.CSSProperties {
    return {
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 20,
      padding: 20,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    };
  }

  function badgeStyle(kind: "dark" | "light" | "outline" = "light"): React.CSSProperties {
    const map = {
      dark: { background: "#111827", color: "white", border: "1px solid #111827" },
      light: { background: "#f3f4f6", color: "#111827", border: "1px solid #e5e7eb" },
      outline: { background: "white", color: "#111827", border: "1px solid #d1d5db" },
    };
    return {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 9999,
      fontSize: 14,
      fontWeight: 600,
      ...map[kind],
    };
  }

  function buttonStyle(primary = true): React.CSSProperties {
    return {
      padding: "10px 16px",
      borderRadius: 12,
      border: primary ? "1px solid #111827" : "1px solid #d1d5db",
      background: primary ? "#111827" : "white",
      color: primary ? "white" : "#111827",
      fontWeight: 600,
      cursor: "pointer",
    };
  }

  function renderQuestionList(
    list: any[],
    userAnswers: string[],
    setUserAnswers: React.Dispatch<React.SetStateAction<string[]>>,
    disabled: boolean,
    placeholder = "Answer"
  ) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {list.map((q, i) => (
          <div
            key={`${q.a}-${q.b}-${q.operation}-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px",
              gap: 8,
              alignItems: "center",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 12,
              background: "white",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {i + 1}. {q.a} {q.operation} {q.b} =
            </div>
            <input
              inputMode="numeric"
              value={userAnswers[i] ?? ""}
              disabled={disabled}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...userAnswers];
                next[i] = e.target.value.replace(/[^0-9-]/g, "");
                setUserAnswers(next);
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 16,
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  function renderResults(title: string, results: any) {
    if (!results) return null;

    return (
      <div style={cardStyle()}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ color: "#6b7280" }}>
          Score: {results.correctCount} / {results.details.length} · Accuracy: {results.accuracy}%
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {results.details.map((d: any) => (
            <div
              key={`${title}-${d.index}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {d.index}. {d.a} {d.operation} {d.b} = {d.answer}
                </div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  Your answer: {d.userAnswer || "(blank)"}
                </div>
              </div>
              <div>
                <span style={badgeStyle(d.correct ? "dark" : "outline")}>
                  {d.correct ? "Correct" : "Incorrect"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gap: 24 }}>
        <div style={cardStyle()}>
          <h1 style={{ margin: 0, fontSize: 36 }}>Basic Math Practice</h1>
          <p style={{ color: "#6b7280", marginTop: 8 }}>
            Practice 2-digit addition and subtraction with timed sets, instant checking,
            progress tracking, and follow-up questions based on mistakes.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <span style={badgeStyle("light")}>2-digit only</span>
            <span style={badgeStyle("light")}>10 questions</span>
            <span style={badgeStyle("light")}>Timed sets</span>
            <span style={badgeStyle("light")}>Stats page</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={buttonStyle(mode === "practice")} onClick={() => setMode("practice")}>
            Practice
          </button>
          <button style={buttonStyle(mode === "stats")} onClick={() => setMode("stats")}>
            Statistics
          </button>
        </div>

        {mode === "practice" && (
          <>
            <div style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ marginTop: 0 }}>Main Practice Set</h2>
                  <p style={{ color: "#6b7280" }}>
                    Press Start to begin the timer. The clock stops when you click Check Answers.
                  </p>
                </div>
                <div style={{ ...badgeStyle("outline"), alignSelf: "start" }}>
                  Time: {formatSeconds(timeElapsed)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                {(!hasStarted || submitted) && (
                  <button style={buttonStyle(true)} onClick={startSet}>
                    {submitted ? "Start New Timed Set" : "Start"}
                  </button>
                )}
                <button style={buttonStyle(false)} onClick={resetMain}>
                  Reset
                </button>
              </div>

              {renderQuestionList(
                questions,
                answers,
                setAnswers,
                !hasStarted || submitted,
                hasStarted ? "Answer" : "Press Start"
              )}

              <div style={{ marginTop: 16 }}>
                <button style={buttonStyle(true)} onClick={submitMain} disabled={submitted || !hasStarted}>
                  Check Answers
                </button>
              </div>
            </div>

            {submitted && mainResults && (
              <>
                <div style={cardStyle()}>
                  <h2 style={{ marginTop: 0 }}>Report</h2>
                  <p style={{ color: "#6b7280" }}>{reportText}</p>
                  <div
                    style={{
                      width: "100%",
                      height: 12,
                      background: "#e5e7eb",
                      borderRadius: 9999,
                      overflow: "hidden",
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        width: `${mainResults.accuracy}%`,
                        height: "100%",
                        background: "#111827",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    <span style={badgeStyle("dark")}>Score: {mainResults.correctCount} / 10</span>
                    <span style={badgeStyle("light")}>Accuracy: {mainResults.accuracy}%</span>
                    <span style={badgeStyle("outline")}>Mistakes: {mainResults.mistakes.length}</span>
                    <span style={badgeStyle("outline")}>Time: {formatSeconds(timeElapsed)}</span>
                  </div>
                </div>

                {renderResults("Checked Answers", mainResults)}
              </>
            )}

            {submitted && extraQuestions.length > 0 && (
              <div style={cardStyle()}>
                <h2 style={{ marginTop: 0 }}>Extra Practice: 5 Similar Questions</h2>
                <p style={{ color: "#6b7280" }}>
                  These are based on the kinds of mistakes from the timed set.
                </p>

                {renderQuestionList(extraQuestions, extraAnswers, setExtraAnswers, extraSubmitted, "Answer")}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                  <button
                    style={buttonStyle(true)}
                    onClick={() => setExtraSubmitted(true)}
                    disabled={extraSubmitted}
                  >
                    Check Extra Practice
                  </button>
                  <button
                    style={buttonStyle(false)}
                    onClick={() => {
                      const next = similarPracticeFromMistakes(mainResults.mistakes);
                      setExtraQuestions(next);
                      setExtraAnswers(Array(next.length).fill(""));
                      setExtraSubmitted(false);
                    }}
                  >
                    Generate New Similar 5
                  </button>
                </div>
              </div>
            )}

            {extraSubmitted && extraResults && renderResults("Extra Practice Results", extraResults)}
          </>
        )}

        {mode === "stats" && (
          <div style={{ display: "grid", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <div style={cardStyle()}>
                <div style={{ color: "#6b7280", fontSize: 14 }}>Total sets completed</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.totalSets}</div>
              </div>
              <div style={cardStyle()}>
                <div style={{ color: "#6b7280", fontSize: 14 }}>Average accuracy</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.averageAccuracy}%</div>
              </div>
              <div style={cardStyle()}>
                <div style={{ color: "#6b7280", fontSize: 14 }}>Best score</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.bestScore}/10</div>
              </div>
              <div style={cardStyle()}>
                <div style={{ color: "#6b7280", fontSize: 14 }}>Fastest time</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>
                  {stats.totalSets ? formatSeconds(stats.fastestTimeSeconds) : "--:--"}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              <div style={cardStyle()}>
                <h2 style={{ marginTop: 0 }}>Set History</h2>
                <p style={{ color: "#6b7280" }}>Your recent 10-question sets.</p>
                {history.length === 0 ? (
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, color: "#6b7280" }}>
                    No completed sets yet. Finish a timed practice round to start tracking progress.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {history.map((item, index) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          border: "1px solid #e5e7eb",
                          borderRadius: 16,
                          padding: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>Set {history.length - index}</div>
                          <div style={{ fontSize: 14, color: "#6b7280" }}>
                            Completed: {item.completedAt}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={badgeStyle("dark")}>Score: {item.correctCount}/10</span>
                          <span style={badgeStyle("light")}>Accuracy: {item.accuracy}%</span>
                          <span style={badgeStyle("outline")}>Time: {formatSeconds(item.timeSeconds)}</span>
                          <span style={badgeStyle("outline")}>Mistakes: {item.mistakes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={cardStyle()}>
                <h2 style={{ marginTop: 0 }}>Focus Areas</h2>
                <p style={{ color: "#6b7280" }}>Track which operation needs more practice.</p>
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>Average time</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                      {stats.totalSets ? formatSeconds(stats.averageTimeSeconds) : "--:--"}
                    </div>
                  </div>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>Addition mistakes</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalAdditionMistakes}</div>
                  </div>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>Subtraction mistakes</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalSubtractionMistakes}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
