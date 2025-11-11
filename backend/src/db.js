const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");

class Database {
   constructor() {
      this.write = new PrismaClient({
         datasources: {
            db: { url: process.env.DATABASE_URL_WRITE },
         },
      }).$extends(withAccelerate());

      this.read = new PrismaClient({
         datasources: {
            db: { url: process.env.DATABASE_URL_READ },
         },
      }).$extends(withAccelerate());
   }

   async disconnect() {
      await this.write.$disconnect();
      await this.read.$disconnect();
   }
}

const db = new Database();

module.exports = db;
