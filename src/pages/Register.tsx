import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/utils/api'
import { AlertCircle, Eye, EyeOff, Zap, Lock, Mail, UserRound } from 'lucide-react'

export default function Register() {
    const [name, setName] = useState('')
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
            const res = await api.post('/auth/register', { name, email, password, role: 'customer' })
            login(res.data.user, res.data.token)
            navigate('/customer')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040810] p-4">
            {/* Animated background orbs */}
            <div className="orb w-[500px] h-[500px] bg-violet-500/10 -top-40 -right-40" style={{ animationDelay: '0s' }} />
            <div className="orb w-[400px] h-[400px] bg-cyan-500/10 bottom-0 left-0" style={{ animationDelay: '2s' }} />
            <div className="orb w-[300px] h-[300px] bg-violet-400/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '4s' }} />

            {/* Grid overlay */}
            <div className="absolute inset-0 grid-bg opacity-40" />

            <div className="relative z-10 w-full max-w-md animate-slide-up">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-xl" />

                <div className="relative glass-card rounded-2xl p-6 sm:p-8">
                    {/* Logo */}
                    <div className="mb-6 sm:mb-8 flex flex-col items-center gap-3">
                        <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/30">
                            <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-violet-400" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl sm:text-2xl font-bold">
                                <span className="neon-text-violet">Smart</span>
                                <span className="text-white"> KOT</span>
                            </h1>
                            <p className="text-[10px] sm:text-sm text-white/40 mt-1 uppercase tracking-widest font-medium">Kitchen Order Ticket System</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-white">Create account</h2>
                        <p className="text-[12px] sm:text-sm text-white/40 mt-0.5">Join Smart KOT as a customer</p>
                    </div>

                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="input-futuristic w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
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
                            className="mt-2 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white', boxShadow: '0 0 20px rgba(168,85,247,0.4)' }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-white/30">
                        Already have an account?{' '}
                        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
