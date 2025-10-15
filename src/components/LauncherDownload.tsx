import { useState, useEffect } from 'react';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const LAUNCHER_DOWNLOAD_URL = 'https://pub-7850692b36c84d848f5356a34ab25a4d.r2.dev/MeowcraftLauncher.exe';

export default function LauncherDownload() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (user) {
      checkVerification();
    }
  }, [user]);

  const checkVerification = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('discord_verified')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking verification:', error);
      return;
    }

    setIsVerified(data?.discord_verified || false);
  };

  const handleDownload = () => {
    if (!isVerified) {
      setError('Please verify your Discord account to download the launcher');
      return;
    }

    setError(null);
    window.open(LAUNCHER_DOWNLOAD_URL, '_blank');
  };

  if (!user) {
    return (
      <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 text-center backdrop-blur-sm">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Sign In Required</h3>
        <p className="text-gray-400">Please sign in to download the launcher</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 text-center backdrop-blur-sm">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Discord Verification Required</h3>
        <p className="text-gray-400 mb-4">
          You must verify your Discord account and be a member of our server to download the launcher
        </p>
        <p className="text-sm text-gray-500">
          Go to your profile settings to connect and verify your Discord account
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Download Launcher</h3>
          <div className="flex items-center gap-2 text-gray-400">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Verified Discord Member</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-gray-400 text-sm">
          <div>File: MeowcraftLauncher.exe</div>
          <div>Platform: Windows</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <button
        onClick={handleDownload}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 transform hover:scale-105"
      >
        <Download className="w-5 h-5" />
        Download Launcher
      </button>
    </div>
  );
}
