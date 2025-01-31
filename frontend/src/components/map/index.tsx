import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import { type DrawEvents, Icon, LatLng, Popup as LPopup, Polygon as LPolygon, Layer, Map as LMap } from 'leaflet';
import { EditControl } from 'react-leaflet-draw';

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
}

type MarkerData = {
  lat: number;
  lng: number;
  iconName: string;
  domicilioParticularCount: number;
  info?: string;
  isPolygon: boolean;
  polygonCoordinates: { lat: number; lng: number }[]
}

type LayerData = {
  layer: Layer,
  isShown: boolean;
  iconName: string;
}

const customIcons: {
  [key: string]: Icon
} = {
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

const fetchData = async (coordinates: { lat: number; lng: number; }) => {
  return fetch(`${process.env.VITE_APP_API_URL}/osm/info?lat=${coordinates.lat}&lng=${coordinates.lng}`, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
    .then(response => response.json())
    .catch(console.error);
}

const fetchPoints = async () => {
  return fetch(`${process.env.VITE_APP_API_URL}/osm/points`,
    {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
    }
  )
    .then(response => response.json())
    .catch(console.error);
}

const insertPoint = (point: any) => {
  fetch(`${process.env.VITE_APP_API_URL}/osm/points`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify(point)
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
  const mapRef = useRef<LMap>(null);
  
  const [average, setAverage] = useState<number>(0);
  const [median, setMedian] = useState<number>(0);
  const [areaSum, setAreaSum] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [selectedIconName, setSelectedIconName] = useState<string>('customIcon1');
  const selectedIconNameRef = useRef<string>(selectedIconName);

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
  
  const onCreated = async (evt: DrawEvents.Created) => {
    const layer = evt.layer as any;
    const isPoint = !!layer._latlng;
    
    if (isPoint) {
      const coordinates = (evt.layer as any)._latlng;
      
      const data = await fetchData(coordinates);

      if (data) {
        data.display_name && evt.layer.bindPopup(new LPopup({ content: `
          <h2>Dados</h2>
          <hr />
          <p>${data.display_name}</p>
        `}));
      }

      insertPoint({
        lat: coordinates.lat,
        lng: coordinates.lng,
        info: data?.display_name || null,
        iconName: selectedIconNameRef.current
      });
    } else {
      evt.layer.bindPopup(new LPopup({ content: 'TESTE' }));

      const [polygonLatLngs] = layer._latlngs;

      insertPoint({
        isPolygon: true,
        iconName: 'polygonPin',
        polygonCoordinates: polygonLatLngs
      })
    }
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
    try {
      fetchPoints()
        .then(allPoints => {
          setMarkers(
            allPoints.map((p: any) => {
              return {
                lat: p.lat,
                lng: p.lng,
                iconName: p.iconName,
                info: p.info,
                isPolygon: !!p.isPolygon,
                ...(!p.isPolygon && { domicilioParticularCount: p.domicilioParticularCount }),
                ...(p.isPolygon && { polygonCoordinates: p.polygonCoordinates.split('|').map((pc: any) => {
                  const [lat, lng] = pc.split(',');
    
                  return {
                    lat: parseFloat(lat),
                    lng: parseFloat(lng)
                  }
                })})
              }
            })
          )
        })
        .catch(console.error);

    } catch (error) {
      console.log('[FETCH_POINTS] Erro:', error);
    }
  }, []);

  useEffect(() => {
    const mapLayerCount = mapLayers.reduce((prev, curr) => {
      const layer = (curr.layer as any);
      const isPolygon = !!layer._latlngs;

      return prev + (isPolygon ? layer._latlngs[0].length : 1);
    }, 0);
    setTotalPoints(mapLayerCount);
    setAreaSum(polygons.reduce((prev, curr) => prev + curr.area, 0))
    setAverage(calcAverage(polygons));
    setMedian(calcMedian(polygons));
  }, [mapLayers, markers, polygons]);

  useEffect(() => {
    setMapLayers(storedMapLayers => {
      return storedMapLayers.map(ml => {
        const isPoint = !!(ml.layer as any)._latlng;
  
        if (isPoint) {
          if (!selectedMarkerTypes.includes(ml.iconName)) {
            ml.isShown && mapRef.current!.removeLayer(ml.layer);
            ml.isShown = false;
          } else {
            !ml.isShown && mapRef.current!.addLayer(ml.layer);
            ml.isShown = true;
          }
        }
  
        return ml;
      });
    });

  }, [selectedMarkerTypes]);

  const IconMapFilter = () => {
    const map = useMap();
    mapRef.current = map; 

    return null;
  }

	return (
    <>
		<MapContainer
      center={[-20.314203858242326, -50.55221557617188]}
			zoom={13}
		>
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			/>
      <FeatureGroup
        eventHandlers={{
          layeradd: (evt) => {
            const layer = evt.layer as any;
            const isPolygon = !!layer._latlngs;

            if (isPolygon) {
              setPolygons(storedPolygons => {
                const polygonLatLngs = (layer as LPolygon).getLatLngs()[0] as LatLng[];
        
                return [
                  ...storedPolygons, {
                    id: layer._leaflet_id,
                    pins: polygonLatLngs,
                    area: calcPolygonArea(polygonLatLngs),
                    iconName: 'pinPolygon',
                  }
                ];
              });
            }

            setMapLayers(storedMapLayers => [...storedMapLayers, {
              layer: evt.layer,
              isShown: true,
              iconName: selectedIconNameRef.current
            }]);
          },
          layerremove: (evt) => {
            const layer = (evt.layer as any);
            const isPolygon = !!layer._latlngs;

            if (isPolygon) {
              setPolygons(storedPolygons => {
                const remainingPolygons = storedPolygons.filter((p) => p.id !== layer._leaflet_id);
      
                return [...remainingPolygons];
              });
            }

            setMapLayers(storedMapLayers => {
              const remainingMapLayers = storedMapLayers.filter(ml => (ml.layer as any)._leaflet_id !==  layer._leaflet_id);

              return [...remainingMapLayers];
            });
          },
        }}
      >
        <EditControl
          position='topright'
          onCreated={onCreated}
          draw={{
            rectangle: false,
            circle: false,
            polyline: false,
            circlemarker: false,
            marker: {
              icon: customIcons[selectedIconName]
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
              icon: customIcons['pinPolygon']
            },
          }}
        />
        {markers.map((marker, idx) => (
          marker.isPolygon ? (
            <Polygon
              key={idx}
              positions={marker.polygonCoordinates.map(pc => [pc.lat, pc.lng])}
              color='#97009c'
            >
              <Popup>
                TESTE
              </Popup>
            </Polygon>
          ) : (
            <Marker
              key={idx}
              position={[marker.lat, marker.lng]}
              icon={customIcons[marker.iconName]}
            >
              {marker.domicilioParticularCount && (
                <Popup>
                  <p><b>Total de Domicílios:</b> {marker.domicilioParticularCount}</p>
                  <hr />
                </Popup>
              )}
              {marker.info && (
                <Popup>
                  <h2>Dados</h2>
                  <hr />
                  <p>{marker.info}</p>
                </Popup>
              )}
            </Marker>
          )
        ))}
        <IconMapFilter />
      </FeatureGroup>
		</MapContainer>
    <div id="polygon-stats">
      <h2>Informações</h2>
      <hr />
      <p>Total de pontos: {totalPoints}</p>
      <p>Soma das áreas: {areaSum.toFixed(4)}</p>
      <p>Média das áreas: {average.toFixed(4)}</p>
      <p>Mediana das áreas: {median.toFixed(4)}</p>
    </div>
    <div id="selector-box">
      <label htmlFor="selectedIcon">Selecione um ícone do marcador: </label>
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
