import { Home, Book, Search, Trophy, User, Presentation, BarChart3 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "My Courses", href: "/courses?enrolled=true", icon: Book },
  { name: "Browse Courses", href: "/courses", icon: Search },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
];

const instructorNavigation = [
  { name: "My Courses", href: "/instructor", icon: Presentation },
  { name: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0 fixed left-0 top-16 h-[calc(100vh-4rem)] z-40">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        <nav className="flex-1 pt-6 pb-4 overflow-y-auto">
          <div className="px-3">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a
                        className={cn(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-primary/10 border-r-2 border-primary text-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 h-5 w-5",
                            isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                          )}
                        />
                        {item.name}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Instructor Section */}
          <div className="mt-8 px-3">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Instructor
            </h3>
            <ul className="mt-2 space-y-1">
              {instructorNavigation.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a
                        className={cn(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-primary/10 border-r-2 border-primary text-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 h-5 w-5",
                            isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                          )}
                        />
                        {item.name}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
