import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { Trash2, User, Shield, Check, X, FileText, Plus } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const queryClient = useQueryClient();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Shield /> Admin Dashboard
            </h1>

            <div className="flex space-x-2 border-b border-border">
                {['users', 'create-quest', 'submissions'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium capitalize transition-colors ${
                            activeTab === tab 
                                ? 'text-primary border-b-2 border-primary' 
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            <div className="pt-4">
                {activeTab === 'users' && <UsersTab />}
                {activeTab === 'create-quest' && <CreateQuestTab />}
                {activeTab === 'submissions' && <SubmissionsTab />}
            </div>
        </div>
    );
};

// --- Sub-components ---

const UsersTab = () => {
    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await api.get('/users'); // Private/Admin endpoint
            return res.data;
        }
    });

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (id) => await api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
        }
    });

    if (isLoading) return <div>Loading Users...</div>;

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Points</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map(user => (
                        <tr key={user._id} className="border-t border-border">
                            <td className="p-4 font-medium">{user.username}</td>
                            <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-4">{user.totalPoints}</td>
                            <td className="p-4 text-right">
                                {user.role !== 'admin' && (
                                    <button 
                                        onClick={() => {
                                             if(confirm('Delete user?')) deleteMutation.mutate(user._id);
                                        }}
                                        className="text-red-500 hover:bg-red-500/10 p-2 rounded"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const CreateQuestTab = () => {
    const { register, handleSubmit, reset } = useForm();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data) => await api.post('/quests', data),
        onSuccess: () => {
            alert('Quest Created!');
            reset();
            queryClient.invalidateQueries(['quests']); // update public quest list if viewed
        }
    });

    return (
        <div className="max-w-xl bg-card p-6 rounded-xl border border-border">
            <h2 className="text-xl font-bold mb-4">Create Weekly Quest</h2>
            <form onSubmit={handleSubmit(createMutation.mutate)} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input {...register('title', { required: true })} className="w-full bg-muted p-2 rounded border border-input" />
                </div>
                <div>
                    <label className="block text-sm mb-1">Description</label>
                    <textarea {...register('description', { required: true })} className="w-full bg-muted p-2 rounded border border-input h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">Start Date</label>
                         <input type="date" {...register('startDate', { required: true })} className="w-full bg-muted p-2 rounded border border-input" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">End Date</label>
                         <input type="date" {...register('endDate', { required: true })} className="w-full bg-muted p-2 rounded border border-input" />
                    </div>
                </div>
                <button className="w-full py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90">Create Quest</button>
            </form>
        </div>
    );
};

const SubmissionsTab = () => {
    // Ideally we list quests first, then submissions. Simplified: List active quest submissions?
    // Let's Fetch all quests, then select one to view submissions.
    const [selectedQuestId, setSelectedQuestId] = useState(null);
    const { data: quests } = useQuery({
        queryKey: ['quests'],
        queryFn: async () => (await api.get('/quests')).data
    });

    return (
        <div>
            {!selectedQuestId ? (
                <div className="grid gap-4">
                    <h3 className="font-bold mb-2">Select Quest to View Submissions</h3>
                    {quests?.map(q => (
                        <button 
                             key={q._id} 
                             onClick={() => setSelectedQuestId(q._id)}
                             className="text-left p-4 bg-card border border-border rounded hover:bg-muted"
                        >
                            <div className="font-bold">{q.title}</div>
                            <div className="text-sm text-muted-foreground">{new Date(q.startDate).toLocaleDateString()} - {new Date(q.endDate).toLocaleDateString()}</div>
                        </button>
                    ))}
                </div>
            ) : (
                <div>
                    <button onClick={() => setSelectedQuestId(null)} className="mb-4 text-sm text-muted-foreground hover:text-foreground">← Back to Quests</button>
                    <QuestSubmissionsList questId={selectedQuestId} />
                </div>
            )}
        </div>
    );
};

const QuestSubmissionsList = ({ questId }) => {
    const { data: submissions, isLoading } = useQuery({
        queryKey: ['quest-submissions', questId],
        queryFn: async () => (await api.get(`/quests/${questId}/submissions`)).data
    });
    
    const queryClient = useQueryClient();

    const evaluateMutation = useMutation({
        mutationFn: async ({ id, status }) => await api.put(`/quests/submissions/${id}/evaluate`, { status }),
        onSuccess: () => queryClient.invalidateQueries(['quest-submissions', questId])
    });

    if (isLoading) return <div>Loading Submissions...</div>;

    return (
        <div className="space-y-4">
            {submissions?.length === 0 && <div>No submissions yet.</div>}
            {submissions?.map(sub => (
                <div key={sub._id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4">
                    {/* Media */}
                    <div className="w-full md:w-48 aspect-video bg-black rounded overflow-hidden">
                        {sub.mediaType === 'video' ? (
                            <video src={sub.mediaUrl} controls className="w-full h-full object-contain" />
                        ) : (
                            <img src={sub.mediaUrl} className="w-full h-full object-cover" />
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-lg">{sub.userId?.username}</div>
                                <div className="text-xs text-muted-foreground">Submitted: {new Date(sub.createdAt).toLocaleString()}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                sub.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                sub.status === 'failed' ? 'bg-red-500/20 text-red-500' : 
                                'bg-yellow-500/20 text-yellow-500'
                            }`}>
                                {sub.status}
                            </div>
                        </div>

                        {sub.status === 'pending' && (
                            <div className="mt-4 flex gap-3">
                                <button 
                                    onClick={() => evaluateMutation.mutate({ id: sub._id, status: 'completed' })}
                                    className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                                >
                                    <Check size={16} /> Approve (+5)
                                </button>
                                <button 
                                    onClick={() => evaluateMutation.mutate({ id: sub._id, status: 'failed' })}
                                    className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                                >
                                    <X size={16} /> Reject (-3)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminDashboard;
