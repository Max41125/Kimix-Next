# Указываем базовый образ
FROM node:18

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

# Выполняем сборку экспортируем информацию
RUN npm run export

# Указываем порт, который будет слушать Nginx
EXPOSE 3000
 
# Запускаем сервер
CMD ["npx", "serve", "out"]

