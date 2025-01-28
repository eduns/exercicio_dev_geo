import { useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { type DrawEvents, Icon, Popup } from 'leaflet';
import { EditControl } from 'react-leaflet-draw';

import customIcon1 from '../../assets/marker_01.png';
import customIcon2 from '../../assets/marker_02.png';
import customIcon3 from '../../assets/marker_03.png';

import 'leaflet/dist/leaflet.css';
import './index.css';

const customIcons: {
  [key: string]: Icon
} = {
  'customIcon1': new Icon({
    iconUrl: customIcon1,
    iconRetinaUrl: customIcon1,
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  }),
  'customIcon2': new Icon({
    iconUrl: customIcon2,
    iconRetinaUrl: customIcon2,
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  }),
  'customIcon3': new Icon({
    iconUrl: customIcon3,
    iconRetinaUrl: customIcon3,
    iconSize: [50, 50],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  })
};

export default function Map() {
  const [selectedIcon, setSelectedIcon] = useState<string>('customIcon1');

  const onCreated = (evt: DrawEvents.Created) => {
    if (evt.layerType === 'marker') {
      evt.layer.bindPopup(new Popup({ content: 'TESTE' }));
    }
  }

  const onIconChange = (evt: any) => {
    setSelectedIcon(evt.target.value);
  };

	return (
    <>
		<MapContainer
      center={[-23.1896, -45.8841]}
			zoom={13}
		>
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			/>
      <FeatureGroup>
        <EditControl
          position='topright'
          onCreated={onCreated}
          draw={{
            rectangle: false,
            circle: false,
            polyline: false,
            circlemarker: false,
            marker: {
              icon: customIcons[selectedIcon]
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
              icon: customIcons[selectedIcon]
            },
          }}
        />
      </FeatureGroup>
		</MapContainer>
    <div className="icon-selector">
      <label htmlFor="icon-select">Selecionar Ícone:</label>
      <select id="icon-select" value={selectedIcon} onChange={onIconChange}>
        <option value="customIcon1">Ícone 1</option>
        <option value="customIcon2">Ícone 2</option>
        <option value="customIcon3">Ícone 3</option>
      </select>
    </div>
    </>
	);
}
