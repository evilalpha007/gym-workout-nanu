import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Dumbbell, Trophy, Zap, Target, User, Mail, Lock, Calendar, Ruler, Weight, FileText } from 'lucide-react';

const Signup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signup, isSigningUp } = useAuth();

    const onSubmit = (data) => {
        signup(data);
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-12">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
                </div>
            </div>

            {/* Floating icons decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <Trophy className="absolute top-20 left-10 text-purple-500/20 w-12 h-12 animate-bounce" style={{ animationDuration: '3s' }} />
                <Target className="absolute top-40 right-20 text-pink-500/20 w-16 h-16 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <Zap className="absolute bottom-32 left-20 text-indigo-500/20 w-10 h-10 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
                <Dumbbell className="absolute bottom-20 right-32 text-purple-500/20 w-14 h-14 animate-bounce" style={{ animationDuration: '4.5s' }} />
            </div>

            {/* Glassmorphism Signup Card */}
            <div className="relative w-full max-w-2xl z-10">
                {/* Glow effect behind card */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                
                <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                            JOIN THE LEAGUE
                        </h1>
                        <p className="text-purple-200 font-medium">Begin your champion journey today</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Username & Email Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-wide">
                                    <User className="w-4 h-4" />
                                    Username
                                </label>
                                <input
                                    {...register('username', { required: 'Username is required' })}
                                    className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3.5 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all"
                                    placeholder="Your fighter name"
                                />
                                {errors.username && <p className="text-pink-400 text-xs mt-2 font-semibold">{errors.username.message}</p>}
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-wide">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    {...register('email', { required: 'Email is required' })}
                                    className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3.5 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all"
                                    placeholder="your@email.com"
                                />
                                {errors.email && <p className="text-pink-400 text-xs mt-2 font-semibold">{errors.email.message}</p>}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-wide">
                                <Lock className="w-4 h-4" />
                                Password
                            </label>
                            <input
                                type="password"
                                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
                                className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3.5 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-pink-400 text-xs mt-2 font-semibold">{errors.password.message}</p>}
                        </div>

                        {/* Target Days & Age Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-wide">
                                    <Target className="w-4 h-4" />
                                    Days/Week
                                </label>
                                <input
                                    type="number"
                                    {...register('targetWorkoutDaysPerWeek', { required: true, min: 1, max: 7 })}
                                    className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3.5 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all"
                                    placeholder="1-7"
                                />
                                {errors.targetWorkoutDaysPerWeek && <p className="text-pink-400 text-xs mt-2 font-semibold">1-7 days required</p>}
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-wide">
                                    <Calendar className="w-4 h-4" />
                                    Age
                                </label>
                                <input
                                    type="number"
                                    {...register('age')}
                                    className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3.5 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all"
                                    placeholder="Your age"
                                />
                            </div>
                        </div>

                        {/* Height & Weight Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-wide">
                                    <Ruler className="w-4 h-4" />
                                    Height (cm)
                                </label>
                                <input
                                    type="number"
                                    {...register('height')}
                                    className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3.5 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all"
                                    placeholder="170"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-wide">
                                    <Weight className="w-4 h-4" />
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    {...register('weight')}
                                    className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3.5 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all"
                                    placeholder="70"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-wide">
                                <FileText className="w-4 h-4" />
                                Bio
                            </label>
                            <textarea
                                {...register('bio')}
                                className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl p-3.5 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all h-24 resize-none"
                                placeholder="Tell us about your fitness goals..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSigningUp}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 uppercase tracking-wide text-sm flex items-center justify-center gap-2 group"
                        >
                            {isSigningUp ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Creating Profile...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start Training</span>
                                    <Dumbbell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>
                        <p className="text-purple-200 text-sm">
                            Already in the league?{' '}
                            <Link to="/login" className="text-white hover:text-pink-300 font-black underline decoration-2 decoration-purple-500 hover:decoration-pink-500 transition-colors uppercase tracking-wide">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;