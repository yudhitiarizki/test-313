import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { MaterialDetail } from "./components/MaterialDetail";
import { Quiz } from "./components/Quiz";
import { Material, Question, UserRole } from "./types";
import courseService from "./services/courseService";

type View = "login" | "dashboard" | "material-detail" | "quiz";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<View>("login");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load materials from API on mount and when user logs in
  useEffect(() => {
    if (currentUser && currentView === "dashboard") {
      loadMaterials();
    }
  }, [currentUser, currentView]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getAllCourses();
      setMaterials(data);
    } catch (err) {
      setError("Gagal memuat data courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (role: UserRole) => {
    setCurrentUser(role);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("login");
    setSelectedMaterial(null);
    setMaterials([]);
  };

  const handleAddMaterial = async (title: string) => {
    try {
      setLoading(true);
      setError(null);
      const newMaterial = await courseService.createCourse(title);
      setMaterials([...materials, newMaterial]);
    } catch (err) {
      setError("Gagal membuat course");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await courseService.deleteCourse(id);
      setMaterials(materials.filter((m) => m.id !== id));
    } catch (err) {
      setError("Gagal menghapus course");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMaterial = async (material: Material) => {
    try {
      setLoading(true);
      setError(null);
      // Load full course detail with questions
      const fullMaterial = await courseService.getCourseById(material.id);
      setSelectedMaterial(fullMaterial);
      setCurrentView("material-detail");
    } catch (err) {
      setError("Gagal memuat detail course");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (question: Omit<Question, "id">) => {
    if (!selectedMaterial) return;

    try {
      setLoading(true);
      setError(null);
      const newQuestion = await courseService.addQuestion(
        selectedMaterial.id,
        question
      );

      const updatedMaterial: Material = {
        ...selectedMaterial,
        questions: [...selectedMaterial.questions, newQuestion],
      };

      setMaterials(
        materials.map((m) =>
          m.id === selectedMaterial.id ? updatedMaterial : m
        )
      );
      setSelectedMaterial(updatedMaterial);
    } catch (err) {
      setError("Gagal menambahkan question");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (
    questionId: string,
    question: Omit<Question, "id">
  ) => {
    if (!selectedMaterial) return;

    try {
      setLoading(true);
      setError(null);

      // Hit API untuk update question
      const updatedQuestion = await courseService.updateQuestion(
        selectedMaterial.id,
        questionId,
        question
      );

      // Update local state setelah API berhasil
      const updatedMaterial: Material = {
        ...selectedMaterial,
        questions: selectedMaterial.questions.map((q) =>
          q.id === questionId ? updatedQuestion : q
        ),
      };

      setMaterials(
        materials.map((m) =>
          m.id === selectedMaterial.id ? updatedMaterial : m
        )
      );
      setSelectedMaterial(updatedMaterial);
    } catch (err) {
      setError("Gagal mengupdate question");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedMaterial) return;

    try {
      setLoading(true);
      setError(null);
      await courseService.deleteQuestion(selectedMaterial.id, questionId);

      const updatedMaterial: Material = {
        ...selectedMaterial,
        questions: selectedMaterial.questions.filter(
          (q) => q.id !== questionId
        ),
      };

      setMaterials(
        materials.map((m) =>
          m.id === selectedMaterial.id ? updatedMaterial : m
        )
      );
      setSelectedMaterial(updatedMaterial);
    } catch (err) {
      setError("Gagal menghapus question");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPDF = (file: File) => {
    if (!selectedMaterial) return;

    // Create a fake URL for demo purposes (in real app, upload to server/cloud)
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedMaterial: Material = {
        ...selectedMaterial,
        pdfUrl: e.target?.result as string,
        pdfName: file.name,
      };

      setMaterials(
        materials.map((m) =>
          m.id === selectedMaterial.id ? updatedMaterial : m
        )
      );
      setSelectedMaterial(updatedMaterial);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePDF = () => {
    if (!selectedMaterial) return;

    const updatedMaterial: Material = {
      ...selectedMaterial,
      pdfUrl: undefined,
      pdfName: undefined,
    };

    setMaterials(
      materials.map((m) => (m.id === selectedMaterial.id ? updatedMaterial : m))
    );
    setSelectedMaterial(updatedMaterial);
  };

  const handleStartQuiz = () => {
    setCurrentView("quiz");
  };

  const handleBackFromMaterial = () => {
    setSelectedMaterial(null);
    setCurrentView("dashboard");
  };

  const handleBackFromQuiz = () => {
    setCurrentView("material-detail");
  };

  // Show error message if any
  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

  if (currentView === "login") {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === "quiz" && selectedMaterial) {
    return (
      <Quiz
        questions={selectedMaterial.questions}
        materialTitle={selectedMaterial.title}
        onBack={handleBackFromQuiz}
      />
    );
  }

  if (currentView === "material-detail" && selectedMaterial && currentUser) {
    return (
      <MaterialDetail
        material={selectedMaterial}
        userRole={currentUser}
        onBack={handleBackFromMaterial}
        onAddQuestion={handleAddQuestion}
        onUpdateQuestion={handleUpdateQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onStartQuiz={handleStartQuiz}
        onUploadPDF={handleUploadPDF}
        onDeletePDF={handleDeletePDF}
      />
    );
  }

  if (currentView === "dashboard" && currentUser) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (currentUser === "admin") {
      return (
        <AdminDashboard
          materials={materials}
          onAddMaterial={handleAddMaterial}
          onSelectMaterial={handleSelectMaterial}
          onDeleteMaterial={handleDeleteMaterial}
          onLogout={handleLogout}
        />
      );
    } else {
      return (
        <UserDashboard
          materials={materials}
          userRole={currentUser}
          onSelectMaterial={handleSelectMaterial}
          onLogout={handleLogout}
        />
      );
    }
  }

  return null;
}
