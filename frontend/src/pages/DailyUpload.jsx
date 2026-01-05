import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { Upload, AlertCircle, CheckCircle, Video, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DailyUpload = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [preview, setPreview] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [serverError, setServerError] = useState('');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const uploadType = watch('type', 'Gym Goer');

    const uploadMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: () => {
             // Invalidate leaderboard and user profile queries to refresh points
            queryClient.invalidateQueries(['leaderboard']);
            queryClient.invalidateQueries(['profile']);
            navigate('/');
        },
        onError: (err) => {
            setServerError(err.response?.data?.error || 'Upload failed');
        }
    });

    const offDayMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/uploads/off-day');
            return res.data;
        },
        onSuccess: () => {
             alert('Off-day marked successfully!'); // Simple alert for now
             navigate('/');
        },
        onError: (err) => {
             setServerError(err.response?.data?.error || 'Failed to mark off-day');
        }
    });

    const onSubmit = (data) => {
        setServerError('');
        const formData = new FormData();
        formData.append('type', data.type);
        const file = data.media[0];
        formData.append('media', file);

        // Validation for "Home Workout" -> Video Only
        if (data.type === 'Home Workout') {
             if (!file.type.startsWith('video')) {
                 setServerError('Home Workouts must be a video submission.');
                 return;
             }
        }
        
        // Strict size validation
        const isVideo = file.type.startsWith('video');
        const limit = isVideo ? 10 * 1024 * 1024 : 1 * 1024 * 1024; // 10MB video, 1MB photo
        
        if (file.size > limit) {
             setServerError(`File too large. Max size: ${isVideo ? '10MB' : '1MB'}`);
             return;
        }

        uploadMutation.mutate(formData);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setServerError('');
        if (file) {
            const isVideo = file.type.startsWith('video');
            setFileType(isVideo ? 'video' : 'image');
            
            // Check limits immediately for better UX
            const limit = isVideo ? 10 * 1024 * 1024 : 1 * 1024 * 1024;
            if (file.size > limit) {
                setServerError(`File too large. Max size: ${isVideo ? '10MB' : '1MB'}`);
                setPreview(null);
                return;
            }

            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
            setFileType(null);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Upload /> Daily Upload
            </h1>

            <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Upload Type */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Workout Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="cursor-pointer">
                                <input 
                                    type="radio" 
                                    value="Gym Goer" 
                                    {...register('type')} 
                                    className="peer sr-only" 
                                />
                                <div className="text-center p-4 border border-border rounded-lg peer-checked:border-primary peer-checked:bg-primary/10 transition-all">
                                    <span className="font-bold block">Gym Goer</span>
                                    <span className="text-xs text-muted-foreground">Photo or Video</span>
                                </div>
                            </label>
                            
                            <label className="cursor-pointer">
                                <input 
                                    type="radio" 
                                    value="Home Workout" 
                                    {...register('type')}
                                    className="peer sr-only"
                                />
                                <div className="text-center p-4 border border-border rounded-lg peer-checked:border-primary peer-checked:bg-primary/10 transition-all">
                                    <span className="font-bold block">Home Workout</span>
                                    <span className="text-xs text-muted-foreground">Video ONLY</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Upload Proof</label>
                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                {...register('media', { required: 'Media file is required' })}
                                onChange={(e) => {
                                    register('media').onChange(e);
                                    handleFileChange(e);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            
                            {preview ? (
                                <div className="relative z-10">
                                    {fileType === 'video' ? (
                                        <video src={preview} controls className="max-h-64 mx-auto rounded-lg" />
                                    ) : (
                                        <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                                    )}
                                    <p className="text-sm mt-2 text-primary font-medium">Click to change file</p>
                                </div>
                            ) : (
                                <div className="text-muted-foreground z-10 pointer-events-none">
                                    <div className="flex justify-center gap-2 mb-2">
                                        <ImageIcon /> <Video />
                                    </div>
                                    <p>Click or drag to upload photo/video</p>
                                </div>
                            )}
                        </div>
                         {errors.media && <p className="text-red-500 text-xs mt-1">{errors.media.message}</p>}
                    </div>

                    {serverError && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {serverError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploadMutation.isPending}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {uploadMutation.isPending ? 'Uploading...' : 'Get My Points (+3)'}
                    </button>

                </form>
            </div>

            {/* Off Day Section */}
            <div className="text-center pt-8 border-t border-border">
                <h3 className="text-lg font-semibold mb-2">Need a rest day?</h3>
                <p className="text-sm text-muted-foreground mb-4">You can take 1 penalty-free off-day per week.</p>
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to use your weekly off-day?')) {
                            offDayMutation.mutate();
                        }
                    }}
                    disabled={offDayMutation.isPending}
                    className="px-6 py-2 border border-border hover:bg-muted rounded-lg text-sm font-medium transition-colors"
                >
                    Mark Today as Off-Day
                </button>
            </div>
        </div>
    );
};

export default DailyUpload;
