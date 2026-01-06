import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Upload,
  Trophy,
  User,
  LogOut,
  Shield,
  Dumbbell,
  Zap,
} from "lucide-react";
import clsx from "clsx";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Leaderboard", path: "/", icon: Trophy },
    { name: "Daily Upload", path: "/upload", icon: Upload },
    { name: "Quests", path: "/quests", icon: LayoutDashboard },
    { name: "Profile", path: `/profile/me`, icon: User },
  ];

  if (user?.role === "admin") {
    navItems.push({ name: "Admin", path: "/admin", icon: Shield });
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 z-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Floating icons decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <Dumbbell
          className="absolute top-20 left-10 text-purple-500/10 w-12 h-12 animate-bounce"
          style={{ animationDuration: "3s" }}
        />
        <Trophy
          className="absolute top-40 right-20 text-pink-500/10 w-16 h-16 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        />
        <Zap
          className="absolute bottom-32 left-20 text-indigo-500/10 w-10 h-10 animate-bounce"
          style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden backdrop-blur-2xl bg-white/10 border-b border-white/20 p-4 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-xl font-black text-white tracking-tight">
            Fitness League
          </h1>
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut size={20} className="text-white" />
          </button>
        </header>

        {/* Sidebar */}
        <aside className="fixed bottom-0 left-0 w-full md:w-72 md:relative md:h-screen backdrop-blur-2xl bg-white/10 border-t md:border-r border-white/20 md:border-t-0 p-0 md:p-6 flex md:flex-col justify-between z-40">
          {/* Glow effect for sidebar */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-r-3xl blur-2xl opacity-30 pointer-events-none"></div>

          <div className="relative z-10 w-full">
            <div className="hidden md:block mb-8 pt-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">
                Fitness League
              </h1>
              {user && (
                <p className="text-sm text-purple-200/80 font-medium">
                  Welcome,{" "}
                  <span className="text-white font-bold">{user.username}</span>
                </p>
              )}
            </div>

            <nav className="flex md:flex-col justify-around md:justify-start w-full md:space-y-2 px-2 md:px-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" &&
                    location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={clsx(
                      "flex flex-col md:flex-row items-center md:space-x-3 p-3 md:px-4 md:py-3 rounded-xl transition-all relative group",
                      isActive
                        ? "text-white bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/50 font-bold shadow-lg shadow-purple-500/20"
                        : "text-purple-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
                    )}
                  >
                    <Icon
                      size={24}
                      className={clsx(
                        "md:w-5 md:h-5 transition-transform",
                        isActive
                          ? "text-white"
                          : "text-purple-300 group-hover:text-white"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-[10px] md:text-sm mt-1 md:mt-0 font-medium",
                        isActive
                          ? "text-white"
                          : "text-purple-200 group-hover:text-white"
                      )}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:block relative z-10 mt-auto pt-4">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to logout?")) {
                  logout();
                }
              }}
              className="flex items-center space-x-3 p-4 w-full text-purple-200 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/50 rounded-xl transition-all backdrop-blur-sm group"
            >
              <LogOut
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
