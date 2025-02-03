import { createRoot } from 'react-dom/client';

import App from './App.tsx';

import './index.css';

// @ts-ignore
window.type = ''; // fix buggy behaviour from react-leaflet-draw

createRoot(document.getElementById('root')!).render(
	<App />
);
