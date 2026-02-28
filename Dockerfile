# Змінюємо 18 на 20
FROM node:20-alpine

WORKDIR /app

COPY package.json ./

# Встановлюємо залежності
RUN npm install

COPY . .

EXPOSE 3005

CMD ["node", "server.js"]