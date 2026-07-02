# Backend em modo desenvolvimento (hot reload via ts-node-dev)
FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro (cache de camada)
COPY package*.json ./
RUN npm install

# Código-fonte (em dev é sobrescrito pelo bind mount do compose)
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
