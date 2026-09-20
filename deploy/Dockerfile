FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm ci
COPY server ./server
COPY client ./client
COPY docs ./docs
RUN npm run build
EXPOSE 8123
CMD ["npm", "start"]
