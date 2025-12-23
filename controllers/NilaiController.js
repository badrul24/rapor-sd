const db = require("../config/database")

class NilaiController {
  static hitungRataRata({ tugas = 0, ulangan = 0, uts = 0, uas = 0 }) {
    const toNum = (v) => {
      const n = Number(v)
      return Number.isNaN(n) ? 0 : n
    }
    const tugasScore = toNum(tugas) * 0.15
    const ulanganScore = toNum(ulangan) * 0.2
    const utsScore = toNum(uts) * 0.3
    const uasScore = toNum(uas) * 0.35
    const total = tugasScore + ulanganScore + utsScore + uasScore
    return Number(total.toFixed(2))
  }

  static async create(req, res) {
    try {
      const { id_siswa, id_mapel, tugas, ulangan, uts, uas, capaian_kompetensi } = req.body

      if (!id_siswa || !id_mapel) {
        return res.status(400).json({ message: "ID siswa dan mapel harus diisi" })
      }

      const rata_rata = NilaiController.hitungRataRata({ tugas, ulangan, uts, uas })

      const [insertId] = await db("nilai").insert({
        id_siswa,
        id_mapel,
        tugas,
        ulangan,
        uts,
        uas,
        rata_rata,
        capaian_kompetensi: capaian_kompetensi || null,
      })

      res.status(201).json({
        message: "Nilai berhasil ditambahkan",
        id_nilai: insertId,
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async getAll(req, res) {
    try {
      const nilai = await db("nilai as n")
        .select(
          "n.*",
          "s.nama_siswa",
          "m.nama_mapel"
        )
        .leftJoin("siswa as s", "n.id_siswa", "s.id_siswa")
        .leftJoin("mapel as m", "n.id_mapel", "m.id_mapel")
        .orderBy(["n.id_siswa", "n.id_mapel"])

      res.json(nilai)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async getBySiswa(req, res) {
    try {
      const { id_siswa } = req.params
      const nilai = await db("nilai as n")
        .select(
          "n.*",
          "m.nama_mapel",
          "m.kkm"
        )
        .leftJoin("mapel as m", "n.id_mapel", "m.id_mapel")
        .where("n.id_siswa", id_siswa)
        .orderBy("m.nama_mapel")

      res.json(nilai)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async getByMapel(req, res) {
    try {
      const { id_mapel } = req.params
      const nilai = await db("nilai as n")
        .select(
          "n.*",
          "s.nama_siswa",
          "s.nis"
        )
        .leftJoin("siswa as s", "n.id_siswa", "s.id_siswa")
        .where("n.id_mapel", id_mapel)
        .orderBy("s.nama_siswa")

      res.json(nilai)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const { tugas, ulangan, uts, uas, capaian_kompetensi } = req.body

      const rata_rata = NilaiController.hitungRataRata({ tugas, ulangan, uts, uas })

      const affectedRows = await db("nilai")
        .where("id_nilai", id)
        .update({
          tugas,
          ulangan,
          uts,
          uas,
          rata_rata,
          capaian_kompetensi: capaian_kompetensi || null,
        })

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Nilai tidak ditemukan" })
      }

      // Ambil kembali data nilai yang sudah diupdate
      const [updatedNilai] = await db("nilai as n")
        .select(
          "n.*",
          "s.nama_siswa",
          "m.nama_mapel"
        )
        .leftJoin("siswa as s", "n.id_siswa", "s.id_siswa")
        .leftJoin("mapel as m", "n.id_mapel", "m.id_mapel")
        .where("n.id_nilai", id)
        .limit(1)

      res.json(updatedNilai)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      const affectedRows = await db("nilai").where("id_nilai", id).del()

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Nilai tidak ditemukan" })
      }

      res.json({ message: "Nilai berhasil dihapus" })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = NilaiController
