import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Trophy, Medal } from 'lucide-react';

const Leaderboard = () => {
    const { data: users, isLoading, error } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const res = await api.get('/users/leaderboard');
            return res.data;
        }
    });

    if (isLoading) return <div className="text-center p-8">Loading Leaderboard...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Failed to load leaderboard</div>;

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="text-yellow-400 w-6 h-6" />;
        if (index === 1) return <Medal className="text-gray-400 w-6 h-6" />;
        if (index === 2) return <Medal className="text-amber-600 w-6 h-6" />; // Bronze color approx
        return <span className="text-muted-foreground font-bold w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Trophy className="text-primary" /> Global Leaderboard
            </h1>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-semibold text-muted-foreground w-16 text-center">Rank</th>
                                <th className="p-4 font-semibold text-muted-foreground">User</th>
                                <th className="p-4 font-semibold text-muted-foreground text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user._id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                                    <td className="p-4 flex justify-center items-center">
                                        {getRankIcon(index)}
                                    </td>
                                    <td className="p-4">
                                        <Link to={`/profile/${user.username}`} className="flex items-center gap-3 group">
                                            <img 
                                                src={user.avatar} 
                                                alt={user.username} 
                                                className="w-10 h-10 rounded-full object-cover border border-border group-hover:border-primary transition-all"
                                            />
                                            <span className="font-medium group-hover:text-primary transition-colors">
                                                {user.username}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="p-4 text-right font-bold text-lg">
                                        {user.totalPoints}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">No users yet. Be the first to join!</div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
