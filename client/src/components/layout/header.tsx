import { Search, GraduationCap, ChevronDown, LogIn, UserPlus, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext"; // Adjusted path
import { useLocation } from "wouter"; // For navigation
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-900">LearnHub</span>
            </div>
            <div>Loading user...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setLocation('/')}>
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-900">LearnHub</span>
            </div>
          </div>

          {/* Search Bar (visible only when logged in for this example) */}
          {user && (
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 w-full"
                />
              </div>
            </div>
          )}

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Search className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <Avatar className="h-8 w-8">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.firstName || 'User'} />}
                        <AvatarFallback>
                          {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                          {user.lastName ? user.lastName.charAt(0).toUpperCase() : ''}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setLocation('/')}>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/settings')}>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Help & Support</DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setLocation('/login')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button onClick={() => setLocation('/signup')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
