FROM node:18-alpine

# Робоча папка всередині контейнера
WORKDIR /app

# Копіюємо package.json та встановлюємо модулі
COPY package.json ./
RUN npm install

# Копіюємо всі інші файли (код сервера і плагіна)
COPY . .

# Відкриваємо порт
EXPOSE 3005

# Запускаємо сервер
CMD ["node", "server.js"]