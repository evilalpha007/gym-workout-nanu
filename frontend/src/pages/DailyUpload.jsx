import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Video,
  Image as ImageIcon,
  Trophy,
  Home,
  Building2,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";

const DailyUpload = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [serverError, setServerError] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [showOffDayModal, setShowOffDayModal] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch user profile to check upload status
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await api.get('/users/profile/me');
      return res.data;
    }
  });

  // Check if user has already uploaded today
  const hasUploadedToday = () => {
    if (!userProfile?.user?.lastDailyUploadDate) return false;
    const lastUpload = new Date(userProfile.user.lastDailyUploadDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastUpload.setHours(0, 0, 0, 0);
    return lastUpload.getTime() >= today.getTime();
  };

  // Check if today is marked as off-day
  const isOffDayToday = () => {
    if (!userProfile?.user?.lastOffDayDate) return false;
    const lastOffDay = new Date(userProfile.user.lastOffDayDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastOffDay.setHours(0, 0, 0, 0);
    return lastOffDay.getTime() >= today.getTime();
  };

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate leaderboard and user profile queries to refresh points
      queryClient.invalidateQueries(["leaderboard"]);
      queryClient.invalidateQueries(["profile"]);
      navigate("/");
    },
    onError: (err) => {
      setServerError(
        err.response?.data?.error || "Upload failed. Please try again."
      );
    },
  });

  const offDayMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/uploads/off-day");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Off-day marked successfully! 😴");
      queryClient.invalidateQueries(["profile"]);
      navigate("/");
    },
    onError: (err) => {
      setServerError(err.response?.data?.error || "Failed to mark off-day");
    },
  });

  // Compress image before upload
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 2, // 2MB target
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Image compression error:", error);
      // If compression fails, return original file
      return file;
    }
  };

  const onSubmit = async (data) => {
    setServerError("");

    if (!data.media || !data.media[0]) {
      setServerError("Please select a file to upload");
      return;
    }

    const file = data.media[0];
    const isVideo = file.type.startsWith("video");

    // Validation for "Home Workout" -> Video Only
    if (data.type === "Home Workout" && !isVideo) {
      setServerError("Home Workouts must be a video submission.");
      return;
    }

    // Size validation
    const videoLimit = 10 * 1024 * 1024; // 10MB
    const imageLimit = 2 * 1024 * 1024; // 2MB

    if (isVideo && file.size > videoLimit) {
      setServerError("Video file too large. Max size: 10MB");
      return;
    }

    if (!isVideo && file.size > imageLimit * 1.5) {
      setServerError(
        "Image file too large. Max size: 2MB (will be compressed)"
      );
      return;
    }

    setIsCompressing(true);
    const formData = new FormData();
    formData.append("type", data.type);

    try {
      let fileToUpload = file;

      // Compress image if it's an image
      if (!isVideo) {
        fileToUpload = await compressImage(file);
      }

      formData.append("media", fileToUpload);
      uploadMutation.mutate(formData);
    } catch (error) {
      setServerError("Error processing file. Please try again.");
      console.error("File processing error:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setServerError("");
    setOriginalFile(file);

    if (file) {
      const isVideo = file.type.startsWith("video");
      setFileType(isVideo ? "video" : "image");

      // Check limits immediately for better UX
      const videoLimit = 10 * 1024 * 1024; // 10MB
      const imageLimit = 2 * 1024 * 1024; // 2MB

      if (isVideo && file.size > videoLimit) {
        setServerError(`Video file too large. Max size: 10MB`);
        setPreview(null);
        return;
      }

      if (!isVideo && file.size > imageLimit * 1.5) {
        setServerError(
          `Image file too large. Max size: 2MB (will be compressed)`
        );
        setPreview(null);
        return;
      }

      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
      setFileType(null);
      setOriginalFile(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8">
      {/* Glassmorphism Upload Card */}
      <div className="relative w-full max-w-2xl z-10">
        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>

        <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              DAILY UPLOAD
            </h1>
            <p className="text-purple-200 font-medium">
              Share your workout and earn points
            </p>
          </div>

          {/* Loading State */}
          {profileLoading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-200">Checking upload status...</p>
            </div>
          )}

          {/* Already Uploaded Today Message */}
          {!profileLoading && hasUploadedToday() && (
            <div className="text-center py-8 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4 border-4 border-green-500/30">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">All Done for Today! 🎉</h2>
                <p className="text-purple-200 mb-4">You've already uploaded your workout today.</p>
                <p className="text-sm text-purple-300/70">Come back tomorrow to earn more points!</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
              >
                Back to Home
              </button>
            </div>
          )}

          {/* Off-Day Message */}
          {!profileLoading && !hasUploadedToday() && isOffDayToday() && (
            <div className="text-center py-8 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4 border-4 border-blue-500/30">
                <Calendar className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Rest Day 😴</h2>
                <p className="text-purple-200 mb-4">You've marked today as your off-day.</p>
                <p className="text-sm text-purple-300/70">Enjoy your rest! See you tomorrow 💪</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
              >
                Back to Home
              </button>
            </div>
          )}

          {/* Upload Form - Only show if not uploaded and not off-day */}
          {!profileLoading && !hasUploadedToday() && !isOffDayToday() && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Upload Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wide">
                <Trophy className="w-4 h-4" />
                Workout Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    value="Gym Goer"
                    {...register("type", { required: true })}
                    className="peer sr-only"
                  />
                  <div className="text-center p-5 border-[3px] border-white/30 rounded-xl peer-checked:border-purple-400 peer-checked:bg-purple-500/30 peer-checked:shadow-lg peer-checked:shadow-purple-500/50 transition-all duration-300 bg-white/10 backdrop-blur-sm hover:border-white/50 hover:bg-white/15">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-white/60 peer-checked:group-[]:text-purple-300 peer-checked:group-[]:scale-110 transition-all duration-300" />
                    <span className="font-bold block text-white/80 peer-checked:group-[]:text-white text-base">Gym Goer</span>
                    <span className="text-xs text-purple-200/60 peer-checked:group-[]:text-purple-200 mt-1 block">
                      Photo or Video
                    </span>
                  </div>
                </label>

                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    value="Home Workout"
                    {...register("type", { required: true })}
                    className="peer sr-only"
                  />
                  <div className="text-center p-5 border-[3px] border-white/30 rounded-xl peer-checked:border-purple-400 peer-checked:bg-purple-500/30 peer-checked:shadow-lg peer-checked:shadow-purple-500/50 transition-all duration-300 bg-white/10 backdrop-blur-sm hover:border-white/50 hover:bg-white/15">
                    <Home className="w-8 h-8 mx-auto mb-2 text-white/60 peer-checked:group-[]:text-purple-300 peer-checked:group-[]:scale-110 transition-all duration-300" />
                    <span className="font-bold block text-white/80 peer-checked:group-[]:text-white text-base">
                      Home Workout
                    </span>
                    <span className="text-xs text-purple-200/60 peer-checked:group-[]:text-purple-200 mt-1 block">
                      Video ONLY
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wide">
                <Upload className="w-4 h-4" />
                Upload Proof
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors relative bg-white/5 backdrop-blur-sm">
                <input
                  type="file"
                  accept="image/*,video/*"
                  {...register("media", { required: "Media file is required" })}
                  onChange={(e) => {
                    register("media").onChange(e);
                    handleFileChange(e);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />

                {preview ? (
                  <div className="relative z-10">
                    {fileType === "video" ? (
                      <video
                        src={preview}
                        controls
                        className="max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                    )}
                    <p className="text-sm mt-3 text-purple-200 font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Click to change file
                    </p>
                    {originalFile && !fileType && (
                      <p className="text-xs mt-1 text-purple-300/70">
                        Size: {(originalFile.size / 1024 / 1024).toFixed(2)}MB
                        {!fileType && " (will be compressed)"}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-purple-200 z-10 pointer-events-none">
                    <div className="flex justify-center gap-4 mb-3">
                      <ImageIcon className="w-8 h-8 text-purple-300/70" />
                      <Video className="w-8 h-8 text-purple-300/70" />
                    </div>
                    <p className="font-medium">Click or drag to upload</p>
                    <p className="text-xs mt-2 text-purple-200/70">
                      Images: Max 2MB | Videos: Max 10MB
                    </p>
                  </div>
                )}
              </div>
              {errors.media && (
                <p className="text-pink-400 text-xs mt-2 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.media.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploadMutation.isPending || isCompressing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 uppercase tracking-wide text-sm flex items-center justify-center gap-2 group"
            >
              {isCompressing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Compressing...</span>
                </>
              ) : uploadMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>Get My Points (+3)</span>
                  <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>
          )}

          {/* Off Day Section - Only show if not uploaded and not off-day */}
          {!profileLoading && !hasUploadedToday() && !isOffDayToday() && (
          <div className="mt-8 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-xl mb-3">
                <Calendar className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Need a rest day?
              </h3>
              <p className="text-sm text-purple-200/70 mb-4">
                You can take 1 penalty-free off-day per week.
              </p>
              <button
                onClick={() => setShowOffDayModal(true)}
                disabled={offDayMutation.isPending}
                className="px-6 py-2.5 border-2 border-white/20 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all backdrop-blur-sm disabled:opacity-50"
              >
                {offDayMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  "Mark Today as Off-Day"
                )}
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Off-Day Confirmation Modal */}
      {showOffDayModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="relative w-full max-w-md">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
            
            {/* Modal content */}
            <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black text-white text-center mb-3">
                Take a Rest Day?
              </h2>

              {/* Description */}
              <p className="text-purple-200 text-center mb-8 text-sm">
                Are you sure you want to use your weekly off-day? You get 1 penalty-free rest day per week.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOffDayModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowOffDayModal(false);
                    offDayMutation.mutate();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
                >
                  Yes, Rest! 😴
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyUpload;
