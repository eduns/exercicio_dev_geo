import sqlite3 from 'sqlite3';
import { parse } from 'csv-parse';
import fs from 'fs';
import { resolve } from 'path';

import FeaturesDatabase, { FeatureData, InsertFeatureData } from '../../interfaces/FeaturesDatabase';

import generateId from '../../utils/generateId';

const FILE_PATH = resolve(import.meta.dirname, '..', '..', '..', '..', 'files', 'base_jales_separado_virgula.csv');

export default class InMemoryFeaturesDatabase implements FeaturesDatabase {
  private readonly db = new sqlite3.Database(resolve(import.meta.dirname, 'features.db'), sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error('[DB] Erro:', err.message);
  });

  constructor () {
    this.db.exec(`
      DROP TABLE IF EXISTS features;

      CREATE TABLE features (
        id INTEGER PRIMARY KEY NOT NULL,
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
      .pipe(parse({ delimiter: ',', fromLine: 2, toLine: 101 }))
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
          INSERT INTO features (
            id,
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
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertStatement.run(
          generateId(),
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

  getFeatures (): Promise<FeatureData[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM features', (err, rows: FeatureData[]) => {
        if (err) {
          console.error('[GET_FEATURES] Erro:', err);
          reject(err);
        }

        resolve(rows);
      });
    });
  }

  insertFeature (feature: InsertFeatureData): Promise<void> {
    const featureId = generateId();
    let insertStatement: sqlite3.Statement;

    try {
      if (feature.isPolygon) {
        insertStatement = this.db.prepare(`
          INSERT INTO features (
            id,
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
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const polygonCoordinates = feature.polygonCoordinates?.map(c => `${c.lat},${c.lng}`).join('|');

        insertStatement.run(
          featureId,
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
          feature.iconName,
          feature.isPolygon ? 1 : 0,
          polygonCoordinates
        );
      } else {
        insertStatement = this.db.prepare(`
          INSERT INTO features (id, lat, lng, info, iconName, isPolygon)
          VALUES (?, ?, ?, ?, ?, ?)
       `);

        insertStatement.run(
          featureId,
          feature.lat,
          feature.lng,
          feature.info,
          feature.iconName,
          0
        );
      }

      insertStatement.finalize();
    } catch (error) {
      console.error('[INSERT_FEATURE] Erro:', error);
    }
  }
}