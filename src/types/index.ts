export type UserRole = 'admin' | 'user-verif' | 'user-biasa';

export interface User {
  role: UserRole;
  password: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: 'pilihan-ganda' | 'essay';
  question: string;
  options?: QuestionOption[]; // untuk pilihan ganda dengan ID
  correctAnswers: string[]; // array of option IDs untuk pilihan ganda, atau array dengan 1 text untuk essay
  explanation?: string;
}

export interface Material {
  id: string;
  title: string;
  questions: Question[];
  pdfUrl?: string;
  pdfName?: string;
  createdAt: number;
}

export interface QuizAnswer {
  questionId: string;
  answers: string[]; // array of option IDs atau text answers
  isCorrect?: boolean;
}