const express = require("express")
const SiswaController = require("../controllers/SiswaController")
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware")

const router = express.Router()

router.use(authMiddleware)

router.post("/", roleMiddleware(["admin", "guru"]), SiswaController.create)
router.get("/", SiswaController.getAll)
router.get("/:id", SiswaController.getById)
router.get("/kelas/:id_kelas", SiswaController.getByKelas)
router.put("/:id", roleMiddleware(["admin", "guru"]), SiswaController.update)
router.delete("/:id", roleMiddleware(["admin"]), SiswaController.delete)

module.exports = router
