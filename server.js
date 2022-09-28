import Fastify from "fastify";
import cors from "@fastify/cors";
import sse from "fastify-sse";
import { SseEventDispatcher } from "./utilities.js";

const app = Fastify({
  logger: false,
});

await app.register(cors, {});
await app.register(sse);

const sseEventDispatcher = new SseEventDispatcher();

app.get("/", (req, reply) => {
  sseEventDispatcher.dispatch('ROOT_ACCESSED');
  reply.send({ success: true, active_clients: sseEventDispatcher.length });
});

app.get("/*", (req, reply) => {
  sseEventDispatcher.dispatch('UNKNOWN_ENDPOINT');
  reply.send({ success: false, active_clients: sseEventDispatcher.length });
})

app.get("/events", async (req, reply) => {
  sseEventDispatcher.connect(reply)
});

await app.listen({ port: 3000 });
