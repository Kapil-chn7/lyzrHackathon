import express from 'express';
import http from 'http';
import cors from "cors";
// import { Server } from 'socket.io';
import workflowRoutes from './routes/createWorkFlows.js';
import mockServiceRouter from "./routes/mockService.js";
// import agentRoutes from './routes/agents.js';
// import initWorkflowSocket from './sockets/workflowSocket.js';

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());

// REST API routes
app.use('/api/workflows', workflowRoutes);

app.use("/api", mockServiceRouter);
// app.use('/api/agents', agentRoutes);

// WebSocket
// initWorkflowSocket(io);

const PORT = 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
