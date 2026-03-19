import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Calculator, CheckCircle2, Play, RefreshCw, Timer, XCircle } from "lucide-react";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeProblem(operation) {
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
  return Array.from({ length: count }, (_, i) => makeProblem(i % 2 === 0 ? "+" : "-"));
}

function similarPracticeFromMistakes(mistakes) {
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

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function QuestionList({ questions, answers, setAnswers, disabled, placeholder = "Answer" }) {
  return (
    <div className="grid gap-3">
      {questions.map((q, i) => (
        <div
          key={`${q.a}-${q.b}-${q.operation}-${i}`}
          className="grid grid-cols-1 gap-2 rounded-2xl border p-3 md:grid-cols-[1fr_120px] items-center"
        >
          <div className="text-lg font-medium tracking-wide">
            {i + 1}. {q.a} {q.operation} {q.b} =
          </div>
          <Input
            inputMode="numeric"
            value={answers[i] ?? ""}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...answers];
              next[i] = e.target.value.replace(/[^0-9-]/g, "");
              setAnswers(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ResultsCard({ title, results }) {
  if (!results) return null;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Score: {results.correctCount} / {results.details.length} · Accuracy: {results.accuracy}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.details.map((d) => (
          <div key={`${title}-${d.index}`} className="flex items-start justify-between gap-3 rounded-2xl border p-3">
            <div>
              <div className="font-medium">
                {d.index}. {d.a} {d.operation} {d.b} = {d.answer}
              </div>
              <div className="text-sm text-muted-foreground">Your answer: {d.userAnswer || "(blank)"}</div>
            </div>
            {d.correct ? (
              <Badge className="rounded-full">
                <CheckCircle2 className="mr-1 h-4 w-4" /> Correct
              </Badge>
            ) : (
              <Badge variant="destructive" className="rounded-full">
                <XCircle className="mr-1 h-4 w-4" /> Incorrect
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function MathPracticeApp() {
  const [mode, setMode] = useState("practice");
  const [questions, setQuestions] = useState(() => makeSet(10));
  const [answers, setAnswers] = useState(Array(10).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [extraQuestions, setExtraQuestions] = useState([]);
  const [extraAnswers, setExtraAnswers] = useState([]);
  const [extraSubmitted, setExtraSubmitted] = useState(false);

  const [history, setHistory] = useState([]);

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
      ? Math.round(history.reduce((sum, item) => sum + item.accuracy, 0) / totalSets)
      : 0;
    const averageTimeSeconds = totalSets
      ? Math.round(history.reduce((sum, item) => sum + item.timeSeconds, 0) / totalSets)
      : 0;
    const bestScore = totalSets ? Math.max(...history.map((item) => item.correctCount)) : 0;
    const fastestTimeSeconds = totalSets ? Math.min(...history.map((item) => item.timeSeconds)) : 0;
    const totalAdditionMistakes = history.reduce((sum, item) => sum + item.additionMistakes, 0);
    const totalSubtractionMistakes = history.reduce((sum, item) => sum + item.subtractionMistakes, 0);

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

    const addMistakes = mainResults.mistakes.filter((m) => m.operation === "+").length;
    const subMistakes = mainResults.mistakes.filter((m) => m.operation === "-").length;

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="rounded-[24px] border shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-3xl">
                    <Calculator className="h-8 w-8" /> Basic Math Practice
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Practice 2-digit addition and subtraction with timed sets, instant checking, progress tracking, and follow-up questions based on mistakes.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1">2-digit only</Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1">10 questions</Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1">Timed sets</Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1">Stats page</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          <Button variant={mode === "practice" ? "default" : "outline"} onClick={() => setMode("practice")}>
            Practice
          </Button>
          <Button variant={mode === "stats" ? "default" : "outline"} onClick={() => setMode("stats")}>
            <BarChart3 className="mr-2 h-4 w-4" /> Statistics
          </Button>
        </div>

        {mode === "practice" && (
          <>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Main Practice Set</CardTitle>
                    <CardDescription>Press Start to begin the timer. The clock stops when you click Check Answers.</CardDescription>
                  </div>
                  <div className="flex w-fit items-center gap-2 rounded-2xl border px-4 py-2">
                    <Timer className="h-4 w-4" />
                    <span className="font-semibold tabular-nums">{formatSeconds(timeElapsed)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {!hasStarted || submitted ? (
                    <Button onClick={startSet}>
                      <Play className="mr-2 h-4 w-4" /> {submitted ? "Start New Timed Set" : "Start"}
                    </Button>
                  ) : null}
                  <Button variant="outline" onClick={resetMain}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                </div>

                <QuestionList
                  questions={questions}
                  answers={answers}
                  setAnswers={setAnswers}
                  disabled={!hasStarted || submitted}
                  placeholder={hasStarted ? "Answer" : "Press Start"}
                />

                <div className="flex flex-wrap gap-3">
                  <Button onClick={submitMain} disabled={submitted || !hasStarted}>
                    Check Answers
                  </Button>
                </div>
              </CardContent>
            </Card>

            {submitted && mainResults && (
              <>
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Report</CardTitle>
                    <CardDescription>{reportText}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-2 text-sm text-muted-foreground">Accuracy</div>
                      <Progress value={mainResults.accuracy} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full px-3 py-1">Score: {mainResults.correctCount} / 10</Badge>
                      <Badge variant="secondary" className="rounded-full px-3 py-1">Accuracy: {mainResults.accuracy}%</Badge>
                      <Badge variant="outline" className="rounded-full px-3 py-1">Mistakes: {mainResults.mistakes.length}</Badge>
                      <Badge variant="outline" className="rounded-full px-3 py-1">Time: {formatSeconds(timeElapsed)}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <ResultsCard title="Checked Answers" results={mainResults} />
              </>
            )}

            {submitted && extraQuestions.length > 0 && (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Extra Practice: 5 Similar Questions</CardTitle>
                  <CardDescription>These are based on the kinds of mistakes from the timed set.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QuestionList
                    questions={extraQuestions}
                    answers={extraAnswers}
                    setAnswers={setExtraAnswers}
                    disabled={extraSubmitted}
                    placeholder="Answer"
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setExtraSubmitted(true)} disabled={extraSubmitted}>
                      Check Extra Practice
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const next = similarPracticeFromMistakes(mainResults.mistakes);
                        setExtraQuestions(next);
                        setExtraAnswers(Array(next.length).fill(""));
                        setExtraSubmitted(false);
                      }}
                    >
                      Generate New Similar 5
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {extraSubmitted && extraResults && <ResultsCard title="Extra Practice Results" results={extraResults} />}
          </>
        )}

        {mode === "stats" && (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardDescription>Total sets completed</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalSets}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardDescription>Average accuracy</CardDescription>
                  <CardTitle className="text-3xl">{stats.averageAccuracy}%</CardTitle>
                </CardHeader>
              </Card>
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardDescription>Best score</CardDescription>
                  <CardTitle className="text-3xl">{stats.bestScore}/10</CardTitle>
                </CardHeader>
              </Card>
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardDescription>Fastest time</CardDescription>
                  <CardTitle className="text-3xl">
                    {stats.totalSets ? formatSeconds(stats.fastestTimeSeconds) : "--:--"}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="rounded-2xl shadow-sm md:col-span-2">
                <CardHeader>
                  <CardTitle>Set History</CardTitle>
                  <CardDescription>Your recent 10-question sets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {history.length === 0 ? (
                    <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                      No completed sets yet. Finish a timed practice round to start tracking progress.
                    </div>
                  ) : (
                    history.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <div className="font-medium">Set {history.length - index}</div>
                          <div className="text-sm text-muted-foreground">Completed: {item.completedAt}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="rounded-full px-3 py-1">Score: {item.correctCount}/10</Badge>
                          <Badge variant="secondary" className="rounded-full px-3 py-1">Accuracy: {item.accuracy}%</Badge>
                          <Badge variant="outline" className="rounded-full px-3 py-1">Time: {formatSeconds(item.timeSeconds)}</Badge>
                          <Badge variant="outline" className="rounded-full px-3 py-1">Mistakes: {item.mistakes}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Focus Areas</CardTitle>
                  <CardDescription>Track which operation needs more practice.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Average time</div>
                    <div className="text-2xl font-semibold">
                      {stats.totalSets ? formatSeconds(stats.averageTimeSeconds) : "--:--"}
                    </div>
                  </div>
                  <div className="rounded-2xl border p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Addition mistakes</div>
                    <div className="text-2xl font-semibold">{stats.totalAdditionMistakes}</div>
                  </div>
                  <div className="rounded-2xl border p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Subtraction mistakes</div>
                    <div className="text-2xl font-semibold">{stats.totalSubtractionMistakes}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
