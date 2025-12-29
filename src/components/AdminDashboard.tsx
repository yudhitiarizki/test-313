import { useState } from "react";
import { Plus, BookOpen, LogOut, Trash2, Loader2 } from "lucide-react";
import { Material } from "../types";

interface AdminDashboardProps {
  materials: Material[];
  onAddMaterial: (title: string) => Promise<boolean>;
  onSelectMaterial: (material: Material) => void;
  onDeleteMaterial: (id: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({
  materials,
  onAddMaterial,
  onSelectMaterial,
  onDeleteMaterial,
  onLogout,
}: AdminDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const success = await onAddMaterial(newTitle.trim());
        if (success) {
          setNewTitle("");
          setShowAddForm(false);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus materi "${title}"?`)) {
      setDeletingId(id);
      try {
        await onDeleteMaterial(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Dashboard Admin
              </h1>
              <p className="text-sm text-gray-600">
                Kelola materi pembelajaran
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
        {/* Add Material Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Tambah Materi Baru
          </button>
        </div>

        {/* Add Material Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-indigo-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tambah Materi Baru
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nama Materi
                </label>
                <input
                  id="title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Contoh: Matematika Dasar"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTitle("");
                  }}
                  disabled={isSubmitting}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Materials Grid */}
        {materials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Belum ada materi. Tambahkan materi pertama Anda!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div
                key={material.id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 relative group ${
                  deletingId === material.id ? "opacity-50" : ""
                }`}
              >
                <div
                  onClick={() => !deletingId && onSelectMaterial(material)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <BookOpen className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {material.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      📝
                      <span>{material.questionCount || 0} Soal</span>
                    </p>
                    {material.pdfUrl && (
                      <p className="flex items-center gap-2">
                        📄 <span>Materi PDF tersedia</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Dibuat:{" "}
                      {new Date(material.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(material.id, material.title);
                  }}
                  disabled={deletingId === material.id}
                  className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                  title="Hapus materi"
                >
                  {deletingId === material.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
