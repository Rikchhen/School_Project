import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

/**
 * Optional Cloudinary storage for uploaded media. When the three CLOUDINARY_*
 * env vars are set (e.g. on a free host with no persistent disk), public
 * uploads are stored in Cloudinary and their permanent https URL is returned.
 * When unset, the app falls back to local disk storage (unchanged dev behaviour).
 */
const enabled = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (enabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function isCloudinaryEnabled(): boolean {
  return enabled;
}

/** Map a MIME type to the Cloudinary resource kind. */
function resourceType(mimetype: string): "image" | "video" | "raw" {
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("image/")) return "image";
  return "raw"; // PDFs and anything else
}

/**
 * Upload a local (temp) file to Cloudinary and return its permanent secure URL.
 * The caller is responsible for deleting the local temp file afterwards.
 */
export async function uploadLocalFileToCloudinary(
  localPath: string,
  mimetype: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: "adarsha",
    resource_type: resourceType(mimetype),
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });
  return result.secure_url;
}
