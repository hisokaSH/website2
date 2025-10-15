import { useState, useEffect } from 'react';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LauncherVersion {
  id: string;
  version: string;
  file_path: string;
  file_name: string;
  file_size: number;
  release_notes: string;
  is_latest: boolean;
  created_at: string;
}

export default function LauncherDownload() {
  const { user } = useAuth();
  const [latestVersion, setLatestVersion] = useState<LauncherVersion | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (user) {
      checkVerification();
      fetchLatestVersion();
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

  const fetchLatestVersion = async () => {
    const { data, error } = await supabase
      .from('launcher_versions')
      .select('*')
      .eq('is_latest', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching launcher version:', error);
      return;
    }

    setLatestVersion(data);
  };

  const handleDownload = async () => {
    if (!isVerified) {
      setError('Please verify your Discord account to download the launcher');
      return;
    }

    if (!latestVersion) {
      setError('No launcher version available');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const { data, error } = await supabase.storage
        .from('launchers')
        .download(latestVersion.file_path);

      if (error) {
        throw error;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = latestVersion.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download launcher. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Sign In Required</h3>
        <p className="text-gray-400">Please sign in to download the launcher</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
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

  if (!latestVersion) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Launcher Available</h3>
        <p className="text-gray-400">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Download Launcher</h3>
          <div className="flex items-center gap-2 text-gray-400">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Verified Discord Member</span>
          </div>
        </div>
        <div className="bg-blue-600 px-4 py-2 rounded-lg">
          <div className="text-sm text-blue-200">Latest Version</div>
          <div className="text-xl font-bold text-white">{latestVersion.version}</div>
        </div>
      </div>

      {latestVersion.release_notes && (
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Release Notes</h4>
          <p className="text-gray-400 text-sm whitespace-pre-wrap">{latestVersion.release_notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="text-gray-400 text-sm">
          <div>File: {latestVersion.file_name}</div>
          <div>Size: {formatFileSize(latestVersion.file_size)}</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        {isDownloading ? 'Downloading...' : 'Download Launcher'}
      </button>
    </div>
  );
}
