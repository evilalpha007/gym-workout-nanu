import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

const Quests = () => {
    const { data: quests, isLoading } = useQuery({
        queryKey: ['quests'],
        queryFn: async () => {
            const res = await api.get('/quests');
            return res.data;
        }
    });

    const [selectedQuest, setSelectedQuest] = useState(null);
    const [file, setFile] = useState(null);
    const queryClient = useQueryClient();

    const submitMutation = useMutation({
        mutationFn: async ({ questId, formData }) => {
            const res = await api.post(`/quests/${questId}/submit`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: () => {
             setSelectedQuest(null);
             setFile(null);
             alert('Quest Submitted! Admin will review it.');
        },
        onError: (err) => {
            alert(err.response?.data?.error || 'Submission failed');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file || !selectedQuest) return;
        const formData = new FormData();
        formData.append('media', file);
        submitMutation.mutate({ questId: selectedQuest._id, formData });
    }

    if (isLoading) return <div className="p-8 text-center">Loading Quests...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Shield /> Weekly Quests
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quests.map(quest => {
                    const isActive = new Date() >= new Date(quest.startDate) && new Date() <= new Date(quest.endDate);
                    return (
                        <div key={quest._id} className="bg-card border border-border rounded-xl p-6 shadow-lg flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold">{quest.title}</h3>
                                {isActive ? (
                                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-bold">Active</span>
                                ) : (
                                    <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full font-bold">Closed</span>
                                )}
                            </div>
                            
                            <p className="text-muted-foreground mb-6 flex-1">{quest.description}</p>
                            
                            <div className="text-xs text-muted-foreground mb-4">
                                <Clock size={14} className="inline mr-1" />
                                Ends: {new Date(quest.endDate).toLocaleDateString()}
                            </div>

                            {isActive && (
                                <button 
                                    onClick={() => setSelectedQuest(quest)}
                                    className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-colors"
                                >
                                    Submit Entry
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Submission Modal (Simplified directly in-render for speed) */}
            {selectedQuest && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-card w-full max-w-md p-6 rounded-2xl border border-border">
                        <h2 className="text-xl font-bold mb-4">Submit for: {selectedQuest.title}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                type="file" 
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full text-sm text-muted-foreground "
                                required
                            />
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setSelectedQuest(null)} className="px-4 py-2 rounded bg-muted hover:bg-muted/80">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={submitMutation.isPending}
                                    className="px-4 py-2 rounded bg-primary text-primary-foreground font-bold"
                                >
                                    {submitMutation.isPending ? 'Uploading...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quests;
