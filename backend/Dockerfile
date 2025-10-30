# Gunakan Node.js Alpine
FROM node:22-alpine

# Set working directory di container
WORKDIR /app

# Copy package.json & package-lock.json untuk install dependency
COPY package*.json ./

# Install dependencies
# --production hanya untuk prod, untuk dev kita butuh nodemon juga
RUN npm install -g npm@latest && npm install

# Copy seluruh project ke /app
COPY . .

# Expose port yang dipakai Node.js
EXPOSE 3000

# Jalankan Node.js dengan tsx untuk development
CMD ["npm", "run", "start"]