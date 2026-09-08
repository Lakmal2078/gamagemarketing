import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import JSZip from 'jszip';
import firebaseConfig from '../../firebase-applet-config.json';

// Project raw files for backup
import packageJsonRaw from '../../package.json?raw';
import readmeRaw from '../../README.md?raw';
import indexHtmlRaw from '../../index.html?raw';
import viteConfigRaw from '../../vite.config.ts?raw';
import tsconfigRaw from '../../tsconfig.json?raw';
import wranglerRaw from '../../wrangler.toml?raw';
import gitignoreRaw from '../../.gitignore?raw';
import appTsxRaw from '../App.tsx?raw';
import indexCssRaw from '../index.css?raw';
import mainTsxRaw from '../main.tsx?raw';

// Initialize Firebase App safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (strictly adhering to Workspace guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive access token not received from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface ProjectFileEntry {
  path: string;
  content: string;
}

export const getProjectFiles = (): ProjectFileEntry[] => {
  return [
    { path: 'README.md', content: readmeRaw },
    { path: 'package.json', content: packageJsonRaw },
    { path: 'index.html', content: indexHtmlRaw },
    { path: 'vite.config.ts', content: viteConfigRaw },
    { path: 'tsconfig.json', content: tsconfigRaw },
    { path: 'wrangler.toml', content: wranglerRaw },
    { path: '.gitignore', content: gitignoreRaw },
    { path: 'src/App.tsx', content: appTsxRaw },
    { path: 'src/index.css', content: indexCssRaw },
    { path: 'src/main.tsx', content: mainTsxRaw },
  ];
};

export interface UploadResult {
  folderId?: string;
  folderUrl?: string;
  zipFileId?: string;
  zipFileName?: string;
  fileCount: number;
}

// Upload file to Google Drive using multipart/related
async function uploadToDrive(
  token: string,
  metadata: { name: string; mimeType: string; parents?: string[] },
  content: Blob | string,
  contentType: string
): Promise<any> {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let contentData: ArrayBuffer | string;
  if (content instanceof Blob) {
    contentData = await content.arrayBuffer();
  } else {
    contentData = content;
  }

  const metaHeader = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const fileHeader = `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`;

  // Combine into single blob
  const combinedParts: (string | ArrayBuffer)[] = [metaHeader, fileHeader, contentData, closeDelimiter];
  const multipartBlob = new Blob(combinedParts, { type: `multipart/related; boundary=${boundary}` });

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: multipartBlob,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Create a folder in Google Drive
async function createDriveFolder(token: string, folderName: string): Promise<any> {
  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Google Drive folder: ${errorText}`);
  }

  return response.json();
}

// Upload entire project to Google Drive
export async function uploadProjectToGoogleDrive(
  onProgress?: (status: string, percent: number) => void
): Promise<UploadResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in.');
  }

  onProgress?.('Preparing project files...', 10);
  const files = getProjectFiles();

  // Create ZIP archive
  onProgress?.('Bundling project into ZIP archive...', 25);
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.path, file.content);
  }
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

  // 1. Create a dedicated folder in Google Drive
  onProgress?.('Creating "Gamage Marketing - Project Backup" folder in Google Drive...', 45);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const folderName = `Gamage Marketing - Codebase (${timestamp})`;
  const folder = await createDriveFolder(token, folderName);

  // 2. Upload ZIP file to the folder
  onProgress?.('Uploading project ZIP archive to Google Drive...', 70);
  const zipFileName = `gamagemarketing-source-${timestamp}.zip`;
  const zipResult = await uploadToDrive(
    token,
    {
      name: zipFileName,
      mimeType: 'application/zip',
      parents: [folder.id],
    },
    zipBlob,
    'application/zip'
  );

  // 3. Also upload README.md & package.json into the folder for immediate preview
  onProgress?.('Uploading project summary files to Google Drive...', 90);
  await uploadToDrive(
    token,
    {
      name: 'README.md',
      mimeType: 'text/markdown',
      parents: [folder.id],
    },
    readmeRaw,
    'text/markdown'
  );

  onProgress?.('Upload complete!', 100);

  return {
    folderId: folder.id,
    folderUrl: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
    zipFileId: zipResult.id,
    zipFileName: zipFileName,
    fileCount: files.length,
  };
}
