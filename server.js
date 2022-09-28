import Fastify from "fastify";
import cors from "@fastify/cors";
import sse from "fastify-sse";
import { SseEventDispatcher } from "./utilities.js";

const app = Fastify({
  logger: false,
});

// Use CORS and SSE plugins
await app.register(cors, {});
await app.register(sse);

// The SseEventDispatcher class maintains a list of active
// SSE connections and allows you to dispatch an event string
// to all the connected clients at once when needed.
// Please remember to call the "connect" method on the object
// with the Fastify reply object when your SSE endpoint is
// invoked.
const sseEventDispatcher = new SseEventDispatcher();

// This is the SSE endpoint we use to receive Server-Side events
// in the browser (check the index.html file).
app.get("/events", (req, reply) => {
  sseEventDispatcher.connect(reply)
});

// Using the event dispatcher object defined above, we can use
// the root endpoint to dispatch the string 'ROOT_ACCESSED' as
// an event using SSE.
app.get("/", (req, reply) => {
  sseEventDispatcher.dispatch('ROOT_ACCESSED');
  reply.send({ success: true, active_clients: sseEventDispatcher.connections });
});

// Using the event dispatcher object defined above, we can use
// all other accesses to dispatch the string 'UNKNOWN_ENDPOINT'
// as an event using SSE.
app.get("/*", (req, reply) => {
  sseEventDispatcher.dispatch('UNKNOWN_ENDPOINT');
  reply.send({ success: false, active_clients: sseEventDispatcher.connections });
})

// The server waiting loop.
await app.listen({ port: 3000 });
