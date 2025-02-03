import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import { Icon, Popup as LPopup, Polygon as LPolygon, Layer, Map as LMap, Marker as LMarker } from 'leaflet';
import { EditControl } from 'react-leaflet-draw';

import generateId from '../../utils/generateId';

import customIcon1 from '../../assets/marker_01.png';
import customIcon2 from '../../assets/marker_02.png';
import customIcon3 from '../../assets/marker_03.png';
import markerShadow from '../../assets/marker-shadow.png';
import pinPolygon from '../../assets/pin-polygon.png';

import './index.css';

type PolygonData = {
  id: number;
  pins: { lat: number; lng: number; }[];
  area: number;
  iconName: string;
  isShown: boolean;
};

type MarkerData = {
  id: number;
  lat: number;
  lng: number;
  iconName: string;
  domicilioParticularCount?: number;
  info?: string;
  isShown: boolean;
  createdFromControls: boolean;
};

type LayerData = {
  id: number;
  layer: Layer,
  isShown: boolean;
  iconName: string;
  isPolygon: boolean;
  createdFromControls: boolean;
};

const customIcons: Record<string, Icon> = {
  'customIcon1': new Icon({
    iconUrl: customIcon1,
    iconRetinaUrl: customIcon1,
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41]
  }),
  'customIcon2': new Icon({
    iconUrl: customIcon2,
    iconRetinaUrl: customIcon2,
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41]
  }),
  'customIcon3': new Icon({
    iconUrl: customIcon3,
    iconRetinaUrl: customIcon3,
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41]
  }),
  'pinPolygon': new Icon({
    iconUrl: pinPolygon,
    iconRetinaUrl: pinPolygon,
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41]
  })
};

const fetchMarkerInfo = async (coordinates: { lat: number; lng: number; }) => {
  return fetch(`${process.env.VITE_APP_API_URL}/osm/info?lat=${coordinates.lat}&lng=${coordinates.lng}`, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
  .then(response => response.json())
  .catch(console.error);
}

const fetchFeatures = async () => {
  return fetch(`${process.env.VITE_APP_API_URL}/osm/features`,
    {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
    }
  )
  .then(response => response.json())
  .catch(console.error);
}

const insertFeature  = (feature: any) => {
  fetch(`${process.env.VITE_APP_API_URL}/osm/features`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify(feature)
  })
  .catch(console.error);
}

