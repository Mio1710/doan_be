FROM node:20-apline

WORKDIR /app

EXPOSE 3000

CMD ['node', 'index.js']