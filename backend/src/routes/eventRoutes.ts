import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from "../controllers/eventController";
import { validate } from "../middleware/validate";
import { protect, requireRole } from "../middleware/auth";
import {
  createEventSchema,
  idParamSchema,
  listEventSchema,
  updateEventSchema,
} from "../validators";

const router = Router();

router.get("/", validate(listEventSchema), listEvents);
router.get("/:id", validate(idParamSchema), getEvent);

router.post("/", protect, requireRole("admin", "editor"), validate(createEventSchema), createEvent);
router.put("/:id", protect, requireRole("admin", "editor"), validate(updateEventSchema), updateEvent);
router.delete("/:id", protect, requireRole("admin", "editor"), validate(idParamSchema), deleteEvent);

export default router;
