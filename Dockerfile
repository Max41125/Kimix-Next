# Указываем базовый образ
FROM node:16

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Выполняем сборку приложения
RUN npm run build

# Указываем порт, который будет слушать Nginx
EXPOSE 3000

# Запускаем сервер
CMD ["npm", "start"]
