# Gunakan Node.js Alpine
FROM node:22-alpine

# Set working directory di container
WORKDIR /app

# Copy package.json & package-lock.json untuk install dependency
COPY package*.json ./

# Install dependencies dengan verbose untuk debug
RUN npm ci --only=production --verbose || \
    (echo "npm ci failed, trying npm install..." && \
     npm install --production --verbose)

# Clean cache
RUN npm cache clean --force

# Copy seluruh project ke /app
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port yang dipakai Node.js
EXPOSE 3000

# Jalankan Node.js dengan tsx untuk development
CMD ["npm", "run", "start"]