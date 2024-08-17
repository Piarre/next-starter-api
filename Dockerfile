FROM node:20.16.0-slim
WORKDIR /usr/src/app

COPY ./dist .

RUN apt update -y && apt install -y tar wget curl
RUN npm install -g bun yarn pnpm --force
RUN mkdir -p /usr/src/app/temp

ENV TEMP_DIR=temp

EXPOSE 2025/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]
