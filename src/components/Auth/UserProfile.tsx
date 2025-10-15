import { useState } from 'react';
import { X, User as UserIcon, Mail, Link as LinkIcon, Unlink, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { profile, linkDiscord, unlinkDiscord } = useAuth();
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !profile) return null;

  const handleLinkDiscord = async () => {
    setMessage(null);
    const guildId = '1426909789304393826';
    await linkDiscord(guildId);
  };

  const handleUnlinkDiscord = async () => {
    setUnlinkLoading(true);
    setMessage(null);

    const { error } = await unlinkDiscord();

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Discord account unlinked successfully' });
    }

    setUnlinkLoading(false);
  };

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
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-pink-500 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white text-center">Your Profile</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0f1425]/50 rounded-xl p-4 border border-[#252d4a]">
            <div className="flex items-center space-x-3 mb-2">
              <UserIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-400">Username</span>
            </div>
            <p className="text-white font-semibold text-lg ml-8">{profile.username}</p>
          </div>

          <div className="bg-[#0f1425]/50 rounded-xl p-4 border border-[#252d4a]">
            <div className="flex items-center space-x-3 mb-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-400">Email</span>
            </div>
            <p className="text-white text-lg ml-8">{profile.email}</p>
          </div>

          <div className="bg-[#0f1425]/50 rounded-xl p-4 border border-[#252d4a]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <LinkIcon className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-gray-400">Discord Account</span>
              </div>
              {profile.discord_verified && (
                <div className="flex items-center space-x-1 bg-green-500/10 border border-green-500/50 rounded-full px-3 py-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Verified</span>
                </div>
              )}
            </div>

            {profile.discord_username ? (
              <div className="ml-8 space-y-3">
                <div>
                  <p className="text-white font-semibold">{profile.discord_username}</p>
                  {!profile.discord_verified && (
                    <p className="text-yellow-400 text-sm mt-1">Pending admin verification</p>
                  )}
                </div>
                <button
                  onClick={handleUnlinkDiscord}
                  disabled={unlinkLoading}
                  className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Unlink className="w-4 h-4" />
                  <span>{unlinkLoading ? 'Unlinking...' : 'Unlink Discord'}</span>
                </button>
              </div>
            ) : (
              <div className="ml-8 space-y-3">
                <p className="text-gray-400 text-sm">
                  Connect your Discord account to automatically verify you're a member of our server.
                </p>
                <button
                  onClick={handleLinkDiscord}
                  className="flex items-center space-x-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg transition-all font-medium"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Connect Discord</span>
                </button>
              </div>
            )}
          </div>

          {message && (
            <div className={`${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-red-500/10 border-red-500/50'
            } border rounded-lg p-4 flex items-start space-x-3`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {message.text}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#252d4a] hover:bg-[#2d3656] text-white py-3 rounded-xl font-semibold transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
