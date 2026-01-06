import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Shield, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Quests = () => {
    const { data: quests, isLoading } = useQuery({
        queryKey: ['quests'],
        queryFn: async () => {
            const res = await api.get('/quests');
            return res.data;
        }
    });

    // Fetch user's quest submissions
    const { data: mySubmissions = [] } = useQuery({
        queryKey: ['my-submissions'],
        queryFn: async () => {
            const res = await api.get('/quests/my-submissions');
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
             queryClient.invalidateQueries(['my-submissions']);
             toast.success('Quest Submitted! Admin will review it. 🎯');
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Submission failed');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file || !selectedQuest) return;
        const formData = new FormData();
        formData.append('media', file);
        submitMutation.mutate({ questId: selectedQuest._id, formData });
    }

    // Helper function to get submission status for a quest
    const getSubmissionStatus = (questId) => {
        return mySubmissions.find(sub => sub.questId?._id === questId);
    };

    if (isLoading) return <div className="p-8 text-center text-white">Loading Quests...</div>;

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-4xl font-black text-white flex items-center gap-3">
                <Shield className="w-10 h-10 text-purple-400" /> Weekly Quests
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quests?.map(quest => {
                    const isActive = new Date() >= new Date(quest.startDate) && new Date() <= new Date(quest.endDate);
                    const submission = getSubmissionStatus(quest._id);
                    const hasSubmitted = !!submission;
                    
                    return (
                        <div key={quest._id} className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col">
                            {/* Status Badge - Top Right */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white pr-2">{quest.title}</h3>
                                <div className="flex flex-col gap-2 items-end">
                                    {isActive ? (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold border border-green-500/30">✓ Active</span>
                                    ) : (
                                        <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold border border-red-500/30">✕ Closed</span>
                                    )}
                                    
                                    {/* Submission Status Badge */}
                                    {hasSubmitted && (
                                        <>
                                            {submission.status === 'completed' && (
                                                <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-bold border border-purple-500/30 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Completed (+{submission.pointsAwarded})
                                                </span>
                                            )}
                                            {submission.status === 'pending' && (
                                                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full font-bold border border-yellow-500/30 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Pending Review
                                                </span>
                                            )}
                                            {submission.status === 'failed' && (
                                                <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full font-bold border border-red-500/30 flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> Failed ({submission.pointsAwarded})
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <p className="text-purple-200/80 mb-6 flex-1 text-sm">{quest.description}</p>
                            
                            <div className="text-xs text-purple-300/70 mb-4 flex items-center gap-1">
                                <Clock size={14} />
                                Ends: {new Date(quest.endDate).toLocaleDateString()}
                            </div>

                            {isActive && !hasSubmitted && (
                                <button 
                                    onClick={() => setSelectedQuest(quest)}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
                                >
                                    Submit Entry
                                </button>
                            )}
                            
                            {isActive && hasSubmitted && (
                                <button 
                                    disabled
                                    className="w-full py-3 bg-white/5 text-white/40 font-bold rounded-xl cursor-not-allowed border border-white/10"
                                >
                                    Already Submitted
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Submission Modal */}
            {selectedQuest && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 w-full max-w-md p-8 rounded-3xl shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 -z-10"></div>
                        
                        <h2 className="text-2xl font-black text-white mb-2">Submit Quest Entry</h2>
                        <p className="text-purple-200 mb-6 text-sm">{selectedQuest.title}</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors bg-white/5">
                                <input 
                                    type="file" 
                                    accept="image/*,video/*"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="w-full text-sm text-purple-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500/20 file:text-purple-300 file:font-semibold hover:file:bg-purple-500/30 cursor-pointer"
                                    required
                                />
                                {file && (
                                    <p className="text-xs text-purple-300 mt-3 flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {file.name}
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex gap-3 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setSelectedQuest(null);
                                        setFile(null);
                                    }} 
                                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/20"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitMutation.isPending || !file}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitMutation.isPending ? 'Uploading...' : 'Submit Quest'}
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
