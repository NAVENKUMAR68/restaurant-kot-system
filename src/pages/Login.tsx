import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/utils/api'
import { AlertCircle, Eye, EyeOff, Zap, Lock, Mail } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { login } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/auth/login', { email, password })
            login(res.data.user, res.data.token)
            if (res.data.user.role === 'admin') navigate('/admin')
            else if (res.data.user.role === 'kitchen') navigate('/kitchen')
            else navigate('/customer')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040810] p-4">
            {/* Animated background orbs */}
            <div className="orb w-[500px] h-[500px] bg-cyan-500/10 -top-40 -left-40" style={{ animationDelay: '0s' }} />
            <div className="orb w-[400px] h-[400px] bg-violet-500/10 bottom-0 right-0" style={{ animationDelay: '3s' }} />
            <div className="orb w-[300px] h-[300px] bg-cyan-400/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '1.5s' }} />

            {/* Grid overlay */}
            <div className="absolute inset-0 grid-bg opacity-40" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md animate-slide-up">
                {/* Glow ring behind card */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 blur-xl" />

                <div className="relative glass-card rounded-2xl p-6 sm:p-8">
                    {/* Logo */}
                    <div className="mb-6 sm:mb-8 flex flex-col items-center gap-3">
                        <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 animate-glow-pulse">
                            <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-400" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl sm:text-2xl font-bold">
                                <span className="neon-text-cyan">Smart</span>
                                <span className="text-white"> KOT</span>
                            </h1>
                            <p className="text-[10px] sm:text-sm text-white/40 mt-1 uppercase tracking-widest font-medium">Kitchen Order Ticket System</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-white">Welcome back</h2>
                        <p className="text-[12px] sm:text-sm text-white/40 mt-0.5">Sign in to continue to your dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type="email"
                                    placeholder="name@restaurant.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input-futuristic w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input-futuristic w-full rounded-xl pl-10 pr-12 py-3 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-neon w-full rounded-xl py-3 text-sm font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-white/30">
                        New to Smart KOT?{' '}
                        <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
