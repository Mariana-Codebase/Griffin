FROM node:20-slim
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install --no-frozen-lockfile
COPY tsconfig.json ./
COPY src/ ./src/
ENV PORT=3001
CMD pnpm tsx src/index.ts
