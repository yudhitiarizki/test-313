// ============================================================
// STRUKTUR FOLDER REACT
// ============================================================
/_
src/
├── services/
│ ├── api.ts
│ └── courseService.ts
├── components/
│ ├── Login.tsx
│ ├── AdminDashboard.tsx
│ ├── UserDashboard.tsx
│ ├── MaterialDetail.tsx
│ └── Quiz.tsx
├── types/
│ └── index.ts
├── App.tsx
└── main.tsx
_/

// ============================================================
// FILE: src/services/api.ts
// ============================================================
/\*
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
baseURL: API_BASE_URL,
headers: {
'Content-Type': 'application/json',
},
timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
(config) => {
// Bisa tambahkan token di sini jika ada autentikasi
// const token = localStorage.getItem('token');
// if (token) {
// config.headers.Authorization = `Bearer ${token}`;
// }
return config;
},
(error) => {
return Promise.reject(error);
}
);

// Response interceptor
api.interceptors.response.use(
(response) => {
return response;
},
(error) => {
// Handle error globally
if (error.response) {
// Server responded with error
console.error('API Error:', error.response.data);
} else if (error.request) {
// Request made but no response
console.error('Network Error:', error.message);
} else {
console.error('Error:', error.message);
}
return Promise.reject(error);
}
);

export default api;
\*/

// ============================================================
// FILE: src/services/courseService.ts
// ============================================================
/\*
import api from './api';
import { Material, Question } from '../types';

interface ApiResponse<T> {
success: boolean;
data: T;
message?: string;
}

interface CourseListItem {
id: string;
title: string;
questionCount: number;
createdAt: number;
}

interface CourseDetail {
id: string;
title: string;
questions: Question[];
createdAt: number;
}

export const courseService = {
// Get all courses
getAllCourses: async (): Promise<Material[]> => {
try {
const response = await api.get<ApiResponse<CourseListItem[]>>('/courses');

      // Convert API response to Material format
      return response.data.data.map(course => ({
        id: course.id,
        title: course.title,
        questions: [], // Questions will be loaded when needed
        createdAt: course.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }

},

// Get course detail by ID
getCourseById: async (id: string): Promise<Material> => {
try {
const response = await api.get<ApiResponse<CourseDetail>>(`/courses/${id}`);
return response.data.data;
} catch (error) {
console.error('Error fetching course detail:', error);
throw error;
}
},

// Create new course
createCourse: async (title: string): Promise<Material> => {
try {
const response = await api.post<ApiResponse<CourseDetail>>('/courses', {
title,
});
return response.data.data;
} catch (error) {
console.error('Error creating course:', error);
throw error;
}
},

// Update course title
updateCourse: async (id: string, title: string): Promise<Material> => {
try {
const response = await api.put<ApiResponse<CourseDetail>>(`/courses/${id}`, {
title,
});
return response.data.data;
} catch (error) {
console.error('Error updating course:', error);
throw error;
}
},

// Delete course
deleteCourse: async (id: string): Promise<void> => {
try {
await api.delete(`/courses/${id}`);
} catch (error) {
console.error('Error deleting course:', error);
throw error;
}
},

// Add question to course
addQuestion: async (
courseId: string,
question: Omit<Question, 'id'>
): Promise<Question> => {
try {
const response = await api.post<ApiResponse<Question>>(
`/courses/${courseId}/questions`,
question
);
return response.data.data;
} catch (error) {
console.error('Error adding question:', error);
throw error;
}
},

// Delete question
deleteQuestion: async (
courseId: string,
questionId: string
): Promise<void> => {
try {
await api.delete(`/courses/${courseId}/questions/${questionId}`);
} catch (error) {
console.error('Error deleting question:', error);
throw error;
}
},
};

export default courseService;
\*/

// ============================================================
// FILE: .env (Root project React)
// ============================================================
/_
VITE_API_BASE_URL=http://localhost:3000/api
_/

// ============================================================
// FILE: src/App.tsx (UPDATED)
// ============================================================
/\*
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
const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
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
      materials.map((m) =>
        m.id === selectedMaterial.id ? updatedMaterial : m
      )
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

if (
currentView === "material-detail" &&
selectedMaterial &&
currentUser
) {
return (
<MaterialDetail
        material={selectedMaterial}
        userRole={currentUser}
        onBack={handleBackFromMaterial}
        onAddQuestion={handleAddQuestion}
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
\*/

// ============================================================
// FILE: package.json (tambahkan dependency)
// ============================================================
/_
{
"dependencies": {
"react": "^18.2.0",
"react-dom": "^18.2.0",
"axios": "^1.6.2"
}
}
_/

// ============================================================
// SETUP CORS DI BACKEND (Update server.js)
// ============================================================
/\*
// Tambahkan ini di server.js backend
const cors = require('cors');

app.use(cors({
origin: 'http://localhost:5173', // Sesuaikan dengan port React dev server
credentials: true
}));
\*/
