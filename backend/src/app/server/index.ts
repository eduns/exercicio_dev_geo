import express from 'express';
import cors from 'cors';

import setupOSMRoutes from './routes/osm';

import InMemoryPointsDatabase from '../database/InMemoryPointsDatabase';

const server = express();

server.use(cors());
server.use(express.json());
server.use('/osm', setupOSMRoutes(new InMemoryPointsDatabase()));

export default server;
