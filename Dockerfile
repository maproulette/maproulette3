FROM node:16-bullseye

WORKDIR /src

RUN \
    apt-get update && \
    apt-get install -y \
        jq \
        python2 \
    && \
    ln -sf /usr/bin/python2 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

# Add this file to make sure it exists. Without overrides, the app doesn't work.
ADD .env.development.local .
COPY . .

ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN \
    yarn

EXPOSE 3000
CMD [ "yarn", "run", "start" ]
