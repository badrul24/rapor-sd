const db = require("../config/database");
const RaporPDF = require("../utils/raporPDF");

class RaporController {
  static async create(req, res) {
    try {
      // [TAMBAHAN] id_kepsek ditambahkan ke destructuring body
      const { id_siswa, semester, tahun_ajaran, catatan_guru, id_kepsek } =
        req.body;

      if (!id_siswa || !semester || !tahun_ajaran || !id_kepsek) {
        return res.status(400).json({
          message:
            "ID siswa, semester, tahun ajaran, dan Kepala Sekolah harus diisi",
        });
      }

      if (!["1", "2"].includes(String(semester))) {
        return res.status(400).json({ message: "Semester harus 1 atau 2" });
      }

      const [insertId] = await db("rapor").insert({
        id_siswa,
        semester,
        tahun_ajaran,
        id_kepsek, // [TAMBAHAN] Simpan id_kepsek terpilih
        catatan_guru: catatan_guru || null,
        tanggal_cetak: null,
      });

      res.status(201).json({
        message: "Rapor berhasil dibuat",
        id_rapor: insertId,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const rapor = await db("rapor as r")
        .select(
          "r.*",
          "s.nama_siswa",
          "s.nis",
          "s.hadir",
          "s.izin",
          "s.sakit",
          "k.nama_kelas",
          "k.id_kelas"
        )
        .leftJoin("siswa as s", "r.id_siswa", "s.id_siswa")
        .leftJoin("kelas as k", "s.id_kelas", "k.id_kelas")
        .orderBy(["r.tahun_ajaran", "r.semester"], "desc");

      res.json(rapor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getBySiswa(req, res) {
    try {
      const { id_siswa } = req.params;
      const rapor = await db("rapor")
        .select("*")
        .where("id_siswa", id_siswa)
        .orderBy(["tahun_ajaran", "semester"], "desc");

      res.json(rapor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getDetail(req, res) {
    try {
      const { id_rapor } = req.params;

      const [rapor] = await db("rapor")
        .select("*")
        .where("id_rapor", id_rapor)
        .limit(1);

      if (!rapor) {
        return res.status(404).json({ message: "Rapor tidak ditemukan" });
      }

      const nilai = await db("nilai as n")
        .select("n.*", "m.nama_mapel", "m.kkm")
        .leftJoin("mapel as m", "n.id_mapel", "m.id_mapel")
        .where("n.id_siswa", rapor.id_siswa)
        .orderBy("m.nama_mapel");

      res.json({
        rapor: rapor,
        nilai: nilai,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      // [TAMBAHAN] id_kepsek ditambahkan ke body update
      const { catatan_guru, id_kepsek } = req.body;

      const affectedRows = await db("rapor")
        .where("id_rapor", id)
        .update({
          catatan_guru: catatan_guru || null,
          id_kepsek: id_kepsek || undefined, // [TAMBAHAN] Update id_kepsek jika ada
        });

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Rapor tidak ditemukan" });
      }

      const [updatedRapor] = await db("rapor")
        .select("*")
        .where("id_rapor", id)
        .limit(1);

      res.json(updatedRapor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const affectedRows = await db("rapor").where("id_rapor", id).del();

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Rapor tidak ditemukan" });
      }

      res.json({ message: "Rapor berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async generatePDF(req, res) {
    try {
      const { id_rapor } = req.params;
      console.log("Generating PDF for rapor ID:", id_rapor);

      const today = new Date();
      const formattedDate = today.toISOString().slice(0, 19).replace("T", " ");

      const affectedRows = await db("rapor")
        .where("id_rapor", id_rapor)
        .update({
          tanggal_cetak: formattedDate,
        });

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Rapor tidak ditemukan" });
      }

      const [rapor] = await db("rapor as r")
        .select(
          "r.*",
          "s.nama_siswa",
          "s.nis",
          "s.tanggal_lahir",
          "s.jenis_kelamin",
          "s.hadir",
          "s.izin",
          "s.sakit",
          "k.nama_kelas",
          "u_wali.username as nama_wali",
          "u_wali.nip as nip_wali",
          "u_kepsek.username as nama_kepsek",
          "u_kepsek.nip as nip_kepsek"
        )
        .leftJoin("siswa as s", "r.id_siswa", "s.id_siswa")
        .leftJoin("kelas as k", "s.id_kelas", "k.id_kelas")
        // Join untuk mengambil data Wali Kelas (k.wali_kelas menyimpan ID Guru)
        .leftJoin("user as u_wali", "k.wali_kelas", "u_wali.id_user")
        // Join untuk mengambil data Kepsek (r.id_kepsek menyimpan ID Kepsek)
        .leftJoin("user as u_kepsek", "r.id_kepsek", "u_kepsek.id_user")
        .where("r.id_rapor", id_rapor)
        .limit(1);

      if (!rapor) {
        return res.status(404).json({ message: "Rapor tidak ditemukan" });
      }

      const nilai = await db("nilai as n")
        .select("n.*", "m.nama_mapel", "m.kkm")
        .leftJoin("mapel as m", "n.id_mapel", "m.id_mapel")
        .where("n.id_siswa", rapor.id_siswa)
        .orderBy("m.nama_mapel");

      RaporPDF.generatePDF(rapor, nilai, res);
    } catch (error) {
      console.error("Error in generatePDF controller:", error);
      if (!res.headersSent) {
        res.status(500).json({
          message: error.message || "Gagal membuat PDF rapor",
        });
      }
    }
  }
}

module.exports = RaporController;
