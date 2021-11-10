FROM node:14-alpine AS build

WORKDIR /app
COPY . .
RUN yarn install
RUN yarn run build
RUN yarn install --production

FROM alpine:3
RUN apk add nodejs --no-cache
WORKDIR /app
COPY package*.json .
COPY locales ./locales
COPY --from=build /app/packages ./packages
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
EXPOSE 8080
CMD node ./build/index.js
