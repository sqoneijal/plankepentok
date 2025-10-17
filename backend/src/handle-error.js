function errorHandler(parsed, res) {
   if (parsed.success) {
      return;
   }

   const formattedErrors = {};
   for (const key in parsed.error.flatten().fieldErrors) {
      const val = parsed.error.flatten().fieldErrors[key];
      formattedErrors[key] = val?.[0] || "Terjadi kesalahan validasi";
   }

   return res.json({
      status: false,
      message: "Periksa kembali inputan anda.",
      errors: formattedErrors,
   });
}

module.exports = errorHandler;
