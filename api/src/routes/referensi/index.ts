import { FastifyInstance, FastifyPluginOptions } from "fastify";
import jenisKeluaranTorRoutes from "./jenis.keluaran.routes";
import jenisUsulanRoutes from "./jenis.usulan.routes";
import penerimaManfaatTorRoutes from "./penerimaan.manfaat.routes";
import volumeKeluaranTorRoutes from "./volume.keluaran.tor.routes";

export default async function referensiRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
   fastify.register(jenisKeluaranTorRoutes, { prefix: "referensi" });
   fastify.register(volumeKeluaranTorRoutes, { prefix: "referensi" });
   fastify.register(penerimaManfaatTorRoutes, { prefix: "referensi" });
   fastify.register(jenisUsulanRoutes, { prefix: "referensi" });
}
