FROM nginx:alpine

# Копируем статические файлы в nginx
COPY . /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# nginx запускается по умолчанию
