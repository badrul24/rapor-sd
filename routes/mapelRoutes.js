const express = require("express")
const MapelController = require("../controllers/MapelController")
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware")

const router = express.Router()

router.use(authMiddleware)

router.post("/", roleMiddleware(["admin"]), MapelController.create)
router.get("/", MapelController.getAll)
router.get("/:id", MapelController.getById)
router.put("/:id", roleMiddleware(["admin"]), MapelController.update)
router.delete("/:id", roleMiddleware(["admin"]), MapelController.delete)

module.exports = router
