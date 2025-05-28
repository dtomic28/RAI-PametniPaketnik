# Build React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
RUN echo "REACT_APP_API_URL=$REACT_APP_API_URL" > .env.production && npm run build
RUN npm run build
