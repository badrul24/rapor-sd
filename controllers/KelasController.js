const db = require("../config/database");

class KelasController {
  static async create(req, res) {
    try {
      const { nama_kelas, wali_kelas } = req.body;

      if (!nama_kelas) {
        return res.status(400).json({ message: "Nama kelas harus diisi" });
      }

      const [insertId] = await db("kelas").insert({
        nama_kelas: nama_kelas,
        wali_kelas: wali_kelas || null,
      });

      // Ambil kembali data kelas yang baru dibuat
      const [newKelas] = await db("kelas")
        .select(
          "id_kelas",
          "nama_kelas",
          "wali_kelas",
          "created_at",
          "updated_at"
        )
        .where("id_kelas", insertId)
        .limit(1);

      res.status(201).json(newKelas);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Di dalam KelasController.js

  static async getAll(req, res) {
    try {
      const kelas = await db("kelas as k")
        .select("k.*", "u.username as nama_wali")
        .leftJoin("user as u", "k.wali_kelas", "u.id_user")
        .orderBy("k.nama_kelas", "asc");

      res.json(kelas);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const [kelas] = await db("kelas")
        .select(
          "id_kelas",
          "nama_kelas",
          "wali_kelas",
          "created_at",
          "updated_at"
        )
        .where("id_kelas", id)
        .limit(1);

      if (!kelas) {
        return res.status(404).json({ message: "Kelas tidak ditemukan" });
      }

      res.json(kelas);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nama_kelas, wali_kelas } = req.body;

      if (!nama_kelas) {
        return res.status(400).json({ message: "Nama kelas harus diisi" });
      }

      // Cek apakah kelas ada
      const [existingKelas] = await db("kelas")
        .select("id_kelas")
        .where("id_kelas", id)
        .limit(1);

      if (!existingKelas) {
        return res.status(404).json({ message: "Kelas tidak ditemukan" });
      }

      // Update kelas
      await db("kelas")
        .where("id_kelas", id)
        .update({
          nama_kelas: nama_kelas,
          wali_kelas: wali_kelas || null,
        });

      // Ambil kembali data kelas yang sudah diupdate
      const [updatedKelas] = await db("kelas")
        .select(
          "id_kelas",
          "nama_kelas",
          "wali_kelas",
          "created_at",
          "updated_at"
        )
        .where("id_kelas", id)
        .limit(1);

      res.json(updatedKelas);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await db("kelas").where("id_kelas", id).del();

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Kelas tidak ditemukan" });
      }

      res.json({ message: "Kelas berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = KelasController;
