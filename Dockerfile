FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies including devDependencies (for vite and tsx)
RUN npm install

# Copy application source code
COPY . .

# Build frontend production bundle
RUN npm run build

# Expose HTTP port 3000
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start application via tsx (serves both API & Frontend on port 3000)
CMD ["npx", "tsx", "src/server/index.ts"]
