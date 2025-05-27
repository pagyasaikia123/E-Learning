import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import Lesson from "@/pages/lesson";
import InstructorDashboard from "@/pages/instructor-dashboard";
import LandingPage from "@/pages/LandingPage"; // Added
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

function Router() {
  return (
    <Switch>
      <Route path="/welcome" component={LandingPage} /> {/* Added */}
      <Route path="/" component={Dashboard} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/lessons/:id" component={Lesson} />
      <Route path="/instructor" component={InstructorDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
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
