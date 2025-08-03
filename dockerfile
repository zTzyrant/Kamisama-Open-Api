FROM oven/bun AS build

RUN apt-get update && apt-get install -y build-essential python3 pkg-config

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install
COPY . .

ENV NODE_ENV=production

RUN bun x prisma generate
RUN bun run build

FROM oven/bun:slim

WORKDIR /app

COPY --from=build /app/server ./server

COPY --from=build /app/node_modules/.prisma/client ./node_modules/.prisma/client

ENV NODE_ENV=production

EXPOSE 3000
CMD ["./server"]