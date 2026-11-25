import { Router } from "express";
import {
  create,
  getById,
  list,
  remove,
  update,
} from "../controllers/contractController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/", list);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
