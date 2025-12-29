import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  PenTool,
  Upload,
} from "lucide-react";
import { Material, Question, UserRole } from "../types";

interface MaterialDetailProps {
  material: Material;
  userRole: UserRole;
  onBack: () => void;
  onAddQuestion: (question: Omit<Question, "id">) => void;
  onDeleteQuestion: (questionId: string) => void;
  onStartQuiz: () => void;
  onUploadPDF: (file: File) => void;
  onDeletePDF: () => void;
}

export function MaterialDetail({
  material,
  userRole,
  onBack,
  onAddQuestion,
  onDeleteQuestion,
  onStartQuiz,
  onUploadPDF,
  onDeletePDF,
}: MaterialDetailProps) {
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionType, setQuestionType] = useState<"pilihan-ganda" | "essay">(
    "pilihan-ganda"
  );
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [explanation, setExplanation] = useState("");

  const isAdmin = userRole === "admin";
  const canAccessQuiz = userRole === "admin" || userRole === "user-verif";

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      alert("Minimal harus ada 2 pilihan jawaban!");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);

    // Remove correct answer if it was selected
    const removedOptionId = `temp_${index}`;
    if (correctAnswers.includes(removedOptionId)) {
      setCorrectAnswers(correctAnswers.filter((id) => id !== removedOptionId));
    }

    // Reindex correct answers after removal
    const reindexedAnswers = correctAnswers
      .map((id) => {
        const oldIndex = parseInt(id.split("_")[1]);
        if (oldIndex > index) {
          return `temp_${oldIndex - 1}`;
        }
        return id;
      })
      .filter((id) => id !== removedOptionId);

    setCorrectAnswers(reindexedAnswers);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    if (questionType === "pilihan-ganda") {
      // Validate at least one correct answer selected
      if (correctAnswers.length === 0) {
        alert("Pilih minimal satu jawaban yang benar!");
        return;
      }

      // Create options with IDs
      const createdOptions = options
        .filter((opt) => opt.trim() !== "")
        .map((text, index) => ({
          id: `opt_${Date.now()}_${index}`,
          text,
        }));

      // Map temporary IDs to real option IDs
      const realCorrectAnswers = correctAnswers.map((tempId) => {
        const index = parseInt(tempId.split("_")[1]);
        return createdOptions[index].id;
      });

      const newQuestion: Omit<Question, "id"> = {
        type: questionType,
        question: questionText,
        options: createdOptions,
        correctAnswers: realCorrectAnswers,
        explanation: explanation || undefined,
      };

      console.log("New Question:", newQuestion);

      onAddQuestion(newQuestion);
    } else {
      // Essay
      const newQuestion: Omit<Question, "id"> = {
        type: questionType,
        question: questionText,
        correctAnswers: [correctAnswers[0] || ""],
        explanation: explanation || undefined,
      };
      console.log("New Question essay:", newQuestion);
      onAddQuestion(newQuestion);
    }

    // Reset form
    setQuestionText("");
    setOptions(["", ""]); // Reset to 2 options
    setCorrectAnswers([]);
    setExplanation("");
    setShowAddQuestion(false);
  };

  const handleToggleCorrectAnswer = (index: number) => {
    const optionId = `temp_${index}`; // Temporary ID for selection
    if (correctAnswers.includes(optionId)) {
      setCorrectAnswers(correctAnswers.filter((id) => id !== optionId));
    } else {
      setCorrectAnswers([...correctAnswers, optionId]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onUploadPDF(file);
    } else {
      alert("Hanya file PDF yang diperbolehkan!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <h1>{material.title}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PDF Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                Materi PDF
              </h2>
            </div>

            {material.pdfUrl ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 mb-2">
                    📄 {material.pdfName || "Materi.pdf"}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={material.pdfUrl}
                      download
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Download PDF
                    </a>
                    {isAdmin && (
                      <button
                        onClick={onDeletePDF}
                        className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {isAdmin ? (
                  <>
                    <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Belum ada materi PDF</p>
                    <label className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                      Upload PDF
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Belum ada materi PDF tersedia
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quiz Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2">
                <PenTool className="w-6 h-6 text-indigo-600" />
                Latihan Soal
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Soal
                </button>
              )}
            </div>

            {!canAccessQuiz ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">
                  🔒 Anda tidak memiliki akses ke latihan soal
                </p>
              </div>
            ) : material.questions.length === 0 ? (
              <div className="text-center py-8">
                <PenTool className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">Belum ada soal latihan</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-indigo-800 mb-1">
                    Total: {material.questions.length} Soal
                  </p>
                  <p className="text-sm text-indigo-600">
                    • Pilihan Ganda:{" "}
                    {
                      material.questions.filter(
                        (q) => q.type === "pilihan-ganda"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-indigo-600">
                    • Essay:{" "}
                    {
                      material.questions.filter((q) => q.type === "essay")
                        .length
                    }
                  </p>
                </div>
                <button
                  onClick={onStartQuiz}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Mulai Latihan
                </button>

                {/* Question List for Admin */}
                {isAdmin && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm">Daftar Soal:</h3>
                    {material.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="bg-gray-50 rounded-lg p-3 flex items-start justify-between group"
                      >
                        <div className="flex-1">
                          <p className="text-sm mb-1">
                            <span className="text-gray-500">#{index + 1}</span>{" "}
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">
                              {question.type === "pilihan-ganda"
                                ? "PG"
                                : "Essay"}
                            </span>
                          </p>
                          <p className="text-sm">{question.question}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Yakin ingin menghapus soal ini?")) {
                              onDeleteQuestion(question.id);
                            }
                          }}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Question Form Modal */}
        {showAddQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="mb-4">Tambah Soal Baru</h2>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                {/* Question Type */}
                <div>
                  <label className="block mb-2">Tipe Soal</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="pilihan-ganda"
                        checked={questionType === "pilihan-ganda"}
                        onChange={(e) => setQuestionType(e.target.value as any)}
                        className="w-4 h-4"
                      />
                      Pilihan Ganda
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="essay"
                        checked={questionType === "essay"}
                        onChange={(e) => setQuestionType(e.target.value as any)}
                        className="w-4 h-4"
                      />
                      Essay
                    </label>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label htmlFor="question" className="block mb-2">
                    Pertanyaan
                  </label>
                  <textarea
                    id="question"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                {/* Options for Multiple Choice */}
                {questionType === "pilihan-ganda" && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block">Pilihan Jawaban</label>
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Tambah Pilihan
                        </button>
                      </div>
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-gray-600 w-6">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...options];
                                newOptions[index] = e.target.value;
                                setOptions(newOptions);
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder={`Pilihan ${String.fromCharCode(
                                65 + index
                              )}`}
                              required
                            />
                            {options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus pilihan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2">Jawaban Benar</label>
                      <p className="text-sm text-gray-600 mb-2">
                        ✓ Pilih satu atau lebih jawaban yang benar
                      </p>
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={correctAnswers.includes(`temp_${index}`)}
                              onChange={() => handleToggleCorrectAnswer(index)}
                              className="w-4 h-4"
                            />
                            <span className="text-gray-600 w-6">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className="text-gray-600 flex-1">
                              {option || "(belum diisi)"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Answer for Essay */}
                {questionType === "essay" && (
                  <div>
                    <label htmlFor="essayAnswer" className="block mb-2">
                      Jawaban yang Benar
                    </label>
                    <textarea
                      id="essayAnswer"
                      value={correctAnswers[0] || ""}
                      onChange={(e) => setCorrectAnswers([e.target.value])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label htmlFor="explanation" className="block mb-2">
                    Penjelasan (Opsional)
                  </label>
                  <textarea
                    id="explanation"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Simpan Soal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddQuestion(false);
                      setQuestionText("");
                      setOptions(["", ""]); // Reset to 2 options
                      setCorrectAnswers([]);
                      setExplanation("");
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
