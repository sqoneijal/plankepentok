require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");

const app = express();
const prisma = new PrismaClient().$extends(withAccelerate());

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/options", require("./routes/options"));
app.use("/api/referensi/unit-satuan", require("./routes/referensi/unitSatuan"));
app.use("/api/referensi/kategori-sbm", require("./routes/referensi/kategoriSBM"));
app.use("/api/referensi/standar-biaya", require("./routes/referensi/standarBiaya"));
app.use("/api/referensi/detail-harga-sbm", require("./routes/referensi/detailHargaSBM"));
app.use("/api/unit-kerja/biro", require("./routes/unit-kerja/biro"));
app.use("/api/unit-kerja/lembaga", require("./routes/unit-kerja/lembaga"));
app.use("/api/unit-kerja/upt", require("./routes/unit-kerja/upt"));
app.use("/api/unit-kerja/fakultas", require("./routes/unit-kerja/fakultas"));
app.use("/api/unit-kerja/sub-unit", require("./routes/unit-kerja/sub-unit"));
app.use("/api/pagu-anggaran", require("./routes/pagu-anggaran"));
app.use("/api/usulan-kegiatan", require("./routes/usulan-kegiatan"));
app.use("/api/master-iku", require("./routes/master-iku"));
app.use("/api/pengaturan", require("./routes/pengaturan"));
app.use("/api/verifikasi-usulan/pengajuan", require("./routes/verifikasi-usulan/pengajuan"));
app.use("/api/realisasi", require("./routes/realisasi"));
app.use("/api/pengguna/daftar", require("./routes/pengguna/daftar"));
app.use("/api/pengguna/logs", require("./routes/pengguna/logs"));

// Health check
app.get("/health", (req, res) => {
   res.json({ status: "OK" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
   await prisma.$disconnect();
   process.exit(0);
});
