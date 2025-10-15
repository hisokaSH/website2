import { Loader2 } from 'lucide-react';

export function DiscordCallback() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1425] via-[#1a1f35] to-[#0f1425] flex items-center justify-center p-4">
      <div className="bg-[#1a1f35] border border-[#252d4a] rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
          <h2 className="text-2xl font-bold text-white">Verifying Discord Account...</h2>
          <p className="text-gray-400">Please wait while we verify your server membership</p>
        </div>
      </div>
    </div>
  );
}
