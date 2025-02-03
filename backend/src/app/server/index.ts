import express from 'express';
import cors from 'cors';

import setupOSMRoutes from './routes/osm';

import InMemoryFeaturesDatabase from '../database/InMemoryFeaturesDatabase';

const server = express();

server.use(cors());
server.use(express.json());
server.use('/osm', setupOSMRoutes(new InMemoryFeaturesDatabase()));

export default server;
