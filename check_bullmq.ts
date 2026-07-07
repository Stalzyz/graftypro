import { Queue } from "bullmq";

const connection = { host: "127.0.0.1", port: 6379 }; // Update to remote redis if needed, but wait I should run this locally if I port-forward, or run it on the VPS.
