FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ARG PORT=3000
EXPOSE ${PORT}

CMD ["node", "server.js"]