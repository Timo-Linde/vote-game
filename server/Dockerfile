FROM node:21-alpine
WORKDIR /app

COPY src/ /app/src
COPY package*.json /app
RUN npm install

WORKDIR /app/src
EXPOSE 7071
CMD ["node", "app.js"]