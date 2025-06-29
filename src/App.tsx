
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ResearchPortal from "./pages/ResearchPortal";
import AiTutor from "./pages/AiTutor";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseUpload from "./pages/CourseUpload";
import CourseEditor from "./pages/CourseEditor";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import VirtualPatient from "./pages/VirtualPatient";
import Webinars from "./pages/Webinars";
import EhrIntegration from "./pages/EhrIntegration";
import CommunityForum from "./pages/CommunityForum";
import Bookmarks from "./pages/Bookmarks";
import Demo from "./pages/Demo";
import LecturePage from "./pages/LecturePage";
import QuizPage from "./pages/QuizPage";
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import "./App.css";

// Create a new QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/research-portal" element={<ResearchPortal />} />
            <Route path="/ai-tutor" element={<AiTutor />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses/:courseId/lecture/:lectureId" element={<LecturePage />} />
            <Route path="/course-upload" element={<CourseUpload />} />
            <Route path="/course-editor/:courseId" element={<CourseEditor />} />
            <Route path="/quiz/:quizId" element={<QuizPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/virtual-patient" element={<VirtualPatient />} />
            <Route path="/webinars" element={<Webinars />} />
            <Route path="/ehr-integration" element={<EhrIntegration />} />
            <Route path="/community" element={<CommunityForum />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <SonnerToaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
