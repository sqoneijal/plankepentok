import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { prisma } from "../lib/prisma";

export default async function userValidate(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
   fastify.get<{
      Params: { username: string };
   }>(
      "/user-validate/:username",
      {
         preHandler: [fastify.authenticate],
         schema: {
            params: {
               type: "object",
               properties: {
                  username: { type: "string" },
               },
               required: ["username"],
            },
         },
      },
      async (request) => {
         return await prisma.tb_pengguna.findFirst({
            where: {
               username: request.params.username,
            },
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
      },
   );
}
