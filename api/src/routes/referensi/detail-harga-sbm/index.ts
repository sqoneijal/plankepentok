import { FastifyPluginAsync } from "fastify";
import createRoutes from "./create";
import deleteRoutes from "./delete";
import getAllRoutes from "./get-all";
import getOneRoutes from "./get-one";
import updateRoutes from "./update";

const referensiDetailHargaSBMRoutes: FastifyPluginAsync = async (fastify) => {
   fastify.register(getAllRoutes);
   fastify.register(getOneRoutes);
   fastify.register(createRoutes);
   fastify.register(updateRoutes);
   fastify.register(deleteRoutes);
};

export default referensiDetailHargaSBMRoutes;
