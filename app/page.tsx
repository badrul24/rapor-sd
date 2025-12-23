export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Sistem Manajemen Rapor SD</h1>
        <p className="text-xl mb-8 text-blue-100">Kelola rapor dan nilai siswa dengan mudah dan efisien</p>

        <div className="bg-white bg-opacity-10 p-8 rounded-lg backdrop-blur max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Setup Instruksi</h2>
          <p className="text-blue-100 mb-4">Project ini terdiri dari 2 bagian terpisah yang harus di-setup di lokal:</p>

          <div className="space-y-4 text-left">
            <div className="bg-blue-500 bg-opacity-30 p-4 rounded">
              <h3 className="font-bold mb-2">1. Backend (Node.js/Express) - Port 5000</h3>
              <p className="text-sm text-blue-100">
                • Sudah di-download: sistem-manajemen-rapor.zip
                <br />• Setup: npm install → npm run migrate:latest → npm run dev
              </p>
            </div>

            <div className="bg-blue-500 bg-opacity-30 p-4 rounded">
              <h3 className="font-bold mb-2">2. Frontend (React/Vite) - Port 3000</h3>
              <p className="text-sm text-blue-100">
                • Buat folder baru: mkdir frontend-rapor
                <br />• Copy semua files React dari CodeProject ke folder tersebut
                <br />• Setup: npm install → npm run dev
              </p>
            </div>
          </div>

          <p className="text-blue-100 mt-6 text-sm">
            Setelah kedua project berjalan, akses frontend di http://localhost:3000
          </p>
        </div>
      </div>
    </div>
  )
}
