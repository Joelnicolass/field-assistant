# El server corre TypeScript sin compilar: Node 24 le saca los tipos al cargar los archivos.
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

# Railway define PORT; sin él, el server usa el 8787.
EXPOSE 8787
USER node
CMD ["node", "src/main.ts"]
