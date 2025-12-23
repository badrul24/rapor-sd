const { verifyToken } = require("../utils/jwt")

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ message: "Token tidak valid atau sudah expired" })
    }

    req.user = decoded
    next()
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server" })
  }
}

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Anda tidak memiliki akses ke resource ini" })
    }
    next()
  }
}

module.exports = { authMiddleware, roleMiddleware }
