import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';

import ProfilePage from '../pages/ProfilePage';
import DashboardPage from '../pages/DashboardPage';

// Document Pages
import DocumentLibraryPage from '../pages/documents/DocumentLibraryPage';
import UploadPage from '../pages/documents/UploadPage';
import DocumentDetailsPage from '../pages/documents/DocumentDetailsPage';

// AI Pages
import AIChatPage from '../pages/chat/AIChatPage';
import TutorChat from '../pages/TutorChat';

// Quiz Pages
import QuizListPage from '../pages/quizzes/QuizListPage';
import QuizTakePage from '../pages/quizzes/QuizTakePage';
import QuizResultPage from '../pages/quizzes/QuizResultPage';

// Flashcard Pages
import FlashcardListPage from '../pages/flashcards/FlashcardListPage';
import FlashcardStudyPage from '../pages/flashcards/FlashcardStudyPage';

// Study Plan Pages
import StudyPlanListPage from '../pages/study-plans/StudyPlanListPage';
import StudyPlanViewPage from '../pages/study-plans/StudyPlanViewPage';

// Coding Coach
import CodingCoachPage from '../pages/CodingCoachPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout><Outlet /></AuthLayout>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/documents" element={<DocumentLibraryPage />} />
          <Route path="/documents/upload" element={<UploadPage />} />
          <Route path="/documents/:id" element={<DocumentDetailsPage />} />
          <Route path="/chat" element={<AIChatPage />} />
          <Route path="/tutor" element={<TutorChat />} />
          <Route path="/quizzes" element={<QuizListPage />} />
          <Route path="/quizzes/:id" element={<QuizTakePage />} />
          <Route path="/quizzes/:id/result" element={<QuizResultPage />} />
          <Route path="/flashcards" element={<FlashcardListPage />} />
          <Route path="/flashcards/:id" element={<FlashcardStudyPage />} />
          <Route path="/study-plans" element={<StudyPlanListPage />} />
          <Route path="/study-plans/:id" element={<StudyPlanViewPage />} />
          <Route path="/coding-coach" element={<CodingCoachPage />} />
        </Route>
      </Route>



      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
