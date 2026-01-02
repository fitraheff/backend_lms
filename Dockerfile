# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install OS deps (bcrypt & prisma need these)
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Generate Prisma Client
# RUN npx prisma generate

# Expose port
EXPOSE 8000

# Start app
CMD ["npm", "run", "dev"]
