const express = require("express")
const UserController = require("../controllers/UserController")
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware")

const router = express.Router()

router.use(authMiddleware)

// Admin dapat membuat user baru
router.post("/", roleMiddleware(["admin"]), UserController.register)

router.get("/", roleMiddleware(["admin", "kepsek"]), UserController.getAll)
router.get("/:id", UserController.getById)
router.put("/:id", roleMiddleware(["admin"]), UserController.update)
router.delete("/:id", roleMiddleware(["admin"]), UserController.delete)

module.exports = router
