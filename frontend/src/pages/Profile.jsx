import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Calendar, Ruler, Weight, Edit2, Save, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);

    // Fetch Profile
    const { data, isLoading, error } = useQuery({
        queryKey: ['profile', username],
        queryFn: async () => {
            const res = await api.get(`/users/${username}`);
            return res.data; // { user, gallery }
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('age', data.age);
            formData.append('height', data.height);
            formData.append('weight', data.weight);
            formData.append('bio', data.bio);
            
            if (avatarFile) {
                // Compress avatar if it exists
                let fileToUpload = avatarFile;
                if (avatarFile.size > 1 * 1024 * 1024) {
                    setIsCompressing(true);
                    try {
                        const options = {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1024,
                            useWebWorker: true,
                        };
                        fileToUpload = await imageCompression(avatarFile, options);
                    } catch (error) {
                        console.error("Avatar compression error:", error);
                    } finally {
                        setIsCompressing(false);
                    }
                }
                formData.append('avatar', fileToUpload);
            }

            const res = await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: () => {
            setIsEditing(false);
            setAvatarFile(null);
            setPreviewUrl(null);
            queryClient.invalidateQueries(['profile', username]);
            queryClient.invalidateQueries(['leaderboard']); 
        }
    });

    const onSubmit = (data) => {
        updateProfileMutation.mutate(data);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 10MB Limit for avatar selection (will be compressed)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Profile picture must be under 10MB");
                return;
            }
            if (file.size > 1 * 1024 * 1024) {
                toast.success("Image selected! It will be compressed before saving.");
            }
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading Profile...</div>;
    // Handle error differently to avoid flashing "User not found" on "me" redirect if not ready
    if (error) return <div className="p-8 text-center text-red-500">User not found</div>;

    const { user: profileUser, gallery } = data;
    // Check ownership. If username is "me", it's the current user.
    const isOwner = currentUser?.username === profileUser.username || username === 'me';

    return (
        <div className="space-y-8">
            {/* Header / Banner */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                <div className="relative z-10 group">
                    <img 
                        src={previewUrl || profileUser.avatar} 
                        alt={profileUser.username} 
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-2xl"
                    />
                     {isEditing && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <span className="text-white text-xs font-bold">Change</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    )}
                </div>
                
                <div className="flex-1 text-center md:text-left z-10 w-full">
                    <div className="flex justify-center md:justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{profileUser.username}</h1>
                            <p className="text-muted-foreground mt-1 max-w-md mx-auto md:mx-0">
                                {profileUser.bio || "No bio yet."}
                            </p>
                        </div>
                        {isOwner && !isEditing && (
                            <button 
                                onClick={() => {
                                    setIsEditing(true);
                                    reset(profileUser);
                                }}
                                className="absolute top-6 right-6 md:static p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <Edit2 size={20} className="text-primary" />
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-muted/30 p-3 rounded-lg text-center">
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Points</div>
                                <div className="text-2xl font-bold text-primary">{profileUser.totalPoints}</div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg text-center">
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Target</div>
                                <div className="text-xl font-semibold">{profileUser.targetWorkoutDaysPerWeek} <span className="text-xs">days/wk</span></div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg text-center">
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Age</div>
                                <div className="text-xl font-semibold">{profileUser.age || '-'}</div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg text-center">
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Stats</div>
                                <div className="text-sm font-medium">
                                    {profileUser.height ? `${profileUser.height}cm` : '-'} / {profileUser.weight ? `${profileUser.weight}kg` : '-'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-2 gap-4">
                            <input {...register('age')} placeholder="Age" className="bg-muted p-2 rounded border border-input" />
                            <input {...register('height')} placeholder="Height (cm)" className="bg-muted p-2 rounded border border-input" />
                            <input {...register('weight')} placeholder="Weight (kg)" className="bg-muted p-2 rounded border border-input" />
                            <textarea {...register('bio')} placeholder="Bio" className="bg-muted p-2 rounded border border-input h-10 resize-none" />
                             
                             <div className="col-span-2 flex gap-2 justify-end">
                                 <button type="button" onClick={() => { setIsEditing(false); setAvatarFile(null); setPreviewUrl(null); }} className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded">Cancel</button>
                                <button type="submit" disabled={updateProfileMutation.isPending || isCompressing} className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded disabled:opacity-50 flex items-center gap-2">
                                    {(updateProfileMutation.isPending || isCompressing) ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                            {isCompressing ? 'Compressing...' : 'Saving...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save
                                        </>
                                    )}
                                </button>
                             </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Gallery */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar size={20} /> workout Gallery ({gallery.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((item) => (
                         <div 
                            key={item._id} 
                            className="aspect-square bg-muted rounded-xl overflow-hidden relative group cursor-pointer"
                            onClick={() => setSelectedMedia(item)}
                         >
                            {item.mediaType === 'video' ? (
                                <video src={item.mediaUrl} className="w-full h-full object-cover" />
                            ) : (
                                <img src={item.mediaUrl} alt="Workout" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold bg-primary px-2 py-1 rounded">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                             <div className="absolute bottom-2 right-2">
                                {item.mediaType === 'video' && <div className="bg-black/50 p-1 rounded-full"><span className="text-xs text-white">Video</span></div>}
                             </div>
                         </div>
                    ))}
                    {gallery.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                            No uploads yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Media Viewer Modal */}
            {selectedMedia && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
                    onKeyDown={(e) => e.key === 'Escape' && setSelectedMedia(null)}
                >
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/95 backdrop-blur-md"
                        onClick={() => setSelectedMedia(null)}
                    />
                    
                    {/* Content Container */}
                    <div className="relative z-10 max-w-5xl w-full max-h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedMedia(null)}
                            className="absolute -top-12 right-0 md:-right-12 md:top-0 p-2 text-white/70 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 flex items-center justify-center bg-black/20">
                            {selectedMedia.mediaType === 'video' ? (
                                <video 
                                    src={selectedMedia.mediaUrl} 
                                    controls 
                                    autoPlay
                                    className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                                />
                            ) : (
                                <img 
                                    src={selectedMedia.mediaUrl} 
                                    alt="Workout enlarged" 
                                    className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                                />
                            )}
                        </div>

                        {/* Caption/Metadata */}
                        <div className="mt-4 text-center">
                            <p className="text-white/90 font-bold flex items-center gap-2 justify-center">
                                <Calendar size={16} className="text-primary" />
                                {new Date(selectedMedia.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            {selectedMedia.type && (
                                <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30 uppercase tracking-widest">
                                    {selectedMedia.type}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
