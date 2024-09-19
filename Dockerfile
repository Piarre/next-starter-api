FROM oven/bun:latest

WORKDIR /usr/src/app

COPY ./dist .

RUN apt update -y && apt install -y tar wget curl
RUN mkdir -p /usr/src/app/temp

ENV TEMP_DIR=temp
ENV APP_URL=https://next-starter-api.piarre.app

EXPOSE 2025/tcp

ENTRYPOINT [ "bun", "run", "index.js" ]
