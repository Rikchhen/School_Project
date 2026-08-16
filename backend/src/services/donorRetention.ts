import fs from "node:fs";
import path from "node:path";
import { SubmissionModel } from "../models/Submission";
import { PRIVATE_DONATION_DIR, UPLOAD_DIR } from "../middleware/upload";

export async function purgeExpiredDonorDocuments(): Promise<number> {
  const expired = await SubmissionModel.find({ type: "donation", documentExpiresAt: { $lte: new Date() }, documentUrl: { $ne: "" } });
  for (const submission of expired) {
    const filename = path.basename(submission.documentUrl);
    await Promise.all([PRIVATE_DONATION_DIR, UPLOAD_DIR].map((dir) => fs.promises.unlink(path.join(dir, filename)).catch(() => undefined)));
    submission.documentUrl = ""; submission.documentName = ""; submission.documentMime = ""; submission.documentEncrypted = false;
    await submission.save();
  }
  return expired.length;
}
