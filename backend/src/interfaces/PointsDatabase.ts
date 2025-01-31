export type PointData = {
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

export type InsertPointData = {
  lat?: number;
  lng?: number;
  info: string | null;
  iconName: string;
  isPolygon: boolean;
  polygonCoordinates?: { lat: number, lng: number }[];
}

export default interface PointsDatabase {
  getPoints (): Promise<PointData[]>;
  insertPoint (point: InsertPointData): Promise<void>;
}