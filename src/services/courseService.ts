import api from "./api";
import { Material, Question } from "../types";

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
  questionCount: number;
  createdAt: number;
}

export const courseService = {
  // Get all courses
  getAllCourses: async (): Promise<Material[]> => {
    try {
      const response = await api.get<ApiResponse<CourseListItem[]>>("/courses");

      const data = response.data.data.map((course) => ({
        id: course.id,
        title: course.title,
        questionCount: course.questionCount,
        questions: [], // Questions will be loaded when needed
        createdAt: course.createdAt,
      }));
      console.log("Fetched courses:", data);
      // Convert API response to Material format
      return data;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  // Get course detail by ID
  getCourseById: async (id: string): Promise<Material> => {
    try {
      const response = await api.get<ApiResponse<CourseDetail>>(
        `/courses/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching course detail:", error);
      throw error;
    }
  },

  // Create new course
  createCourse: async (title: string): Promise<Material> => {
    try {
      const response = await api.post<ApiResponse<CourseDetail>>("/courses", {
        title,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  // Update course title
  updateCourse: async (id: string, title: string): Promise<Material> => {
    try {
      const response = await api.put<ApiResponse<CourseDetail>>(
        `/courses/${id}`,
        {
          title,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (id: string): Promise<void> => {
    try {
      await api.delete(`/courses/${id}`);
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },

  // Add question to course
  addQuestion: async (
    courseId: string,
    question: Omit<Question, "id">
  ): Promise<Question> => {
    try {
      const response = await api.post<ApiResponse<Question>>(
        `/courses/${courseId}/questions`,
        question
      );
      return response.data.data;
    } catch (error) {
      console.error("Error adding question:", error);
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
      console.error("Error deleting question:", error);
      throw error;
    }
  },

  // Update question
  updateQuestion: async (
    courseId: string,
    questionId: string,
    question: Omit<Question, "id">
  ): Promise<Question> => {
    try {
      const response = await api.put<ApiResponse<Question>>(
        `/courses/${courseId}/questions/${questionId}`,
        question
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  },
};

export default courseService;
