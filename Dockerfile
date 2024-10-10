FROM node:18-alpine AS builder

WORKDIR /maproulette3
RUN apk update && apk add curl git jq

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN yarn run build

FROM nginx:1.25-alpine

COPY --from=builder /maproulette3/dist /srv/www
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
