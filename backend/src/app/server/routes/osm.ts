import { Router, Request, Response } from 'express';

import OSMApi from '../../services/osm-api';

import FeaturesDatabase from '../../../interfaces/FeaturesDatabase';

const router = Router();
const osmApi = new OSMApi();

const setupOSMRoutes = (featureDb: FeaturesDatabase) => {
  router.get('/info', (request: Request, response: Response) => {
    const { lat, lng } = request.query;

    osmApi.getDataFromCoordinates({
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string)
    })
    .then(data => response.json(data))
    .catch(console.error);
  });

  router.get('/features', async (request: Request, response: Response) => {
    const features = await featureDb.getFeatures();
    response.json(features);
  });

  router.post('/features', async (request: Request, response: Response) => {
    try {
      await featureDb.insertFeature(request.body)
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