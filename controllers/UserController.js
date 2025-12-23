const bcrypt = require("bcryptjs")
const db = require("../config/database")
const { generateToken } = require("../utils/jwt")

class UserController {
  static async register(req, res) {
    try {
      const { username, password, role, nip } = req.body

      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, dan role harus diisi" })
      }

      if (!["admin", "guru", "ortu", "kepsek"].includes(role)) {
        return res.status(400).json({ message: "Role tidak valid" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      
      const [insertId] = await db("user").insert({
        username: username,
        password: hashedPassword,
        role: role,
        nip: nip || null,
      })

      const [newUser] = await db("user")
        .select("id_user", "username", "role", "nip", "created_at")
        .where("id_user", insertId)
        .limit(1)

      res.status(201).json(newUser)
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
          message: "Pendaftaran gagal. Username sudah terdaftar." 
        })
      }
      res.status(500).json({ message: error.message })
    }
  }

  // 2. LOGIN
  static async login(req, res) {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        return res.status(400).json({ message: "Username dan password harus diisi" })
      }

      const users = await db('user')
        .select('id_user', 'username', 'password', 'role', 'nip') // [TAMBAHAN] Ambil NIP saat login
        .where('username', username)
        .limit(1);

      if (users.length === 0) {
        return res.status(401).json({ message: "Username atau password salah" })
      }

      const user = users[0]
      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        return res.status(401).json({ message: "Username atau password salah" })
      }

      const token = generateToken(user.id_user, user.role)

      res.json({
        message: "Login berhasil",
        token,
        // [TAMBAHAN] Kirim data user yang lebih lengkap ke frontend
        user: { 
          id_user: user.id_user, 
          username: user.username, 
          role: user.role,
          nip: user.nip 
        },
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  // 3. GET ALL
  static async getAll(req, res) {
    try {
      const users = await db('user')
        .select('id_user', 'username', 'role', 'nip', 'created_at') // [TAMBAHAN] Tampilkan NIP di daftar user
        .orderBy('id_user');

      res.json(users)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  // 4. GET BY ID
  static async getById(req, res) {
    try {
      const { id } = req.params
      
      const users = await db('user')
        .select('id_user', 'username', 'role', 'nip', 'created_at') // [TAMBAHAN] Ambil NIP
        .where('id_user', id)
        .limit(1);

      if (users.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" })
      }

      res.json(users[0])
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  // 5. UPDATE
  static async update(req, res) {
    try {
      const { id } = req.params
      const { username, password, role, nip } = req.body

      if (!username || !role) {
        return res.status(400).json({ message: "Username dan role harus diisi" })
      }

      if (!["admin", "guru", "ortu", "kepsek"].includes(role)) {
        return res.status(400).json({ message: "Role tidak valid" })
      }

      const [existingUser] = await db("user")
        .select("id_user")
        .where("id_user", id)
        .limit(1)

      if (!existingUser) {
        return res.status(404).json({ message: "User tidak ditemukan" })
      }

      const updateData = {
        username: username,
        role: role,
        nip: nip || null,
      }

      if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 10)
      }

      await db("user").where("id_user", id).update(updateData)

      const [updatedUser] = await db("user")
        .select("id_user", "username", "role", "nip", "created_at") // [TAMBAHAN] Ambil NIP setelah update
        .where("id_user", id)
        .limit(1)

      res.json(updatedUser)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  // 6. DELETE
  static async delete(req, res) {
    try {
      const { id } = req.params
      
      const affectedRows = await db('user')
        .where('id_user', id)
        .del();

      if (affectedRows === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" })
      }

      res.json({ message: "User berhasil dihapus" })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = UserController