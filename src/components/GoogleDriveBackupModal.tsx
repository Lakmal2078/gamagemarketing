import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  uploadProjectToGoogleDrive,
  getProjectFiles,
  UploadResult,
} from '../services/googleDrive';

interface GoogleDriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'si' | 'en';
}

export const GoogleDriveBackupModal: React.FC<GoogleDriveBackupModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const files = getProjectFiles();

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
        setHasToken(true);
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setHasToken(true);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setHasToken(false);
    setUploadResult(null);
    setShowConfirm(false);
  };

  const handleStartUpload = async () => {
    setErrorMsg(null);
    setShowConfirm(false);
    setIsUploading(true);
    setUploadPercent(5);
    setUploadStatus(lang === 'si' ? 'ගොනු සූදානම් කරමින් පවතී...' : 'Preparing project files...');

    try {
      const result = await uploadProjectToGoogleDrive((status, percent) => {
        setUploadStatus(status);
        setUploadPercent(percent);
      });
      setUploadResult(result);
    } catch (err: any) {
      console.error('Drive upload failed:', err);
      setErrorMsg(
        err?.message || (lang === 'si' ? 'Google Drive වෙත upload කිරීම අසාර්ථක විය.' : 'Upload to Google Drive failed.')
      );
      // Check if re-auth is needed
      const token = await getAccessToken();
      if (!token) {
        setHasToken(false);
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 overflow-hidden"
        >
          {/* Top subtle glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm border border-slate-700"
            aria-label="Close modal"
          >
            <i className="fas fa-times" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400 shadow-inner">
              <i className="fab fa-google-drive" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                {lang === 'si' ? 'Google Drive උපස්ථය' : 'Google Drive Backup'}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {lang === 'si' ? 'ව්‍යාපෘතිය Google Drive වෙත Upload කරන්න' : 'Upload Project to Google Drive'}
              </h3>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="mb-5 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs md:text-sm flex items-start gap-2.5">
              <i className="fas fa-exclamation-circle text-rose-400 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Step 1: Authentication required */}
          {!hasToken || !user ? (
            <div className="py-4 text-center">
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                {lang === 'si'
                  ? 'ඔබගේ අවසරය ඇතිව (with permission), මෙම සම්පූර්ණ codebase එක Google Drive වෙත upload කිරීම සඳහා කරුණාකර ඔබගේ Google ගිණුමෙන් sign in වන්න.'
                  : 'To securely upload this entire codebase to your Google Drive with your permission, please sign in with your Google account.'}
              </p>

              {/* Official Sign in with Google button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-800 font-semibold text-sm rounded-full shadow-lg hover:bg-slate-100 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>
                    {isSigningIn
                      ? lang === 'si'
                        ? 'සම්බන්ධ වෙමින්...'
                        : 'Connecting...'
                      : lang === 'si'
                      ? 'Sign in with Google'
                      : 'Sign in with Google'}
                  </span>
                </button>
              </div>

              <p className="text-slate-500 text-xs mt-5">
                {lang === 'si'
                  ? 'අවසර ලබා දෙනුයේ මෙම යෙදුම මඟින් Drive හි සාදන ගොනු සඳහා පමණි (drive.file scope).'
                  : 'Requested scope is limited to files created by this application (drive.file).'}
              </p>
            </div>
          ) : uploadResult ? (
            /* Success State */
            <div className="py-3 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-2xl shadow-lg">
                <i className="fas fa-check" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white mb-1">
                  {lang === 'si' ? 'සාර්ථකව Upload කරන ලදී!' : 'Successfully Uploaded!'}
                </h4>
                <p className="text-slate-400 text-xs md:text-sm">
                  {lang === 'si'
                    ? `ඔබගේ Google Drive හි නව folder එකක් නිර්මාණය කර ZIP bundle එක සහ ගොනු ${uploadResult.fileCount}ක් සුරකින ලදී.`
                    : `Created a dedicated folder in your Google Drive with the complete ZIP package and ${uploadResult.fileCount} source files.`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left text-xs space-y-1.5 font-mono text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">ZIP Archive:</span>
                  <span className="text-cyan-400 font-semibold">{uploadResult.zipFileName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Account:</span>
                  <span className="text-slate-200">{user.email}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                {uploadResult.folderUrl && (
                  <a
                    href={uploadResult.folderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg transition-all"
                  >
                    <i className="fab fa-google-drive" />
                    <span>{lang === 'si' ? 'Google Drive හි විවෘත කරන්න' : 'Open in Google Drive'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setUploadResult(null)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors border border-slate-700"
                >
                  {lang === 'si' ? 'නැවත Upload කරන්න' : 'Upload Again'}
                </button>
              </div>
            </div>
          ) : isUploading ? (
            /* Upload in Progress */
            <div className="py-6 space-y-5">
              <div className="text-center">
                <div className="inline-block p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-2xl mb-3 animate-pulse">
                  <i className="fas fa-cloud-arrow-up" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">
                  {lang === 'si' ? 'Google Drive වෙත ගොනු සුරැකෙමින් පවතී...' : 'Uploading Files to Google Drive...'}
                </h4>
                <p className="text-slate-400 text-xs font-mono">{uploadStatus}</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{lang === 'si' ? 'ප්‍රගතිය' : 'Progress'}</span>
                  <span className="font-bold text-cyan-400">{uploadPercent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700 p-0.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadPercent}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          ) : showConfirm ? (
            /* MANDATORY Confirmation Dialog before mutating Workspace data */
            <div className="py-2 space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <div className="flex items-center gap-2.5 font-bold text-sm mb-1.5">
                  <i className="fas fa-shield-halved text-amber-400" />
                  <span>
                    {lang === 'si' ? 'Upload කිරීම තහවුරු කරන්න' : 'Confirm Google Drive Upload'}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  {lang === 'si'
                    ? `ඔබගේ Google Drive හි ("${user.email}") "Gamage Marketing - Codebase" නමින් නව folder එකක් නිර්මාණය කර සම්පූර්ණ project ZIP ගොනුව සහ source code ලිපිගොනු upload කිරීමට නියමිතයි.`
                    : `This will create a new folder named "Gamage Marketing - Codebase" in your Google Drive ("${user.email}") and upload the complete project ZIP archive and source code files.`}
                </p>
              </div>

              {/* File list summary */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <div className="text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  {lang === 'si' ? 'ඇතුළත් ගොනු ලැයිස්තුව:' : 'Included Codebase Files:'}
                </div>
                <ul className="grid grid-cols-2 gap-1.5 font-mono text-slate-300">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 truncate">
                      <i className="fas fa-file-code text-cyan-400 text-[10px]" />
                      <span className="truncate">{f.path}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs md:text-sm transition-colors border border-slate-700"
                >
                  {lang === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleStartUpload}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs md:text-sm shadow-lg transition-all"
                >
                  <i className="fas fa-upload mr-1.5" />
                  {lang === 'si' ? 'තහවුරු කර Upload කරන්න' : 'Confirm & Upload'}
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated Ready View */
            <div className="py-2 space-y-5">
              {/* User badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-10 h-10 rounded-full border border-slate-600 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-xs">
                      {user.displayName || user.email}
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px] md:max-w-xs">
                      {user.email}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                >
                  {lang === 'si' ? 'Sign out' : 'Sign out'}
                </button>
              </div>

              {/* Project summary */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{lang === 'si' ? 'ව්‍යාපෘතිය:' : 'Project:'}</span>
                  <span className="font-semibold text-cyan-400">Gamage Marketing Web Application</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{lang === 'si' ? 'ගොනු ප්‍රමාණය:' : 'Source Files:'}</span>
                  <span className="font-mono text-slate-200">{files.length} files (React + Vite + TypeScript)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{lang === 'si' ? 'ආකෘතිය:' : 'Export Format:'}</span>
                  <span className="font-semibold text-amber-300">ZIP Archive + Google Drive Folder</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs md:text-sm transition-colors border border-slate-700"
                >
                  {lang === 'si' ? 'වසන්න' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs md:text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                >
                  <i className="fab fa-google-drive text-slate-950" />
                  <span>
                    {lang === 'si' ? 'Drive වෙත Upload කරන්න' : 'Upload to Google Drive'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
