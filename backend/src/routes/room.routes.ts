import { Router } from "express";

import {
  createRoomController,
  joinRoomController,
  leaveRoomController,
  getUserRoomsController,
} from "../controllers/room.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  createRoomSchema,
  joinRoomSchema,
} from "../validators/room.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", getUserRoomsController);

router.post("/", validate(createRoomSchema), createRoomController);

router.post("/join", validate(joinRoomSchema), joinRoomController);

router.delete("/:roomId/leave", leaveRoomController);

export default router;
