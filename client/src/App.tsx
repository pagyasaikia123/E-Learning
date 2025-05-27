import { Switch, Route } from "wouter";
import ProtectedRoute from "@/components/ProtectedRoute"; // Added
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// AuthProvider is now in main.tsx
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import Lesson from "@/pages/lesson";
import InstructorDashboard from "@/pages/instructor-dashboard";
import CourseContentPage from "@/pages/CourseContentPage"; // Added
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage"; // Added
import SignupPage from "@/pages/SignupPage"; // Added
import VerifyEmailPage from "@/pages/VerifyEmailPage"; // Added
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/courses" component={Courses} />
      <ProtectedRoute path="/courses/:id" component={CourseDetail} />
      <ProtectedRoute path="/lessons/:id" component={Lesson} />
      <ProtectedRoute path="/instructor" component={InstructorDashboard} />
      <ProtectedRoute path="/instructor/courses/:courseId/content" component={CourseContentPage} /> {/* Added */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    // AuthProvider is now in main.tsx
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 lg:ml-64">
              <div className="mobile-nav-padding">
                <Router />
              </div>
            </main>
          </div>
          <MobileNav />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
