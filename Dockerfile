FROM oven/bun:1 AS base
WORKDIR /usr/src/app

COPY ./dist .

RUN apt update -y && apt install -y tar nodejs wget curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -
RUN mkdir /usr/src/app/temp

USER bun
EXPOSE 2025/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]
