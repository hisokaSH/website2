import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function LauncherUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isLatest, setIsLatest] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be signed in to upload');
      return;
    }

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!version) {
      setError('Please enter a version number');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const fileName = file.name;
      const filePath = `${version}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('launchers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      if (isLatest) {
        await supabase
          .from('launcher_versions')
          .update({ is_latest: false })
          .eq('is_latest', true);
      }

      const { error: dbError } = await supabase
        .from('launcher_versions')
        .insert({
          version,
          file_path: filePath,
          file_name: fileName,
          file_size: file.size,
          release_notes: releaseNotes,
          is_latest: isLatest,
          created_by: user.id
        });

      if (dbError) {
        await supabase.storage
          .from('launchers')
          .remove([filePath]);
        throw dbError;
      }

      setSuccess(`Successfully uploaded version ${version}`);
      setFile(null);
      setVersion('');
      setReleaseNotes('');
      setIsLatest(true);

      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload launcher');
    } finally {
      setUploading(false);
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
        <p className="text-gray-400">Please sign in to upload launchers</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-8">
      <h3 className="text-2xl font-bold text-white mb-6">Upload Launcher</h3>

      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Version Number
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g., 1.0.0"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Launcher File
          </label>
          <div className="relative">
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full px-4 py-8 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              {file ? (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">Click to select a file</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Release Notes
          </label>
          <textarea
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            placeholder="What's new in this version?"
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            disabled={uploading}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-latest"
            checked={isLatest}
            onChange={(e) => setIsLatest(e.target.checked)}
            className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
          <label htmlFor="is-latest" className="text-sm text-gray-300">
            Mark as latest version
          </label>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg p-4 flex items-start gap-2">
            <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 rounded-lg p-4">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file || !version}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          {uploading ? 'Uploading...' : 'Upload Launcher'}
        </button>
      </form>
    </div>
  );
}
