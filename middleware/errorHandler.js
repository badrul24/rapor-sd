const errorHandler = (err, req, res, next) => {
  console.error(err)

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({ message: "Data sudah terdaftar sebelumnya" })
  }

  if (err.code === "ER_NO_REFERENCED_ROW") {
    return res.status(400).json({ message: "Referensi data tidak ditemukan" })
  }

  res.status(err.status || 500).json({
    message: err.message || "Terjadi kesalahan pada server",
    error: process.env.NODE_ENV === "development" ? err : {},
  })
}

module.exports = errorHandler
