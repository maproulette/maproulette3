FROM node:18-alpine AS builder

WORKDIR /maproulette3
RUN apk update && apk add curl git jq

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN yarn run build

FROM nginx:1.25-alpine

RUN apk update && apk add jq

COPY --from=builder /maproulette3/dist /srv/www
COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY docker/90-write-env-to-json.sh /docker-entrypoint.d

EXPOSE 80
