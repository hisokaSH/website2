import { useState, useEffect } from 'react';
import { Server, Users, Zap, Shield, Download, Gamepad2, Globe, Sword, Map, UsersRound, Trophy, Copy, Monitor, Apple, Laptop, LogOut, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { UserProfile } from './components/Auth/UserProfile';
import { DiscordCallback } from './components/DiscordCallback';
import LauncherDownload from './components/LauncherDownload';
import { supabase } from './lib/supabase';

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [showDiscordCallback, setShowDiscordCallback] = useState(false);
  const { profile, signOut, refreshProfile } = useAuth();

  useEffect(() => {
    const handleDiscordCallback = async () => {
      const hash = window.location.hash;
      if (hash.includes('access_token')) {
        setShowDiscordCallback(true);

        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const guildId = params.get('state');

        if (accessToken && guildId) {
          try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
              console.error('No active session found');
              setShowDiscordCallback(false);
              alert('Session expired. Please sign in again and reconnect Discord.');
              return;
            }

            const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-discord`;
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                discordAccessToken: accessToken,
                guildId: guildId,
              }),
            });

            const result = await response.json();

            if (response.ok) {
              await refreshProfile();
            } else {
              console.error('Discord verification failed:', result);
              alert(`Discord verification failed: ${result.error || 'Unknown error'}`);
            }
          } catch (error) {
            console.error('Discord verification error:', error);
            alert('Failed to verify Discord account. Please try again.');
          }

          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => setShowDiscordCallback(false), 3000);
        }
      }
    };

    handleDiscordCallback();
  }, [refreshProfile]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (showDiscordCallback) {
    return <DiscordCallback />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1425] via-[#1a1f35] to-[#0f1425]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#0f1425]/80 backdrop-blur-md border-b border-[#1e2642]/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img
                src="https://i.ibb.co/8n39QhcC/Adobe-Express-file.png"
                alt="MeowCraft Logo"
                className="w-16 h-16 object-contain"
              />
              <span className="text-xl font-bold text-white">MeowCraft</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#mods" className="text-gray-300 hover:text-white transition-colors">Mods</a>
              <a href="#join" className="text-gray-300 hover:text-white transition-colors">How to Join</a>
              {profile ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setProfileModalOpen(true)}
                    className="flex items-center space-x-2 hover:text-white transition-colors"
                  >
                    <User className="w-5 h-5 text-cyan-400" />
                    <span className="text-gray-300">{profile.username}</span>
                    {profile.discord_verified && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="bg-[#1e2642] hover:bg-[#252d4a] text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 border border-[#2d3656]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-gradient-to-r from-[#f15c3b] to-[#f59e42] hover:from-[#f15c3b]/90 hover:to-[#f59e42]/90 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <div className="w-40 h-40 mx-auto mb-8">
              <img
                src="https://i.ibb.co/8n39QhcC/Adobe-Express-file.png"
                alt="MeowCraft Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f15c3b] to-[#f59e42]">Trainer!</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Embark on your Cobblemon journey in Minecraft! Catch, train, and battle
              with your favorite creatures in this incredible multiplayer experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#join" className="group bg-gradient-to-r from-[#f15c3b] to-[#f59e42] hover:from-[#f15c3b]/90 hover:to-[#f59e42]/90 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-500/20 flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download Launcher</span>
              </a>
              <a href="https://discord.com/invite/meowcraft" target="_blank" rel="noopener noreferrer" className="bg-[#1e2642] hover:bg-[#252d4a] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-[#2d3656] flex items-center space-x-2 transform hover:scale-105">
                <UsersRound className="w-5 h-5" />
                <span>Join Discord</span>
              </a>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm hover:border-[#2d3656] transition-all">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f15c3b] to-[#f59e42] mb-2">500+</div>
              <div className="text-gray-400">Active Players</div>
            </div>

            <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm hover:border-[#2d3656] transition-all">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f59e42] to-[#ffc043] mb-2">24/7</div>
              <div className="text-gray-400">Uptime</div>
            </div>

            <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm hover:border-[#2d3656] transition-all">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffc043] to-[#ffda6a] mb-2">1100+</div>
              <div className="text-gray-400">Cobblemon Species</div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div className="flex justify-center pb-16">
        <div className="w-6 h-10 border-2 border-[#f59e42]/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-[#f59e42] rounded-full animate-bounce"></div>
        </div>
      </div>

      {/* Why Choose Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why Choose Our Server?
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Experience the best Cobblemon gameplay with features designed for both casual players and competitive trainers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm hover:border-[#2d3656] transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#f15c3b] to-[#f59e42] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sword className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Epic Battles</h3>
              <p className="text-gray-400 leading-relaxed">
                Engage in strategic Cobblemon battles with unique mechanics and competitive tournaments.
              </p>
            </div>

            <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm hover:border-[#2d3656] transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Vast World</h3>
              <p className="text-gray-400 leading-relaxed">
                Explore custom biomes, dungeons, and structures designed for Cobblemon adventures.
              </p>
            </div>

            <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm hover:border-[#2d3656] transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UsersRound className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Active Community</h3>
              <p className="text-gray-400 leading-relaxed">
                Join a welcoming community of players who share your passion for collecting and battling.
              </p>
            </div>

            <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm hover:border-[#2d3656] transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ffc043] to-[#f59e42] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Custom Features</h3>
              <p className="text-gray-400 leading-relaxed">
                Experience unique gameplay mechanics, custom quests, and exclusive Cobblemon variants.
              </p>
            </div>

            <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm hover:border-[#2d3656] transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Events & Rewards</h3>
              <p className="text-gray-400 leading-relaxed">
                Participate in regular events, competitions, and earn exclusive rewards and achievements.
              </p>
            </div>

            <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm hover:border-[#2d3656] transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Safe & Fair</h3>
              <p className="text-gray-400 leading-relaxed">
                Protected by active moderation and anti-cheat systems ensuring fair gameplay for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Server Information Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-3xl p-12 backdrop-blur-sm">
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-pink-500 flex items-center justify-center">
                <Server className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Server Information</h2>
              <p className="text-gray-400 text-lg">Connect and start your adventure now</p>
            </div>

            <div className="bg-[#0f1425]/50 rounded-2xl p-8 mb-8 border border-[#1e2642]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-gray-400 text-sm mb-2">Server Address</div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    meowcraft.omgcraft.fr
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('meowcraft.omgcraft.fr')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 transform hover:scale-105"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0f1425]/50 rounded-xl p-6 border border-[#1e2642]">
                <div className="text-gray-400 text-sm mb-2">Version</div>
                <div className="text-2xl font-bold text-white">1.20.1</div>
              </div>
              <div className="bg-[#0f1425]/50 rounded-xl p-6 border border-[#1e2642]">
                <div className="text-gray-400 text-sm mb-2">Modpack</div>
                <div className="text-2xl font-bold text-white">Cobblemon 1.5</div>
              </div>
              <div className="bg-[#0f1425]/50 rounded-xl p-6 border border-[#1e2642]">
                <div className="text-gray-400 text-sm mb-2 flex items-center">
                  Status
                </div>
                <div className="text-2xl font-bold text-cyan-400 flex items-center">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                  Online
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mods Section */}
      <section id="mods" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Featured Mods
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Our carefully selected modpack enhances your Cobblemon adventure
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Cobblemon', category: 'Core', color: 'from-red-500 to-orange-500' },
              { name: 'Biomes O Plenty', category: 'World', color: 'from-green-500 to-emerald-500' },
              { name: 'JourneyMap', category: 'Utility', color: 'from-blue-500 to-cyan-500' },
              { name: 'Create', category: 'Tech', color: 'from-amber-500 to-yellow-500' },
              { name: 'Farmers Delight', category: 'Food', color: 'from-lime-500 to-green-500' },
              { name: 'Waystones', category: 'Travel', color: 'from-purple-500 to-pink-500' },
              { name: 'Iron Chests', category: 'Storage', color: 'from-slate-500 to-gray-500' },
              { name: 'Simply Swords', category: 'Combat', color: 'from-rose-500 to-red-500' },
            ].map((mod, index) => (
              <div key={index} className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-xl p-4 backdrop-blur-sm hover:border-[#2d3656] transition-all">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mod.color} mb-3`}></div>
                <h3 className="text-white font-semibold mb-2">{mod.name}</h3>
                <span className="inline-block bg-[#252d4a] text-gray-400 text-xs font-medium px-3 py-1 rounded-full">
                  {mod.category}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#f59e42] to-[#ffc043] font-semibold">And way more...</p>
          </div>
        </div>
      </section>

      {/* Launcher Section */}
      <section id="join" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Get Our Custom Launcher
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Download our custom-built launcher for the easiest way to join the server. Automatic mod installation, updates, and server connection.
            </p>
          </div>

          <div className="mb-16">
            <LauncherDownload />
          </div>

          <div className="bg-[#1a1f35]/50 border border-[#252d4a] rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-start space-x-3 mb-6">
              <Download className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <h3 className="text-2xl font-bold text-white">Installation Guide</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-300 leading-relaxed">Download the launcher for your operating system from above</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-300 leading-relaxed">Run the installer and follow the on-screen instructions</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-300 leading-relaxed">Launch the application and log in with your Minecraft account</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">4</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-300 leading-relaxed">Click "Play" and the launcher will automatically install all required mods and connect you to the server</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#1e2642]/50 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="https://i.ibb.co/8n39QhcC/Adobe-Express-file.png"
                  alt="MeowCraft Logo"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-lg font-bold text-white">MeowCraft</span>
              </div>
              <p className="text-gray-500 text-sm">
                Catch, train, and battle Cobblemon in Minecraft since 2024.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-[#f59e42] transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-[#f59e42] transition-colors">Forums</a></li>
                <li><a href="#" className="hover:text-[#f59e42] transition-colors">Pokédex</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-[#f59e42] transition-colors">Rules</a></li>
                <li><a href="#" className="hover:text-[#f59e42] transition-colors">Staff</a></li>
                <li><a href="#" className="hover:text-[#f59e42] transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Server</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-[#f59e42] transition-colors">Vote</a></li>
                <li><a href="#" className="hover:text-[#f59e42] transition-colors">Donate</a></li>
                <li><a href="#" className="hover:text-[#f59e42] transition-colors">Store</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#1e2642]/50 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 MeowCraft. Not affiliated with Mojang, Microsoft, Nintendo, or The Pokémon Company.</p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <UserProfile
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}

export default App;
