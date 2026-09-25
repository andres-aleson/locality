import "server-only";
import { google } from "googleapis";
import { Readable } from "node:stream";

// Uses OAuth2 (as the folder owner) rather than a bare service account.
// Service accounts get ~0 personal Drive storage quota on a regular consumer
// Gmail account, so files.create() into a shared folder fails with a quota
// error even though the folder itself has plenty of space. Authorizing as
// the real Google account once (see /api/locality/drive-auth) and reusing
// the resulting refresh token avoids that entirely — uploaded files count
// against the owner's normal Drive quota.

function getOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(): string {
  const client = getOAuthClient();
  if (!client) {
    throw new Error(
      "Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REDIRECT_URI first."
    );
  }
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });
}

export async function exchangeCodeForRefreshToken(code: string): Promise<string> {
  const client = getOAuthClient();
  if (!client) throw new Error("OAuth client isn't configured.");
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "No refresh token returned — revoke Locality's access at myaccount.google.com/permissions and try again (Google only issues a refresh token on first consent)."
    );
  }
  return tokens.refresh_token;
}

export function isDriveConfigured(): boolean {
  return Boolean(
    getOAuthClient() && process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

function getDriveClient() {
  const client = getOAuthClient();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!client || !refreshToken || !folderId) {
    throw new Error(
      "Google Drive isn't connected yet. Visit /api/locality/drive-auth to authorize, then set GOOGLE_REFRESH_TOKEN and GOOGLE_DRIVE_FOLDER_ID."
    );
  }
  client.setCredentials({ refresh_token: refreshToken });
  return { drive: google.drive({ version: "v3", auth: client }), folderId };
}

export async function uploadToDrive({
  buffer,
  fileName,
  mimeType,
}: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<{ fileId: string; viewLink: string }> {
  const { drive, folderId } = getDriveClient();

  const res = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id, webViewLink",
  });

  const fileId = res.data.id;
  if (!fileId) throw new Error("Drive upload failed — no file id returned.");

  return {
    fileId,
    viewLink: res.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`,
  };
}
