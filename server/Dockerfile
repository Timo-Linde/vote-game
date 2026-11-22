FROM node:21-alpine
WORKDIR /app

# Install build tools for better-sqlite3 native addon
RUN apk add --no-cache python3 make g++ && \
    ln -sf python3 /usr/bin/python

COPY src/ /app/src
COPY package*.json /app
RUN npm install

WORKDIR /app/src
EXPOSE 7071
CMD ["node", "app.js"]