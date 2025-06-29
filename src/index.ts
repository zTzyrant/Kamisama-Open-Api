import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "Hello Elysia").listen(process.env.PORT ?? 3000);

app.get("/health", () => "OK");


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);