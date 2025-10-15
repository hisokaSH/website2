import LauncherUpload from './LauncherUpload';

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1425] via-[#1a1f35] to-[#0f1425] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Admin Panel</h1>
          <p className="text-gray-400">Manage launcher uploads and versions</p>
        </div>

        <LauncherUpload />
      </div>
    </div>
  );
}
