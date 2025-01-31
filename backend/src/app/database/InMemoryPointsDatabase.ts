import sqlite3 from 'sqlite3';
import { parse } from 'csv-parse';
import fs from 'fs';
import { resolve } from 'path';

import PointsDatabase, { PointData, InsertPointData } from '../../interfaces/PointsDatabase';

const FILE_PATH = resolve(import.meta.dirname, '..', '..', '..', '..', 'files', 'base_jales_separado_virgula.csv');

export default class InMemoryPointsDatabase implements PointsDatabase {
  private readonly db = new sqlite3.Database(resolve(import.meta.dirname, 'points.db'), sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error('[DB] Erro:', err.message);
  });

  constructor () {
    this.db.exec(`
      DROP TABLE IF EXISTS points;

      CREATE TABLE points (
        lat TEXT,
        lng TEXT,
        estabelecimentoFinalidadesCount INTEGER,
        domicilioParticularCount INTEGER,
        estabelecimentoConstrucaoCount INTEGER,
        estabelecimentoReligiosoCount INTEGER,
        estabelecimentoEnsinoCount INTEGER,
        estabelecimentoSaudeCount INTEGER,
        domicilioColetivoCount INTEGER,
        estabelecimentoAgroCount INTEGER,
        info TEXT,
        iconName TEXT,
        isPolygon INTEGER,
        polygonCoordinates TEXT
      );
    `);

    fs.createReadStream(FILE_PATH)
      .pipe(parse({ delimiter: ',', fromLine: 2, toLine: 1001 }))
      .on('data', (row: string[]) => {
        const [
          lat, lng,
          estabelecimentoFinalidadesCount,
          domicilioParticularCount,
          estabelecimentoConstrucaoCount,
          estabelecimentoReligiosoCount,
          estabelecimentoEnsinoCount,
          estabelecimentoSaudeCount,
          domicilioColetivoCount,
          estabelecimentoAgroCount
        ] = row;
          const insertStatement = this.db.prepare(`
            INSERT INTO points (
              lat,
              lng,
              estabelecimentoFinalidadesCount,
              domicilioParticularCount,
              estabelecimentoConstrucaoCount,
              estabelecimentoReligiosoCount,
              estabelecimentoEnsinoCount,
              estabelecimentoSaudeCount,
              domicilioColetivoCount,
              estabelecimentoAgroCount,
              info,
              iconName,
              isPolygon,
              polygonCoordinates
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          insertStatement.run(
            parseFloat(lat),
            parseFloat(lng),
            parseInt(estabelecimentoFinalidadesCount),
            parseInt(domicilioParticularCount),
            parseInt(estabelecimentoConstrucaoCount),
            parseInt(estabelecimentoReligiosoCount),
            parseInt(estabelecimentoEnsinoCount),
            parseInt(estabelecimentoSaudeCount),
            parseInt(domicilioColetivoCount),
            parseInt(estabelecimentoAgroCount),
            null,
            'customIcon1',
            0,
            null
          );

          insertStatement.finalize();
      });
  }

  getPoints (): Promise<PointData[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM points', (err, rows: PointData[]) => {
        if (err) {
          console.error('[GET_POINTS] Erro:', err);
          reject(err);
        }

        resolve(rows);
      });
    });
  }

  async insertPoint (point: InsertPointData): Promise<void> {
    try {
      let insertStatement: sqlite3.Statement;
      
      if (point.isPolygon) {
        insertStatement = this.db.prepare(`
          INSERT INTO points (
            lat,
            lng,
            estabelecimentoFinalidadesCount,
            domicilioParticularCount,
            estabelecimentoConstrucaoCount,
            estabelecimentoReligiosoCount,
            estabelecimentoEnsinoCount,
            estabelecimentoSaudeCount,
            domicilioColetivoCount,
            estabelecimentoAgroCount,
            info,
            iconName,
            isPolygon,
            polygonCoordinates
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const polygonCoordinates = point.polygonCoordinates?.map(c => `${c.lat},${c.lng}`).join('|');

        insertStatement.run(
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          point.iconName,
          point.isPolygon ? 1 : 0,
          polygonCoordinates
        );
      } else {
        insertStatement = this.db.prepare(`
          INSERT INTO points (lat, lng, info, iconName)
          VALUES (?, ?, ?, ?)
       `);

        insertStatement.run(
          point.lat,
          point.lng,
          point.info,
          point.iconName
        );
      }

      insertStatement.finalize();
    } catch (error) {
      console.error('[INSERT_POINTS] Erro:', error);
    }
  }
}