export default function Map() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [selectedMarkerTypes, setSelectedMarkerTypes] = useState<string[]>([
    'customIcon1', 'customIcon2', 'customIcon3'
  ]);
  const [mapLayers, setMapLayers] = useState<LayerData[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [median, setMedian] = useState<number>(0);
  const [areaSum, setAreaSum] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [selectedIconName, setSelectedIconName] = useState<string>('customIcon1');
  const selectedIconNameRef = useRef<string>(selectedIconName);
  const [hiddenFeaturesIds, setHiddenFeaturesIds] = useState<string[]>([]);
  const isErasingRef = useRef<boolean>(false);
  const mapRef = useRef<LMap>(null);

  const calcPolygonArea = (coordinates: { lat: number; lng: number }[]) => {
    const area = coordinates.reduce((prev, curr, idx) => {
      const { lat: x1, lng: y1} = curr;
      const { lat: x2, lng: y2} = coordinates[(idx + 1) % coordinates.length];

      return prev + (x1 * x2 - y1 * y2);
    }, 0);

    return Math.abs(area / 2);
  }

  const calcAverage = (polygonData: PolygonData[]) => {
    if (polygonData.length === 0) return 0;

    return polygonData.reduce((prev, curr) => prev + curr.area, 0) / polygonData.length;
  }

  const calcMedian = (polygons: PolygonData[]) => {
    if (polygons.length === 0) return 0;

    const values = polygons.map(point => point.area).sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);

    if (values.length % 2 === 0) {
      return (values[middle - 1] + values[middle]) / 2;
    }

    return values[middle];
  };

  const onCreated = async (evt: any) => {
    const layer = evt.layer;
    const isPolygon = !!layer._latlngs;
    const featureId = generateId();

    if (isPolygon) {
      evt.layer.bindPopup(new LPopup({
        content: `
        <h2>Dados</h2>
        <p>TESTE POLIGONO</p>
        <hr />`
      }));

      setPolygons(storedPolygons => (
        [
          ...storedPolygons,
          {
            id: featureId,
            pins: layer._latlngs[0],
            area: calcPolygonArea(layer._latlngs[0]),
            iconName: 'pinPolygon',
            isShown: true,
          }
        ]
      ));

      insertFeature({
        iconName: 'polygonPin',
        isPolygon: true,
        polygonCoordinates: layer._latlngs[0]
      });
    } else {
      const info = await fetchMarkerInfo({
        lat: layer._latlng.lat,
        lng: layer._latlng.lng
      });

      if (info) {
        evt.layer.bindPopup(new LPopup({ content: `
          <h2>Dados</h2>
          <hr />
          <p>${info.display_name}</p>
          `
        }));
      }

      insertFeature({
        lat: layer._latlng.lat,
        lng: layer._latlng.lng,
        info: info?.display_name || null,
        iconName: selectedIconNameRef.current,
        isPolygon: false
      });
    }

    setMapLayers(storedMapLayers => (
      [
        ...storedMapLayers,
        {
          id: featureId,
          layer,
          isPolygon,
          iconName: selectedIconNameRef.current,
          isShown: true,
          createdFromControls: true
        }
      ]
    ));
  }

  const onIconChange = (evt: any) => {
    setSelectedIconName(() => {
      selectedIconNameRef.current = evt.target.value;
      return evt.target.value;
    });
  }

  const onMarkerTypesChange = (evt: any) => {
    setSelectedMarkerTypes([...evt.target.selectedOptions].map(e => e.value));
  }
  
  useEffect(() => {
    fetchFeatures()
    .then(allFeatures => {
      if (allFeatures) {
        const features = allFeatures.map((p: any) => {
          return {
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            iconName: p.iconName,
            info: p.info,
            isPolygon: !!p.isPolygon,
            ...(!p.isPolygon && { domicilioParticularCount: p.domicilioParticularCount }),
            ...(p.isPolygon && {
              polygonCoordinates: p.polygonCoordinates.split('|').map((pc: any) => {
                const [lat, lng] = pc.split(',');
                
                return {
                  lat: parseFloat(lat),
                  lng: parseFloat(lng),
                }
              })
            })
          };
        });

        const pols: PolygonData[] = [];
        const mks: MarkerData[] = [];
        const lds: LayerData[] = [];

        features.forEach((f: any) => {
          let layer;

          if (f.isPolygon) {
            const lp = new LPolygon(f.polygonCoordinates, {
              color: '#97009c',
            });

            layer = lp;

            pols.push({
              id: f.id,
              area: calcPolygonArea(f.polygonCoordinates),
              iconName: f.iconName,
              pins: f.polygonCoordinates,
              isShown: true
            });

            lds.push({
              id: f.id,
              iconName: f.iconName,
              isShown: true,
              layer: lp,
              isPolygon: true,
              createdFromControls: false
            });
          } else {
            const l = new LMarker([f.lat, f.lng], {
              icon: f.iconName ? customIcons[f.iconName] : customIcons.customIcon1
            });

            l.bindPopup(new LPopup({
              content: `
                <p><b>Total de Domicílios:</b> ${f.domicilioParticularCount}</p>
                <hr />`
            }));

            layer = l;

            mks.push({
              id: f.id,
              lat: parseFloat(f.lat),
              lng: parseFloat(f.lng),
              domicilioParticularCount: f.domicilioParticularCount,
              iconName: f.iconName,
              isShown: true,
              createdFromControls: false
            });

            lds.push({
              id: f.id,
              iconName: f.iconName,
              isShown: true,
              layer: l,
              isPolygon: false,
              createdFromControls: false
            });
          }
        });
        
        setPolygons(storedPolygons => (
          [
            ...storedPolygons,
            ...pols
          ]
        ));
        
        setMarkers(storedMarkers => (
          [
            ...storedMarkers,
            ...mks
          ]
        ));

        setMapLayers(
          lds.map(m => ({
            id: m.id,
            layer: m.layer,
            iconName: m.iconName,
            isShown: m.isShown,
            isPolygon: m.isPolygon,
            createdFromControls: false
          }))
        );
      }
    })
    .catch(error => {
      console.log('[FETCH_FEATURES] Erro:', error);
    });
  }, []);

  useEffect(() => {
    const visibleMarkersIds: number[] = [];
    const hiddenFIds: string[] = [];

    setMapLayers(storedMapLayers => {
      const mm = storedMapLayers.map(ml => {
        const layer = (ml.layer as any);
        const isPolygon = !!layer._latlngs;

        if (isPolygon) return ml;
        
        if (!selectedMarkerTypes.includes(ml.iconName)) {
          hiddenFeaturesIds.push(`${layer._latlng.lat},${layer._latlng.lng}`);
          ml.isShown = false;
          ml.createdFromControls && mapRef.current!.removeLayer(ml.layer);
        } else {
          ml.isShown = true;
          visibleMarkersIds.push(ml.id);
          ml.createdFromControls && !mapRef.current!.hasLayer(ml.layer) && mapRef.current!.addLayer(ml.layer);
        }
  
        return ml;
      });

      setHiddenFeaturesIds(hiddenFIds);

      setMarkers(markers.map(m => ({
        ...m,
        isShown: visibleMarkersIds.includes(m.id)
      })));

      return [...mm];
    });

  }, [selectedMarkerTypes]);

  useEffect(() => {
    const mapLayerCount = mapLayers.reduce((prev, curr) => {
    const layer = curr.layer as any;
    const isPolygon = !!layer._latlngs;

      return prev + (isPolygon ? layer._latlngs[0].length : 1);
    }, 0);
    setTotalPoints(mapLayerCount);
    setAreaSum(polygons.reduce((prev, curr) => prev + curr.area, 0))
    setAverage(calcAverage(polygons));
    setMedian(calcMedian(polygons));
  }, [mapLayers, polygons]);

  function IconMapFilter () {
    mapRef.current = useMap(); 

    return null;
  }

	return (
    <>
		<MapContainer
      center={[-20.314203858242326, -50.55221557617188]}
			zoom={13}
		>
      <IconMapFilter />
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			/>
      <FeatureGroup
        eventHandlers={{
          layerremove: (evt) => {
            const layer = (evt.layer as any);
            const isPolygon = !!layer._latlngs;
            let layerId;
            
            if (isPolygon) {
              layerId = layer._latlngs[0].map(l => `${l.lat},${l.lng}`).join('|');

              if (hiddenFeaturesIds.includes(layerId)) return;

              setPolygons(storedPolygons => {
                const remainingPolygons = storedPolygons.filter((p) => {
                  return p.pins.map(l => `${l.lat},${l.lng}`).join('|') !== layerId;
                });
                
                return [...remainingPolygons];
              });
            } else {
              layerId = `${layer._latlng.lat},${layer._latlng.lng}`;

              if (!isErasingRef.current && !hiddenFeaturesIds.length || hiddenFeaturesIds.includes(layerId)) return;

              setMarkers(storedMarkers => {
                const remainingMarkers = storedMarkers.filter(m => `${m.lat},${m.lng}` !== layerId);

                return [...remainingMarkers];
              });
            }

            setMapLayers(storedMapLayers => {
              const layerIdsToRemove: string[] = [];
              const remainingMapLayers = storedMapLayers.filter(ml => {
                const l = ml.layer as any;
                let mLayerId;
                
                if (ml.isPolygon) {
                  mLayerId = l._latlngs[0].map(c => `${c.lat},${c.lng}`).join('|');
                } else {
                  mLayerId = `${l._latlng.lat},${l._latlng.lng}`;
                }

                if (layerId === mLayerId) {
                  layerIdsToRemove.push(layerId);
                  ml.createdFromControls && mapRef.current!.removeLayer(evt.layer);
                }

                return mLayerId !== layerId;
              });

              setHiddenFeaturesIds(hiddenFeaturesIds.filter(s => !layerIdsToRemove.includes(s)));

              return [...remainingMapLayers];
            });
          }
        }}
      >
        <EditControl
          position='topright'
          onCreated={onCreated}
          onDeleteStart={() => {
            isErasingRef.current = true;
          }}
          onDeleteStop={() => {
            isErasingRef.current = false;
          }}
          draw={{
            rectangle: false,
            circle: false,
            polyline: false,
            circlemarker: false,
            marker: {
              icon: customIcons[selectedIconName],
            },
            polygon: {
              allowIntersection: false,
              showArea: true,
              drawError: {
                color: '#e1e100',
                message: '<strong>Oh snap!<strong> you can\'t draw that!',
              },
              shapeOptions: {
                color: '#97009c',
              },
              metric: true,
              icon: customIcons.pinPolygon
            },
          }}
        />
        {polygons.map((p, idx) => (
          <Polygon
            key={idx}
            positions={p.pins.map(pc => [pc.lat, pc.lng])}
            color='#97009c'
          >
            <Popup>TESTE POLÍGONO</Popup>
          </Polygon>
        ))}
        {markers.map((m, idx) => (
          m.isShown && !m.createdFromControls && <Marker
              key={idx}
              position={[m.lat, m.lng]}
              icon={customIcons[m.iconName]}
            >
              {m.domicilioParticularCount !== null && (
                <Popup>
                  <p><b>Total de Domicílios:</b> {m.domicilioParticularCount}</p>
                  <hr />
                </Popup>
              )}
              {m.info && (
                <Popup>
                  <h2>Dados</h2>
                  <hr />
                  <p>{m.info}</p>
                </Popup>
              )}
            </Marker>
          )
        )}
      </FeatureGroup>
		</MapContainer>
    <div id="features-stats">
      <h2>Informações</h2>
      <hr />
      <p>Total de pontos: {totalPoints}</p>
      <p>Soma das áreas: {areaSum.toFixed(4)}</p>
      <p>Média das áreas: {average.toFixed(4)}</p>
      <p>Mediana das áreas: {median.toFixed(4)}</p>
    </div>
    <div id="selector-box">
      <label htmlFor="selectedIcon">Selecione um ícone do marcador:</label>
      <select name="selectedIcon" value={selectedIconName} onChange={onIconChange}>
        <option value="customIcon1">Ícone 1</option>
        <option value="customIcon2">Ícone 2</option>
        <option value="customIcon3">Ícone 3</option>
      </select>
      <label htmlFor="selectedMarkerTypes">Selecione o tipo de marcador: </label>
      <select
        name="selectedMarkerTypes"
        multiple
        onChange={onMarkerTypesChange}
        defaultValue={selectedMarkerTypes}
      >
        <option value="customIcon1">Marcador 1</option>
        <option value="customIcon2">Marcador 2</option>
        <option value="customIcon3">Marcador 3</option>
      </select>
    </div>
    </>
	);
}
