export type FeatureData = {
  id: number;
  lat: number;
  lng: number;
  estabelecimentoFinalidadesCount: number;
  domicilioParticularCount: number;
  estabelecimentoConstrucaoCount: number;
  estabelecimentoReligiosoCount: number;
  estabelecimentoEnsinoCount: number,
  estabelecimentoSaudeCount: number;
  domicilioColetivoCount: number;
  estabelecimentoAgroCount: number;
}

export type InsertFeatureData = {
  id: number;
  lat?: number;
  lng?: number;
  info: string | null;
  iconName: string;
  isPolygon: boolean;
  polygonCoordinates?: { lat: number, lng: number }[];
}

export default interface FeaturesDatabase {
  getFeatures (): Promise<FeatureData[]>;
  insertFeature (point: InsertFeatureData): Promise<void>;
}