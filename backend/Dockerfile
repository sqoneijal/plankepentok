# Gunakan Node.js Alpine
FROM node:22-alpine

# Set working directory di container
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install SEMUA dependencies (production + dev)
# Karena butuh prisma untuk generate
RUN npm ci --verbose || npm install --verbose

# Copy seluruh project KECUALI yang ada di .dockerignore
COPY . .

# Generate Prisma Client (butuh prisma dari devDependencies)
RUN npx prisma generate

# Clean cache untuk minimize image size
RUN npm cache clean --force

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "run", "start"]