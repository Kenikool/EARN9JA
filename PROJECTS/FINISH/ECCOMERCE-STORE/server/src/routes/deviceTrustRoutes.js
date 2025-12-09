import express from "express";
import {
  getTrustedDevices,
  trustCurrentDevice,
  untrustDeviceById,
  checkCurrentDeviceTrust,
} from "../controllers/deviceTrustController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getTrustedDevices);
router.get("/check", checkCurrentDeviceTrust);
router.post("/trust", trustCurrentDevice);
router.delete("/:id", untrustDeviceById);

export default router;
