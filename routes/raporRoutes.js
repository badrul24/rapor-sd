const express = require("express")
const RaporController = require("../controllers/RaporController")
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware")

const router = express.Router()

router.use(authMiddleware)

router.post("/", roleMiddleware(["admin", "guru"]), RaporController.create)
router.get("/", RaporController.getAll)
router.get("/siswa/:id_siswa", RaporController.getBySiswa)
router.get("/detail/:id_rapor", RaporController.getDetail)
router.get("/pdf/:id_rapor", RaporController.generatePDF)
router.put("/:id", roleMiddleware(["admin", "guru"]), RaporController.update)
router.delete("/:id", roleMiddleware(["admin"]), RaporController.delete)

module.exports = router
