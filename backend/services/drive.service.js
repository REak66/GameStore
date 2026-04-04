const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

function getDriveClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });
  return google.drive({ version: "v3", auth });
}

/**
 * Generate a short-lived signed download URL for a Google Drive file.
 * @param {string} fileId - The Google Drive file ID stored on the product.
 * @returns {Promise<string>} A signed URL valid for DRIVE_LINK_EXPIRY_SECONDS.
 */
async function generateSignedDownloadUrl(fileId) {
  const drive = getDriveClient();
  const expirySeconds = parseInt(process.env.DRIVE_LINK_EXPIRY_SECONDS) || 3600;

  // Get file metadata to verify it exists and is accessible
  await drive.files.get({ fileId, fields: "id,name" });

  // Build a short-lived signed URL via the Drive export/download endpoint
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });

  await auth.authorize();
  const token = await auth.getAccessToken();

  // The signed URL embeds the access token; it is valid until the token expires
  const signedUrl =
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media` +
    `&access_token=${token.token}`;

  return { url: signedUrl, expiresIn: expirySeconds };
}

/**
 * Stream a Google Drive file directly through the Express response.
 * Use this as an alternative to signed URLs to hide the file ID entirely.
 * @param {string} fileId
 * @param {import('express').Response} res
 */
async function streamDriveFile(fileId, res) {
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
