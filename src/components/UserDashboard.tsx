import { BookOpen, LogOut, FileText, PenTool } from "lucide-react";
import { Material, UserRole } from "../types";

interface UserDashboardProps {
  materials: Material[];
  userRole: UserRole;
  onSelectMaterial: (material: Material) => void;
  onLogout: () => void;
}

export function UserDashboard({
  materials,
  userRole,
  onSelectMaterial,
  onLogout,
}: UserDashboardProps) {
  const canAccessQuiz = userRole === "user-verif";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <div>
              <h1>Portal Pembelajaran</h1>
              <p className="text-sm text-gray-600">
                {userRole === "user-verif"
                  ? "User Terverifikasi"
                  : "User Biasa"}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!canAccessQuiz && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              ℹ️ Anda hanya dapat mengakses materi PDF. Untuk mengakses latihan
              soal, hubungi admin untuk verifikasi akun.
            </p>
          </div>
        )}

        {materials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada materi tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                onClick={() => onSelectMaterial(material)}
              >
                <div className="flex items-start justify-between mb-4">
                  <BookOpen className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                </div>
                <h3 className="mb-3">{material.title}</h3>
                <div className="space-y-2 text-sm">
                  {material.pdfUrl && (
                    <div className="flex items-center gap-2 text-green-600">
                      <FileText className="w-4 h-4" />
                      <span>Materi PDF</span>
                    </div>
                  )}
                  {canAccessQuiz && material.questionCount > 0 && (
                    <div className="flex items-center gap-2 text-indigo-600">
                      <PenTool className="w-4 h-4" />
                      <span>{material.questionCount} Latihan Soal</span>
                    </div>
                  )}
                  {!canAccessQuiz && material.questionCount > 0 && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <PenTool className="w-4 h-4" />
                      <span>Latihan Soal (Terkunci)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
