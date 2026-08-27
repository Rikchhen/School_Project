import { Router, type Request, type Response } from "express";
import authRoutes from "./authRoutes";
import noticeRoutes from "./noticeRoutes";
import eventRoutes from "./eventRoutes";
import galleryRoutes from "./galleryRoutes";
import staffRoutes from "./staffRoutes";
import pageRoutes from "./pageRoutes";
import submissionRoutes from "./submissionRoutes";
import uploadRoutes from "./uploadRoutes";
import committeeRoutes from "./committeeRoutes";
import programRoutes from "./programRoutes";
import settingsRoutes from "./settingsRoutes";
import securityRoutes from "./securityRoutes";
import syllabusRoutes from "./syllabusRoutes";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, status: "ok", uptime: process.uptime(), time: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/notices", noticeRoutes);
router.use("/events", eventRoutes);
router.use("/gallery", galleryRoutes);
router.use("/staff", staffRoutes);
router.use("/pages", pageRoutes);
router.use("/submissions", submissionRoutes);
router.use("/committee", committeeRoutes);
router.use("/programs", programRoutes);
router.use("/settings", settingsRoutes);
router.use("/security", securityRoutes);
router.use("/syllabus", syllabusRoutes);
router.use("/uploads-file", uploadRoutes);

export default router;
