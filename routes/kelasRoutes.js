const express = require("express")
const KelasController = require("../controllers/KelasController")
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware")

const router = express.Router()

router.use(authMiddleware)

router.post("/", roleMiddleware(["admin"]), KelasController.create)
router.get("/", KelasController.getAll)
router.get("/:id", KelasController.getById)
router.put("/:id", roleMiddleware(["admin"]), KelasController.update)
router.delete("/:id", roleMiddleware(["admin"]), KelasController.delete)

module.exports = router
