const express = require("express")
const NilaiController = require("../controllers/NilaiController")
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware")

const router = express.Router()

router.use(authMiddleware)

router.post("/", roleMiddleware(["admin", "guru"]), NilaiController.create)
router.get("/", NilaiController.getAll)
router.get("/siswa/:id_siswa", NilaiController.getBySiswa)
router.get("/mapel/:id_mapel", NilaiController.getByMapel)
router.put("/:id", roleMiddleware(["admin", "guru"]), NilaiController.update)
router.delete("/:id", roleMiddleware(["admin", "guru"]), NilaiController.delete)

module.exports = router
