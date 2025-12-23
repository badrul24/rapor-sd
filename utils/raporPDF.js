const PDFDocument = require("pdfkit");

const RaporPDF = {
  // Fungsi untuk menambahkan halaman baru jika diperlukan
  checkPageBreak(doc, requiredHeight, margin = 20) {
    if (doc.y + requiredHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      return true;
    }
    return false;
  },

  // Fungsi utama untuk generate PDF
  generatePDF(rapor, nilai, res) {
    try {
      // Set response headers untuk download PDF SEBELUM membuat PDF
      const fileName = `Rapor_${(rapor.nama_siswa || "Siswa").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${rapor.tahun_ajaran}_Semester_${rapor.semester}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );

      // Buat PDF
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      // Handle error saat generate PDF
      doc.on("error", (err) => {
        console.error("PDF generation error:", err);
        if (!res.headersSent) {
          res
            .status(500)
            .json({ message: "Gagal membuat PDF: " + err.message });
        } else {
          res.end();
        }
      });

      doc.on("end", () => {
        console.log("PDF stream ended");
      });

      doc.pipe(res);

      // --- PENENTUAN FONT SIZE GLOBAL ---
      const FONT_SIZE_INFO = 10;
      const FONT_SIZE_CONTENT = 9;
      const HEADER_HEIGHT_BOTTOM = 20; // Tinggi header bagian bawah

      // Header - Judul
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("LAPORAN HASIL BELAJAR (RAPOR)", { align: "center" });
      doc.moveDown(1);

      // Informasi Siswa dan Sekolah
      const startY = doc.y;
      const pageLeft = doc.page.margins.left;
      const pageRight = doc.page.width - doc.page.margins.right;
      const contentWidth = pageRight - pageLeft;
      const labelWidth = 80;
      const rightCol = pageLeft + 250;
      const lineHeight = 20;

      doc.fontSize(FONT_SIZE_INFO).font("Helvetica");

      // Kolom Kiri
      const namaSiswa = String(rapor.nama_siswa || "-");
      const nis = String(rapor.nis || "-");
      doc.text("Nama Murid", pageLeft, startY);
      doc.text(`: ${namaSiswa}`, pageLeft + labelWidth, startY);
      doc.text("NISN", pageLeft, startY + lineHeight);
      doc.text(`: ${nis}`, pageLeft + labelWidth, startY + lineHeight);
      doc.text("Sekolah", pageLeft, startY + lineHeight * 2);
      doc.text(
        ": SDN 09 Sungai Kelambu",
        pageLeft + labelWidth,
        startY + lineHeight * 2
      );
      doc.text("Alamat", pageLeft, startY + lineHeight * 3);
      doc.text(": -", pageLeft + labelWidth, startY + lineHeight * 3);

      // Kolom Kanan
      const tingkatKelas = rapor.nama_kelas?.match(/\d+/)?.[0] || "-";
      const fase = tingkatKelas <= 2 ? "A" : tingkatKelas <= 4 ? "B" : "C";
      const semesterText = rapor.semester === "1" ? "I (Ganjil)" : "II (Genap)";
      const namaKelas = String(rapor.nama_kelas || "-");
      const tahunAjaran = String(rapor.tahun_ajaran || "-");

      doc.text("Kelas", rightCol, startY);
      doc.text(`: ${namaKelas}`, rightCol + labelWidth, startY);
      doc.text("Fase", rightCol, startY + lineHeight);
      doc.text(`: ${fase}`, rightCol + labelWidth, startY + lineHeight);
      doc.text("Semester", rightCol, startY + lineHeight * 2);
      doc.text(
        `: ${semesterText}`,
        rightCol + labelWidth,
        startY + lineHeight * 2
      );
      doc.text("Tahun Pelajaran", rightCol, startY + lineHeight * 3);
      doc.text(
        `: ${tahunAjaran}`,
        rightCol + labelWidth,
        startY + lineHeight * 3
      );

      doc.moveDown(2);

      // Daftar mata pelajaran tetap (8 mapel)
      const daftarMapel = [
        "Pendidikan Agama",
        "Pendidikan Pancasila",
        "Bahasa Indonesia",
        "Matematika",
        "Ilmu Pengetahuan Alam dan Sosial",
        "Seni Rupa",
        "Pendidikan Jasmani dan Olahraga",
        "Bahasa Inggris",
      ];

      // Tabel Nilai
      const tableTop = doc.y;
      const tableLeft = pageLeft;
      const headerRowHeight = 30;

      // Kolom: No, Mata Pelajaran, Nilai Akhir, Capaian Kompetensi
      let colWidths = [35, 120, 70, contentWidth - 35 - 120 - 70];

      // Header Tabel
      let currentY = tableTop;

      if (RaporPDF.checkPageBreak(doc, headerRowHeight + 50)) {
        currentY = doc.y;
      }

      doc.font("Helvetica-Bold").fontSize(9);

      // No
      doc.rect(tableLeft, currentY, colWidths[0], headerRowHeight).stroke();
      doc.text("No", tableLeft + 5, currentY + 10, {
        width: colWidths[0] - 10,
        align: "center",
      });

      // Mata Pelajaran
      doc
        .rect(tableLeft + colWidths[0], currentY, colWidths[1], headerRowHeight)
        .stroke();
      doc.text("Mata Pelajaran", tableLeft + colWidths[0] + 3, currentY + 10, {
        width: colWidths[1] - 6,
      });

      // Nilai Akhir
      doc
        .rect(
          tableLeft + colWidths[0] + colWidths[1],
          currentY,
          colWidths[2],
          headerRowHeight
        )
        .stroke();
      doc.text(
        "Nilai",
        tableLeft + colWidths[0] + colWidths[1] + 3,
        currentY + 10,
        { width: colWidths[2] - 6, align: "center" }
      );

      // Capaian Kompetensi
      doc
        .rect(
          tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
          currentY,
          colWidths[3],
          headerRowHeight
        )
        .stroke();
      doc.text(
        "Capaian Kompetensi",
        tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 3,
        currentY + 10,
        { width: colWidths[3] - 6 }
      );

      currentY += headerRowHeight;

      // Isi Tabel - menggunakan FONT_SIZE_CONTENT
      doc.font("Helvetica").fontSize(FONT_SIZE_CONTENT);
      const CAPAIAN_COL_PADDING = 3;
      const CAPAIAN_COL_WIDTH = colWidths[3] - CAPAIAN_COL_PADDING * 2;

      daftarMapel.forEach((namaMapel, index) => {
        const nilaiMapel = nilai.find((n) => n.nama_mapel === namaMapel) || {};
        const rawCapaian = String(nilaiMapel.capaian_kompetensi || "-");

        // --- Logika Pemisahan Capaian Kompetensi ---
        let point1 = rawCapaian;
        let point2 = "";

        // Cari titik yang memisahkan dua kalimat inti
        const match = rawCapaian.match(
          /(.*)(\. Ananda membutuhkan .*|\. Ananda membutuhkan bimbingan .*|\. Ananda membutuhkan peningkatan .*)/i
        );

        if (match && match.length >= 3) {
          point1 = match[1].trim() + ".";
          point2 = match[2].trim();
        } else if (rawCapaian.includes(".") && rawCapaian !== "-") {
          const firstDotIndex = rawCapaian.indexOf(".");
          if (firstDotIndex !== -1 && firstDotIndex < rawCapaian.length - 1) {
            point1 = rawCapaian.substring(0, firstDotIndex + 1).trim();
            point2 = rawCapaian.substring(firstDotIndex + 1).trim();
          }
        }

        // Hitung tinggi teks yang dibutuhkan
        let capaianHeight = 0;
        if (point1 !== "-") {
          capaianHeight += doc.heightOfString(point1, {
            width: CAPAIAN_COL_WIDTH,
          });
        }
        if (point2) {
          capaianHeight += 5; // Spasi antar poin
          capaianHeight += doc.heightOfString(point2, {
            width: CAPAIAN_COL_WIDTH,
          });
        }

        // Tinggi baris minimum
        const minRowHeight = 50;
        const calculatedRowHeight = Math.max(minRowHeight, capaianHeight + 10);

        // Cek apakah perlu halaman baru
        if (RaporPDF.checkPageBreak(doc, calculatedRowHeight + 20)) {
          currentY = doc.y;
          // Header tidak digambar ulang di halaman baru
        }

        const rowStartY = currentY;

        // No
        doc
          .rect(tableLeft, currentY, colWidths[0], calculatedRowHeight)
          .stroke();
        doc.text(
          String(index + 1),
          tableLeft + 5,
          currentY + calculatedRowHeight / 2 - 4,
          { width: colWidths[0] - 10, align: "center" }
        );

        // Mata Pelajaran - ALIGN LEFT, VERTICAL CENTER
        doc
          .rect(
            tableLeft + colWidths[0],
            currentY,
            colWidths[1],
            calculatedRowHeight
          )
          .stroke();
        const mapelTextHeight = doc.heightOfString(namaMapel, {
          width: colWidths[1] - 6,
        });
        const mapelY = currentY + (calculatedRowHeight - mapelTextHeight) / 2;
        doc.text(namaMapel, tableLeft + colWidths[0] + 3, mapelY, {
          width: colWidths[1] - 6,
          align: "left",
        });

        // Nilai Akhir
        doc
          .rect(
            tableLeft + colWidths[0] + colWidths[1],
            currentY,
            colWidths[2],
            calculatedRowHeight
          )
          .stroke();
        let nilaiAkhir = "-";
        if (nilaiMapel.rata_rata != null) {
          const rataNum =
            typeof nilaiMapel.rata_rata === "number"
              ? nilaiMapel.rata_rata
              : Number(nilaiMapel.rata_rata);
          if (!Number.isNaN(rataNum)) {
            nilaiAkhir = String(Number(rataNum).toFixed(0));
          }
        }
        doc.text(
          nilaiAkhir,
          tableLeft + colWidths[0] + colWidths[1] + 3,
          currentY + calculatedRowHeight / 2 - 4,
          { width: colWidths[2] - 6, align: "center" }
        );

        // Capaian Kompetensi
        doc
          .rect(
            tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
            currentY,
            colWidths[3],
            calculatedRowHeight
          )
          .stroke();

        let capaianTextY = currentY + 5; // Padding top
        const capaianTextX =
          tableLeft +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          CAPAIAN_COL_PADDING;

        // Poin 1 (Penguasaan)
        doc.text(point1, capaianTextX, capaianTextY, {
          width: CAPAIAN_COL_WIDTH,
          align: "left",
        });

        if (point2) {
          doc.y = doc.y + 5; // Jarak antar poin

          // Poin 2 (Penguatan/Bimbingan)
          doc.text(point2, capaianTextX, doc.y, {
            width: CAPAIAN_COL_WIDTH,
            align: "left",
          });
        }

        currentY += calculatedRowHeight;
      });

      // Posisikan kursor setelah tabel
      doc.y = currentY + 10;

      // --- Bagian Bawah: Ketidakhadiran & Catatan Wali Kelas (BERDAMPINGAN) ---

      if (RaporPDF.checkPageBreak(doc, 300)) {
        doc.moveDown(1);
      }

      const startYPartTwo = doc.y;
      const leftColPartTwo = pageLeft;
      const colWidthKetidakhadiran = 250;
      const colWidthCatatan = contentWidth - colWidthKetidakhadiran - 10;
      const catatanXPos = leftColPartTwo + colWidthKetidakhadiran + 10;

      // ------------------------ KOLOM KIRI: KETIDAKHADIRAN ------------------------
      let absenYPos = startYPartTwo;

      // Header Ketidakhadiran
      doc
        .rect(
          leftColPartTwo,
          absenYPos,
          colWidthKetidakhadiran,
          HEADER_HEIGHT_BOTTOM
        )
        .fillAndStroke("#CCCCCC", "#000000");
      doc.fillColor("black").font("Helvetica-Bold").fontSize(FONT_SIZE_INFO);
      doc.text("Ketidakhadiran", leftColPartTwo, absenYPos + 5, {
        width: colWidthKetidakhadiran,
        align: "center",
      });

      absenYPos += HEADER_HEIGHT_BOTTOM;

      const absenColWidths = [150, 100];
      const absenRowHeight = 20;
      const tableStart = leftColPartTwo;

      doc.font("Helvetica").fontSize(FONT_SIZE_CONTENT);

      const attendanceData = [
        { label: "Sakit", value: String((rapor.sakit || 0) + " hari") },
        { label: "Izin", value: String((rapor.izin || 0) + " hari") },
        {
          label: "Tanpa Keterangan",
          value: String(
            100 -
              (rapor.hadir || 0) -
              (rapor.sakit || 0) -
              (rapor.izin || 0) +
              " hari"
          ),
        },
      ];

      attendanceData.forEach((item) => {
        // Label column
        doc
          .rect(tableStart, absenYPos, absenColWidths[0], absenRowHeight)
          .stroke();
        doc.text(item.label, tableStart + 5, absenYPos + 5);

        // Value column
        doc
          .rect(
            tableStart + absenColWidths[0],
            absenYPos,
            absenColWidths[1],
            absenRowHeight
          )
          .stroke();
        doc.text(item.value, tableStart + absenColWidths[0] + 5, absenYPos + 5);

        absenYPos += absenRowHeight;
      });

      const totalAbsenceHeight = absenYPos - startYPartTwo;

      // ------------------------ KOLOM KANAN: CATATAN WALI KELAS ------------------------

      let catatanYPos = startYPartTwo;
      const catatanGuru = String(
        rapor.catatan_guru ||
          "Belajarlah menjadi siswa yang lebih aktif dalam proses belajar-mengajar. Saya menghargaimu."
      );

      // Header Catatan Wali Kelas
      doc
        .rect(catatanXPos, catatanYPos, colWidthCatatan, HEADER_HEIGHT_BOTTOM)
        .fillAndStroke("#CCCCCC", "#000000");
      doc.fillColor("black").font("Helvetica-Bold").fontSize(FONT_SIZE_INFO);
      doc.text("Catatan Wali Kelas", catatanXPos, catatanYPos + 5, {
        width: colWidthCatatan,
        align: "center",
      });

      catatanYPos += HEADER_HEIGHT_BOTTOM;

      doc.font("Helvetica").fontSize(FONT_SIZE_CONTENT);

      // Hitung tinggi kotak Catatan
      const catatanTextHeight = doc.heightOfString(`"${catatanGuru}"`, {
        width: colWidthCatatan - 10,
      });
      const minCatatanBoxHeight = totalAbsenceHeight - HEADER_HEIGHT_BOTTOM;
      const catatanBoxHeight = Math.max(
        minCatatanBoxHeight,
        catatanTextHeight + 10
      );

      doc
        .rect(catatanXPos, catatanYPos, colWidthCatatan, catatanBoxHeight)
        .stroke();
      doc.text(`"${catatanGuru}"`, catatanXPos + 5, catatanYPos + 5, {
        width: colWidthCatatan - 10,
      });

      doc.y = Math.max(absenYPos, catatanYPos + catatanBoxHeight) + 10;

      // ------------------------ TANGGAPAN ORANGTUA ------------------------

      if (RaporPDF.checkPageBreak(doc, 100)) {
        doc.moveDown(1);
      }

      const tanggapanY = doc.y;
      doc.font("Helvetica-Bold").fontSize(FONT_SIZE_INFO);
      // Perbaikan: Menggunakan fillAndStroke dan latar belakang abu-abu
      doc
        .rect(pageLeft, tanggapanY, contentWidth, HEADER_HEIGHT_BOTTOM)
        .fillAndStroke("#CCCCCC", "#000000");
      doc
        .fillColor("black")
        .text("Tanggapan Orangtua/Wali Murid", pageLeft + 5, tanggapanY + 5, {
          width: contentWidth - 10,
          align: "center",
        });

      doc
        .rect(pageLeft, tanggapanY + HEADER_HEIGHT_BOTTOM, contentWidth, 60)
        .stroke();

      doc.y = tanggapanY + HEADER_HEIGHT_BOTTOM + 60 + 10;
      doc.moveDown(2);

      // ------------------------ TANDA TANGAN ------------------------

      if (RaporPDF.checkPageBreak(doc, 150)) {
        doc.moveDown(1);
      }

      const signatureY = doc.y;
      const sigLeft = pageLeft;
      const sigRight = pageLeft + contentWidth * 0.6;
      const sigWidth = contentWidth * 0.4;

      doc.font("Helvetica").fontSize(FONT_SIZE_CONTENT);

      doc.text("Orang Tua,", sigLeft, signatureY, { width: sigWidth });
      doc.moveDown(4);
      const lineY = doc.y;
      doc.text("_________________________ ", sigLeft, lineY, {
        width: sigWidth,
        align: "left",
      });
      doc.y = lineY;

      // --- Tanda Tangan Wali Kelas (Kanan) ---
      doc.text("Wali Kelas,", sigRight, signatureY, {
        width: sigWidth,
        align: "left",
      });
      doc.moveDown(4);

      const namaWali = rapor.nama_wali || "_________________________";
      const nipWali =
        rapor.nip_wali || "..........................................";

      doc.font("Helvetica-Bold").text(namaWali, sigRight, doc.y, {
        width: sigWidth,
        align: "left",
        underline: true,
      });
      doc.font("Helvetica").text(`NIP. ${nipWali}`, sigRight, doc.y, {
        width: sigWidth,
        align: "left",
      });

      doc.moveDown(4);

      // --- Mengetahui Kepala Sekolah (Tengah) ---
      const namaKepsek = rapor.nama_kepsek || "_________________________";
      const nipKepsek =
        rapor.nip_kepsek || "..........................................";

      doc.text("Mengetahui,", { align: "center" });
      doc.text("Kepala Sekolah,", { align: "center" });
      doc.moveDown(4);

      doc
        .font("Helvetica-Bold")
        .text(namaKepsek, { align: "center", underline: true });
      doc.font("Helvetica").text(`NIP. ${nipKepsek}`, { align: "center" });

      console.log("Finalizing PDF...");
      doc.end();

      res.on("finish", () => {
        console.log("PDF response sent successfully");
      });

      console.log("PDF generation completed successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Error stack:", error.stack);
      if (!res.headersSent) {
        res.status(500).json({
          message: error.message || "Gagal membuat PDF rapor",
          error:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      } else {
        res.end();
      }
    }
  },
};

module.exports = RaporPDF;
