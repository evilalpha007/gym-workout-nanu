import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Upload, Trophy, User, LogOut, Shield } from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Leaderboard', path: '/', icon: Trophy },
        { name: 'Daily Upload', path: '/upload', icon: Upload },
        { name: 'Quests', path: '/quests', icon: LayoutDashboard },
        { name: 'Profile', path: `/profile/me`, icon: User }, // Or just /profile and redirect
    ];

    if (user?.role === 'admin') {
        navItems.push({ name: 'Admin', path: '/admin', icon: Shield });
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden border-b border-border p-4 flex justify-between items-center bg-card sticky top-0 z-50">
                <h1 className="text-xl font-bold text-primary">Fitness League</h1>
                <button onClick={() => logout()} className="p-2">
                    <LogOut size={20} />
                </button>
            </header>

            {/* Sidebar / Bottom Nav */}
            <aside className="fixed bottom-0 left-0 w-full md:w-64 md:relative md:h-screen bg-card border-t md:border-r border-border md:border-t-0 p-0 md:p-6 flex md:flex-col justify-between z-40">
                <div>
                    <div className="hidden md:block mb-8">
                        <h1 className="text-2xl font-bold text-primary tracking-tight">Fitness League</h1>
                        {user && <p className="text-sm text-muted-foreground mt-2">Welcome, {user.username}</p>}
                    </div>
                    
                    <nav className="flex md:flex-col justify-around md:justify-start w-full md:space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={clsx(
                                        "flex flex-col md:flex-row items-center md:space-x-3 p-3 md:px-4 md:py-3 rounded-xl transition-all",
                                        isActive 
                                            ? "text-primary bg-primary/10 font-medium" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Icon size={24} className="md:w-5 md:h-5" />
                                    <span className="text-[10px] md:text-base mt-1 md:mt-0">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="hidden md:block">
                     <button 
                        onClick={() => logout()} 
                        className="flex items-center space-x-3 p-4 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0">
                <div className="max-w-4xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
