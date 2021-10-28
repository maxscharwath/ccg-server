FROM node:12-alpine AS build

WORKDIR /app
COPY package*.json .
RUN npm i
COPY . .
RUN npm run build
RUN npm i --production

FROM alpine:3
RUN apk add nodejs --no-cache
WORKDIR /app
COPY locales ./locales
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/src ./src
EXPOSE 8080
CMD node src/index.js
