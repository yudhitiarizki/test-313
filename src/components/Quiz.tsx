import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Question, QuizAnswer } from "../types";

interface QuizProps {
  questions: Question[];
  materialTitle: string;
  onBack: () => void;
}

export function Quiz({ questions, materialTitle, onBack }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isMultipleCorrectAnswers =
    currentQuestion.type === "pilihan-ganda" &&
    currentQuestion.correctAnswers.length > 1;

  const handleToggleAnswer = (optionId: string) => {
    if (showAnswer) return;

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

      console.log("Correct Set:", correctSet);
      console.log("Selected Set:", selectedSet);

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
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswers([]);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    const multipleChoiceAnswers = answers.filter(
      (_, index) => questions[index].type === "pilihan-ganda"
    );
    const correctAnswers = multipleChoiceAnswers.filter(
      (a) => a.isCorrect
    ).length;
    const totalMultipleChoice = questions.filter(
      (q) => q.type === "pilihan-ganda"
    ).length;

    if (totalMultipleChoice === 0) return 0;

    return Math.round((correctAnswers / totalMultipleChoice) * 100);
  };

  if (isFinished) {
    const score = calculateScore();
    const multipleChoiceCount = questions.filter(
      (q) => q.type === "pilihan-ganda"
    ).length;
    const essayCount = questions.filter((q) => q.type === "essay").length;

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
                <p className="text-2xl">{questions.length}</p>
              </div>
              {multipleChoiceCount > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-600 mb-1">Pilihan Ganda Benar</p>
                  <p className="text-2xl text-green-700">
                    {
                      answers.filter(
                        (a, i) =>
                          questions[i].type === "pilihan-ganda" && a.isCorrect
                      ).length
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

            <button
              onClick={onBack}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Selesai
            </button>
          </div>
        </main>
      </div>
    );
  }

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
            <span className="text-sm text-gray-600">
              Soal {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {Math.round(((currentIndex + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Type Badge */}
          <div className="mb-4">
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
                <span className="inline-block ml-2 px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700">
                  Pilih {currentQuestion.correctAnswers.length} Jawaban
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
                    disabled={showAnswer}
                    className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${bgColor} ${
                      showAnswer ? "cursor-default" : "cursor-pointer"
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
                disabled={showAnswer}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  ? answers[answers.length - 1]?.isCorrect
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <p className="mb-2">
                {currentQuestion.type === "pilihan-ganda" ? (
                  answers[answers.length - 1]?.isCorrect ? (
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
                !answers[answers.length - 1]?.isCorrect && (
                  <div className="bg-white rounded p-3 mb-2">
                    <p className="mb-1">Jawaban yang benar:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {currentQuestion.options
                        ?.filter((opt) =>
                          currentQuestion.correctAnswers.includes(opt.id)
                        )
                        .map((opt, idx) => (
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

          {/* Actions */}
          <div className="flex gap-3">
            {!showAnswer ? (
              <button
                onClick={handleSubmitAnswer}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Lihat Jawaban
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {currentIndex < questions.length - 1
                  ? "Soal Berikutnya"
                  : "Selesai"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
