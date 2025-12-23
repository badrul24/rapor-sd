const db = require("../config/database")

class SiswaController {
  static async create(req, res) {
    try {
      const { nis, nama_siswa, tanggal_lahir, jenis_kelamin, id_kelas, id_user, hadir, izin, sakit } = req.body

      if (!nis || !nama_siswa || !jenis_kelamin || !id_kelas) {
        return res.status(400).json({ message: "Field yang wajib diisi: nis, nama_siswa, jenis_kelamin, id_kelas" })
      }

      const hadirVal = hadir != null ? parseInt(hadir, 10) || 0 : 0
      const izinVal = izin != null ? parseInt(izin, 10) || 0 : 0
      const sakitVal = sakit != null ? parseInt(sakit, 10) || 0 : 0

      const [insertId] = await db("siswa").insert({
        nis: nis,
        nama_siswa: nama_siswa,
        tanggal_lahir: tanggal_lahir || null,
        jenis_kelamin: jenis_kelamin,
        id_kelas: id_kelas,
        id_user: id_user || null,
        hadir: hadirVal,
        izin: izinVal,
        sakit: sakitVal,
      })

      // Ambil kembali data siswa yang baru dibuat dengan join kelas
      const [newSiswa] = await db("siswa")
        .select(
          "siswa.id_siswa",
          "siswa.nis",
          "siswa.nama_siswa",
          "siswa.tanggal_lahir",
          "siswa.jenis_kelamin",
          "siswa.id_kelas",
          "siswa.id_user",
          "siswa.hadir",
          "siswa.izin",
          "siswa.sakit",
          "siswa.created_at",
          "siswa.updated_at",
          "kelas.nama_kelas"
        )
        .leftJoin("kelas", "siswa.id_kelas", "kelas.id_kelas")
        .where("siswa.id_siswa", insertId)
        .limit(1)

      res.status(201).json(newSiswa)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async getAll(req, res) {
    try {
      const siswa = await db("siswa")
        .select(
          "siswa.id_siswa",
          "siswa.nis",
          "siswa.nama_siswa",
          "siswa.tanggal_lahir",
          "siswa.jenis_kelamin",
          "siswa.id_kelas",
          "siswa.id_user",
          "siswa.hadir",
          "siswa.izin",
          "siswa.sakit",
          "siswa.created_at",
          "siswa.updated_at",
          "kelas.nama_kelas"
        )
        .leftJoin("kelas", "siswa.id_kelas", "kelas.id_kelas")
        .orderBy("siswa.id_siswa")

      res.json(siswa)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params

      const [siswa] = await db("siswa")
        .select(
          "siswa.id_siswa",
          "siswa.nis",
          "siswa.nama_siswa",
          "siswa.tanggal_lahir",
          "siswa.jenis_kelamin",
          "siswa.id_kelas",
          "siswa.id_user",
          "siswa.created_at",
          "siswa.updated_at",
          "kelas.nama_kelas"
        )
        .leftJoin("kelas", "siswa.id_kelas", "kelas.id_kelas")
        .where("siswa.id_siswa", id)
        .limit(1)

      if (!siswa) {
        return res.status(404).json({ message: "Siswa tidak ditemukan" })
      }

      res.json(siswa)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async getByKelas(req, res) {
    try {
      const { id_kelas } = req.params
      const siswa = await db("siswa")
        .select(
          "siswa.id_siswa",
          "siswa.nis",
          "siswa.nama_siswa",
          "siswa.tanggal_lahir",
          "siswa.jenis_kelamin",
          "siswa.id_kelas",
          "siswa.id_user",
          "siswa.created_at",
          "siswa.updated_at",
          "kelas.nama_kelas"
        )
        .leftJoin("kelas", "siswa.id_kelas", "kelas.id_kelas")
        .where("siswa.id_kelas", id_kelas)
        .orderBy("siswa.nama_siswa")

      res.json(siswa)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const { nis, nama_siswa, tanggal_lahir, jenis_kelamin, id_kelas, hadir, izin, sakit } = req.body

      if (!nis || !nama_siswa || !jenis_kelamin || !id_kelas) {
        return res.status(400).json({ message: "Field yang wajib diisi: nis, nama_siswa, jenis_kelamin, id_kelas" })
      }

      // Cek apakah siswa ada
      const [existingSiswa] = await db("siswa")
        .select("id_siswa", "hadir", "izin", "sakit")
        .where("id_siswa", id)
        .limit(1)

      if (!existingSiswa) {
        return res.status(404).json({ message: "Siswa tidak ditemukan" })
      }

      // Update siswa
      await db("siswa").where("id_siswa", id).update({
        nis: nis,
        nama_siswa: nama_siswa,
        tanggal_lahir: tanggal_lahir || null,
        jenis_kelamin: jenis_kelamin,
        id_kelas: id_kelas,
        hadir: hadir != null ? parseInt(hadir, 10) || 0 : existingSiswa.hadir,
        izin: izin != null ? parseInt(izin, 10) || 0 : existingSiswa.izin,
        sakit: sakit != null ? parseInt(sakit, 10) || 0 : existingSiswa.sakit,
      })

      // Ambil kembali data siswa yang sudah diupdate dengan join kelas
      const [updatedSiswa] = await db("siswa")
        .select(
          "siswa.id_siswa",
          "siswa.nis",
          "siswa.nama_siswa",
          "siswa.tanggal_lahir",
          "siswa.jenis_kelamin",
          "siswa.id_kelas",
          "siswa.id_user",
          "siswa.hadir",
          "siswa.izin",
          "siswa.sakit",
          "siswa.created_at",
          "siswa.updated_at",
          "kelas.nama_kelas"
        )
        .leftJoin("kelas", "siswa.id_kelas", "kelas.id_kelas")
        .where("siswa.id_siswa", id)
        .limit(1)

      res.json(updatedSiswa)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params

      const affectedRows = await db("siswa").where("id_siswa", id).del()

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Siswa tidak ditemukan" })
      }

      res.json({ message: "Siswa berhasil dihapus" })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = SiswaController
