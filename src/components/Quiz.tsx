import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Eye,
  ChevronLeft,
  BookOpen,
  Play,
} from "lucide-react";
import { Question, QuizAnswer } from "../types";

interface QuizProps {
  questions: Question[];
  materialTitle: string;
  onBack: () => void;
}

type ViewMode = "intro" | "quiz" | "review" | "finished";

// Utility function to shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function Quiz({ questions, materialTitle, onBack }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("intro");
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  // Shuffle questions and options when component mounts
  useEffect(() => {
    // Shuffle questions
    const questionsToShuffle = shuffleArray(questions);

    // Shuffle options for each multiple choice question
    const shuffledQs = questionsToShuffle.map((question) => {
      if (question.type === "pilihan-ganda" && question.options) {
        return {
          ...question,
          options: shuffleArray(question.options),
        };
      }
      return question;
    });

    setShuffledQuestions(shuffledQs);
  }, [questions]);

  // Use shuffled questions if available, otherwise use original
  const activeQuestions =
    shuffledQuestions.length > 0 ? shuffledQuestions : questions;
  const currentQuestion = activeQuestions[currentIndex];
  const isMultipleCorrectAnswers =
    currentQuestion.type === "pilihan-ganda" &&
    currentQuestion.correctAnswers.length > 1;

  // Check if current question has been answered
  const hasAnswered = answers.some((a) => a.questionId === currentQuestion.id);
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion.id
  );

  const handleToggleAnswer = (optionId: string) => {
    if (showAnswer || hasAnswered) return; // Cannot change answer if already submitted

    // If only one correct answer, use single select (radio button behavior)
    if (!isMultipleCorrectAnswers && currentQuestion.type === "pilihan-ganda") {
      setSelectedAnswers([optionId]);
    } else {
      // Multiple correct answers, use multiselect (checkbox behavior)
      if (selectedAnswers.includes(optionId)) {
        setSelectedAnswers(selectedAnswers.filter((id) => id !== optionId));
      } else {
        setSelectedAnswers([...selectedAnswers, optionId]);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswers.length === 0) {
      alert("Pilih jawaban terlebih dahulu!");
      return;
    }

    let isCorrect = false;

    if (currentQuestion.type === "pilihan-ganda") {
      // Check if selected answers match correct answers (multiselect)
      const correctSet = new Set(currentQuestion.correctAnswers);
      const selectedSet = new Set(selectedAnswers);

      isCorrect =
        correctSet.size === selectedSet.size &&
        [...correctSet].every((answer) => selectedSet.has(answer));
    }

    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        answers: selectedAnswers,
        isCorrect,
      },
    ]);

    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const nextQuestion = activeQuestions[currentIndex + 1];
      const nextAnswer = answers.find((a) => a.questionId === nextQuestion.id);

      if (nextAnswer) {
        // Load previous answer
        setSelectedAnswers(nextAnswer.answers);
        setShowAnswer(true);
      } else {
        // New question
        setSelectedAnswers([]);
        setShowAnswer(false);
      }
    } else {
      setViewMode("finished");
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const prevQuestion = activeQuestions[currentIndex - 1];
      const prevAnswer = answers.find((a) => a.questionId === prevQuestion.id);

      if (prevAnswer) {
        setSelectedAnswers(prevAnswer.answers);
        setShowAnswer(true);
      }
    }
  };

  const calculateScore = () => {
    const multipleChoiceAnswers = answers.filter((answer) => {
      const question = activeQuestions.find((q) => q.id === answer.questionId);
      return question?.type === "pilihan-ganda";
    });
    const correctAnswers = multipleChoiceAnswers.filter(
      (a) => a.isCorrect
    ).length;
    const totalMultipleChoice = activeQuestions.filter(
      (q) => q.type === "pilihan-ganda"
    ).length;

    if (totalMultipleChoice === 0) return 0;

    return Math.round((correctAnswers / totalMultipleChoice) * 100);
  };

  // Intro Page
  if (viewMode === "intro") {
    const multipleChoiceCount = activeQuestions.filter(
      (q) => q.type === "pilihan-ganda"
    ).length;
    const essayCount = activeQuestions.filter((q) => q.type === "essay").length;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <h1>{materialTitle}</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-12 h-12 text-indigo-600" />
                </div>
              </div>

              <h2 className="mb-4">Latihan Soal</h2>

              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Anda akan mengerjakan latihan soal dari materi{" "}
                <span className="font-medium">{materialTitle}</span>. Pastikan
                untuk membaca setiap soal dengan teliti sebelum menjawab.
              </p>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-600 mb-1">Total Soal</p>
                  <p className="text-3xl text-blue-700">
                    {activeQuestions.length}
                  </p>
                </div>
                {multipleChoiceCount > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-green-600 mb-1">Pilihan Ganda</p>
                    <p className="text-3xl text-green-700">
                      {multipleChoiceCount}
                    </p>
                  </div>
                )}
                {essayCount > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-purple-600 mb-1">Essay</p>
                    <p className="text-3xl text-purple-700">{essayCount}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setViewMode("quiz")}
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                <span>Mulai Latihan</span>
              </button>

              <button
                onClick={() => setViewMode("review")}
                className="bg-gray-200 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-3"
              >
                <Eye className="w-6 h-6" />
                <span>Review Soal & Jawaban</span>
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <span className="font-medium">Tips:</span> Gunakan fitur
                "Review Soal & Jawaban" untuk melihat semua soal beserta kunci
                jawabannya sebelum memulai latihan. Ini akan membantu Anda
                memahami materi dengan lebih baik!
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Review All Answers Page
  if (viewMode === "review") {
    const hasStartedQuiz = answers.length > 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => setViewMode(hasStartedQuiz ? "quiz" : "intro")}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
            >
              <ChevronLeft className="w-5 h-5" />
              {hasStartedQuiz ? "Kembali ke Quiz" : "Kembali"}
            </button>
            <h1>{materialTitle}</h1>
            <p className="text-sm text-gray-600">Review Semua Soal & Jawaban</p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {activeQuestions.map((question, qIndex) => {
              const answer = answers.find((a) => a.questionId === question.id);
              const isAnswered = !!answer;

              return (
                <div
                  key={question.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm ${
                            question.type === "pilihan-ganda"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {question.type === "pilihan-ganda"
                            ? "Pilihan Ganda"
                            : "Essay"}
                        </span>
                        {isAnswered && question.type === "pilihan-ganda" && (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${
                              answer.isCorrect
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {answer.isCorrect ? "✓ Benar" : "✗ Salah"}
                          </span>
                        )}
                      </div>
                      <h3 className="mb-3">
                        {qIndex + 1}. {question.question}
                      </h3>
                    </div>
                  </div>

                  {/* Options for Multiple Choice */}
                  {question.type === "pilihan-ganda" && question.options && (
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optIndex) => {
                        const isSelected = answer?.answers.includes(option.id);
                        const isCorrect = question.correctAnswers.includes(
                          option.id
                        );
                        const optionLetter = String.fromCharCode(65 + optIndex);

                        let bgColor = "bg-gray-50";
                        if (isCorrect) {
                          bgColor = "bg-green-50 border-green-500";
                        } else if (isSelected && !isCorrect) {
                          bgColor = "bg-red-50 border-red-500";
                        }

                        return (
                          <div
                            key={option.id}
                            className={`p-3 border-2 rounded-lg ${bgColor} ${
                              isCorrect || (isSelected && !isCorrect)
                                ? "border-2"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm">
                                {optionLetter}
                              </span>
                              <span className="flex-1">{option.text}</span>
                              {isCorrect && (
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                              {isSelected && !isCorrect && (
                                <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Essay Answer */}
                  {question.type === "essay" && (
                    <div className="space-y-3">
                      {answer && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-1">
                            Jawaban Anda:
                          </p>
                          <p className="text-gray-800">{answer.answers[0]}</p>
                        </div>
                      )}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-600 mb-1">
                          Kunci Jawaban:
                        </p>
                        <p className="text-blue-800">
                          {question.correctAnswers[0]}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700 mb-1">
                        💡 Penjelasan:
                      </p>
                      <p className="text-sm text-gray-600">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex gap-3">
            {hasStartedQuiz ? (
              <>
                <button
                  onClick={() => setViewMode("quiz")}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Kembali ke Quiz
                </button>
                {answers.length === activeQuestions.length && (
                  <button
                    onClick={() => setViewMode("finished")}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Lihat Nilai
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setViewMode("intro")}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Mulai Latihan Sekarang
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Finished Page
  if (viewMode === "finished") {
    const score = calculateScore();
    const multipleChoiceCount = activeQuestions.filter(
      (q) => q.type === "pilihan-ganda"
    ).length;
    const essayCount = activeQuestions.filter((q) => q.type === "essay").length;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <h1>{materialTitle}</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              {score >= 80 ? (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
              ) : score >= 60 ? (
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">⚠️</span>
                </div>
              ) : (
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-12 h-12 text-red-600" />
                </div>
              )}
            </div>

            <h2 className="mb-4">Latihan Selesai!</h2>

            {multipleChoiceCount > 0 && (
              <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                <div className="text-6xl mb-2">{score}</div>
                <p className="text-indigo-800">Nilai Pilihan Ganda</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 mb-1">Total Soal</p>
                <p className="text-2xl">{activeQuestions.length}</p>
              </div>
              {multipleChoiceCount > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-600 mb-1">Pilihan Ganda Benar</p>
                  <p className="text-2xl text-green-700">
                    {
                      answers.filter((a) => {
                        const q = activeQuestions.find(
                          (q) => q.id === a.questionId
                        );
                        return q?.type === "pilihan-ganda" && a.isCorrect;
                      }).length
                    }{" "}
                    / {multipleChoiceCount}
                  </p>
                </div>
              )}
              {essayCount > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-600 mb-1">Soal Essay</p>
                  <p className="text-2xl text-blue-700">{essayCount}</p>
                  <p className="text-sm text-blue-600">
                    Periksa jawabanmu dengan kunci jawaban
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setViewMode("review")}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Review Jawaban
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz Page (Current Question)
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <div className="flex items-center justify-between">
            <h1>{materialTitle}</h1>
            <button
              onClick={() => setViewMode("review")}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <Eye className="w-4 h-4" />
              Review Semua
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Soal {currentIndex + 1} / {activeQuestions.length}
              </span>
              <span>{answers.length} Terjawab</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(answers.length / activeQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Type Badge */}
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                currentQuestion.type === "pilihan-ganda"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {currentQuestion.type === "pilihan-ganda"
                ? "Pilihan Ganda"
                : "Essay"}
            </span>
            {currentQuestion.type === "pilihan-ganda" &&
              currentQuestion.correctAnswers.length > 1 && (
                <span className="inline-block px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700">
                  Pilih {currentQuestion.correctAnswers.length} Jawaban
                </span>
              )}
            {hasAnswered && (
              <span className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                ✓ Sudah Dijawab
              </span>
            )}
          </div>

          {/* Question */}
          <div className="mb-6">
            <h2 className="mb-4">
              {currentIndex + 1}. {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          {currentQuestion.type === "pilihan-ganda" ? (
            <div className="space-y-3 mb-6">
              {currentQuestion.options?.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isSelected = selectedAnswers.includes(option.id);
                const isCorrect = currentQuestion.correctAnswers.includes(
                  option.id
                );

                let bgColor = "bg-gray-50 hover:bg-gray-100 border-gray-200";
                let checkboxBg = "border-gray-300";

                if (showAnswer) {
                  if (isCorrect) {
                    bgColor = "bg-green-50 border-green-500";
                    checkboxBg = "border-green-500 bg-green-500";
                  } else if (isSelected && !isCorrect) {
                    bgColor = "bg-red-50 border-red-500";
                    checkboxBg = "border-red-500 bg-red-500";
                  }
                } else if (isSelected) {
                  bgColor = "bg-indigo-50 border-indigo-500";
                  checkboxBg = "border-indigo-500 bg-indigo-500";
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleToggleAnswer(option.id)}
                    disabled={showAnswer || hasAnswered}
                    className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${bgColor} ${
                      showAnswer || hasAnswered
                        ? "cursor-default"
                        : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Show checkbox for multiple answers, radio for single answer */}
                      {isMultipleCorrectAnswers ? (
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${checkboxBg}`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      ) : (
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${checkboxBg}`}
                        >
                          {isSelected && (
                            <div className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </div>
                      )}
                      <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {optionLetter}
                      </span>
                      <span className="flex-1">{option.text}</span>
                      {showAnswer && isCorrect && (
                        <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                      )}
                      {showAnswer && isSelected && !isCorrect && (
                        <X className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mb-6">
              <textarea
                value={selectedAnswers[0] || ""}
                onChange={(e) => setSelectedAnswers([e.target.value])}
                disabled={showAnswer || hasAnswered}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                rows={6}
                placeholder="Ketik jawaban Anda di sini..."
              />
            </div>
          )}

          {/* Show Correct Answer */}
          {showAnswer && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                currentQuestion.type === "pilihan-ganda"
                  ? currentAnswer?.isCorrect
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <p className="mb-2">
                {currentQuestion.type === "pilihan-ganda" ? (
                  currentAnswer?.isCorrect ? (
                    <span className="text-green-700">
                      ✓ Jawaban Anda benar!
                    </span>
                  ) : (
                    <span className="text-red-700">
                      ✗ Jawaban Anda kurang tepat
                    </span>
                  )
                ) : (
                  <span className="text-blue-700">💡 Kunci Jawaban:</span>
                )}
              </p>

              {currentQuestion.type === "pilihan-ganda" &&
                !currentAnswer?.isCorrect && (
                  <div className="bg-white rounded p-3 mb-2">
                    <p className="mb-1">Jawaban yang benar:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {currentQuestion.options
                        ?.filter((opt) =>
                          currentQuestion.correctAnswers.includes(opt.id)
                        )
                        .map((opt) => (
                          <li key={opt.id} className="text-green-700">
                            {String.fromCharCode(
                              65 + currentQuestion.options!.indexOf(opt)
                            )}
                            . {opt.text}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

              {currentQuestion.type === "essay" && (
                <div className="bg-white rounded p-3 mb-2">
                  <p>{currentQuestion.correctAnswers[0]}</p>
                </div>
              )}

              {currentQuestion.explanation && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700 mb-1">Penjelasan:</p>
                  <p className="text-sm text-gray-600">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Sebelumnya
            </button>

            <div className="flex-1 flex gap-3">
              {!showAnswer && !hasAnswered ? (
                <button
                  onClick={handleSubmitAnswer}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Lihat Jawaban
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  {currentIndex < activeQuestions.length - 1 ? (
                    <>
                      Soal Berikutnya
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    "Selesai"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
