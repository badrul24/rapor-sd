const db = require("../config/database")

class MapelController {
  static async create(req, res) {
    try {
      const { nama_mapel, kkm } = req.body

      if (!nama_mapel) {
        return res.status(400).json({ message: "Nama mapel harus diisi" })
      }

      const [insertId] = await db("mapel").insert({
        nama_mapel,
        kkm: kkm || 70,
      })

      res.status(201).json({
        message: "Mapel berhasil ditambahkan",
        id_mapel: insertId,
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async getAll(req, res) {
    try {
      const mapel = await db("mapel").select("*").orderBy("nama_mapel")
      res.json(mapel)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const [mapel] = await db("mapel").select("*").where("id_mapel", id).limit(1)

      if (!mapel) {
        return res.status(404).json({ message: "Mapel tidak ditemukan" })
      }

      res.json(mapel)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const { nama_mapel, kkm } = req.body

      const affectedRows = await db("mapel")
        .where("id_mapel", id)
        .update({
        nama_mapel,
        kkm,
        })

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Mapel tidak ditemukan" })
      }

      // Ambil kembali data mapel yang sudah diupdate
      const [updatedMapel] = await db("mapel").select("*").where("id_mapel", id).limit(1)

      res.json(updatedMapel)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const affectedRows = await db("mapel").where("id_mapel", id).del()

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Mapel tidak ditemukan" })
      }

      res.json({ message: "Mapel berhasil dihapus" })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = MapelController
