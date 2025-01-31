import { Router, Request, Response } from 'express';

import OSMApi from '../../services/osm-api';

import PointsDatabase from '../../../interfaces/PointsDatabase';

const router = Router();
const osmApi = new OSMApi();

const setupOSMRoutes = (pointsDb: PointsDatabase) => {
  router.get('/info', (request: Request, response: Response) => {
    const { lat, lng } = request.query;

    osmApi.getDataFromCoordinates({
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string)
    })
    .then(data => response.json(data))
    .catch(console.error);
  });

  router.get('/points', async (request: Request, response: Response) => {
    const points = await pointsDb.getPoints();
    response.json(points);
  });

  router.post('/points', async (request: Request, response: Response) => {
    try {
      await pointsDb.insertPoint(request.body)
      response.status(201).send();
    } catch (error: any) {
      response.status(500).json({
        error: true,
        message: error.message
      })
    }
  });

  return router;
}

export default setupOSMRoutes;