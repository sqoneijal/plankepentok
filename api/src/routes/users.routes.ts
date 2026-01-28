import { FastifyPluginAsync } from "fastify";
import { listResponseSchema } from "../schemas/common.schema";

const usersRoutes: FastifyPluginAsync = async (fastify) => {
   const { prisma } = fastify;

   fastify.get<{
      Params: {
         username?: string;
      };
   }>(
      "/validate/:username",
      {
         preHandler: [fastify.authenticate],
         schema: {
            tags: ["User"],
            response: {
               200: listResponseSchema,
            },
         },
      },
      async (request, reply) => {
         const { username } = request.params as { username: string };

         const results = await prisma.tb_pengguna.findMany({
            where: { username },
            select: {
               id: true,
               username: true,
               level_unit: true,
               roles: true,
               pengguna_role: {
                  select: {
                     id_biro: true,
                     id_lembaga: true,
                     id_upt: true,
                     id_fakultas: true,
                     id_sub_unit: true,
                  },
               },
            },
         });

         return reply.send({ success: true, data: results });
      },
   );
};
export default usersRoutes;
