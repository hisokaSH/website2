import { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ResetPasswordForm } from './ResetPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register' | 'reset';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register' | 'reset'>(initialView);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1f35] border border-[#252d4a] rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <img
            src="https://i.ibb.co/8n39QhcC/Adobe-Express-file.png"
            alt="MeowCraft Logo"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-white text-center">
            {view === 'login' ? 'Welcome Back!' : view === 'register' ? 'Join MeowCraft' : 'Reset Password'}
          </h2>
          <p className="text-gray-400 text-center mt-2">
            {view === 'login'
              ? 'Sign in to continue your adventure'
              : view === 'register'
              ? 'Create an account to start your journey'
              : 'Recover your account'}
          </p>
        </div>

        {view === 'login' && (
          <LoginForm
            onSwitchToRegister={() => setView('register')}
            onSwitchToReset={() => setView('reset')}
            onSuccess={onClose}
          />
        )}

        {view === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setView('login')}
          />
        )}

        {view === 'reset' && (
          <ResetPasswordForm
            onBack={() => setView('login')}
          />
        )}
      </div>
    </div>
  );
}
