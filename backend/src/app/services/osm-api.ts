import axios from 'axios';

const apiInstance = axios.create({
  baseURL: process.env.OSM_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
});

type OSMApiResponse = {
  place_id: number,
  licence: string,
  osm_type: string,
  osm_id: number,
  lat: string,
  lon: string,
  class: string,
  type: string,
  place_rank: number,
  importance: number,
  addresstype: string,
  name: string,
  display_name: string,
  address: {
    city_district: string,
    village?: string,
    municipality: string,
    state_district: string,
    state: string,
    'ISO3166-2-lvl4': string,
    region: string,
    country: string,
    country_code: string,
    postcode?: string,
    hamlet?: string,
    road?: string
  },
  boundingbox: [string, string, string, string]
};

export default class OSMApi {
  async getDataFromCoordinates (coordinates: { lat: number; lng: number; }): Promise<OSMApiResponse | void> {
    try {
      const response = await apiInstance.get('/reverse', {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lng,
          format: 'json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('[GET_DATA_FROM_COORDINATES] Erro: ', error);
    }
  }
}