const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

/**
 * Accept either a bare file ID or a full Google Drive URL and return just the ID.
 * e.g. "https://drive.google.com/file/d/FILE_ID/view?usp=drive_link" → "FILE_ID"
 */
function extractFileId(fileIdOrUrl) {
  if (!fileIdOrUrl) return fileIdOrUrl;
  const match = fileIdOrUrl.match(/\/file\/d\/([^/?#]+)/);
  return match ? match[1] : fileIdOrUrl;
}

/**
 * Robustly parse the private key from the environment variable.
 * Handles: surrounding quotes added by Vercel/env stores, escaped \\n sequences,
 * Windows CRLF line endings, and extra leading/trailing whitespace — all of which
 * cause the OpenSSL 3 "DECODER routines::unsupported" error on Node.js 18+.
 */
function getPrivateKey() {
  let key = process.env.GOOGLE_PRIVATE_KEY || "";
  // Strip surrounding double-quotes that some env var UIs wrap around values
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }
  // Convert escaped \n sequences (stored literally in some env stores) to real newlines
  key = key.replace(/\\n/g, "\n");
  // Normalize Windows CRLF → LF
  key = key.replace(/\r\n?/g, "\n");
  return key.trim();
}

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: getPrivateKey(),
    },
    scopes: SCOPES,
  });
}

function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuth() });
}

/**
 * Generate a short-lived signed download URL for a Google Drive file.
 * @param {string} fileIdOrUrl - The Google Drive file ID or view URL.
 * @returns {Promise<{url: string, expiresIn: number}>}
 */
async function generateSignedDownloadUrl(fileIdOrUrl) {
  const fileId = extractFileId(fileIdOrUrl);
  const expirySeconds = parseInt(process.env.DRIVE_LINK_EXPIRY_SECONDS) || 3600;

  const auth = getAuth();
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();

  const signedUrl =
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media` +
    `&access_token=${token}`;

  return { url: signedUrl, expiresIn: expirySeconds };
}

/**
 * Stream a Google Drive file directly through the Express response.
 * @param {string} fileIdOrUrl
 * @param {import('express').Response} res
 */
async function streamDriveFile(fileIdOrUrl, res) {
  const fileId = extractFileId(fileIdOrUrl);
  const drive = getDriveClient();

  // Get metadata first so we can set Content-Type and Content-Disposition
  const meta = await drive.files.get({
    fileId,
    fields: "name,mimeType,size",
  });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${meta.data.name}"`,
  );
  res.setHeader("Content-Type", meta.data.mimeType || "application/octet-stream");
  if (meta.data.size) res.setHeader("Content-Length", meta.data.size);

  const fileStream = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" },
  );

  fileStream.data
    .on("error", (err) => {
      if (!res.headersSent) res.status(500).json({ message: "Download failed" });
    })
    .pipe(res);
}

module.exports = { generateSignedDownloadUrl, streamDriveFile };
