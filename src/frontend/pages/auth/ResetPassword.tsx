import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/UI';
import { Logo } from '../../components/Logo';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ResetPasswordPage = () => {
    const { t } = useAppContext(); // Usually available even if public
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('ERROR');
            setErrorMsg('Invalid or missing token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        setStatus('IDLE');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus('SUCCESS');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setStatus('ERROR');
                setErrorMsg(data.error || 'Failed to reset password');
            }
        } catch (error) {
            console.error(error);
            setStatus('ERROR');
            setErrorMsg('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'SUCCESS') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
                    <p className="text-gray-600 mb-6">
                        Your password has been updated. Redirecting to login...
                    </p>
                    <Link to="/login">
                        <Button className="w-full">Go to Login Now</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Column - Visuals (Simply reused or simplified) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0F172A] text-white overflow-hidden items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[100px] animate-blob"></div>
                </div>
                <div className="relative z-10 text-center">
                    <Logo size={64} className="text-white mx-auto mb-6" />
                    <h1 className="text-4xl font-bold">Secure Your Account</h1>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Set New Password</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Please enter a new password for your account.
                        </p>
                    </div>

                    {status === 'ERROR' && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
                            {errorMsg}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full py-3.5" disabled={isLoading || !token}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
