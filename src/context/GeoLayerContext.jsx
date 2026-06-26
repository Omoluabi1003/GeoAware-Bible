'use client';

import { createContext, useContext, useMemo } from 'react';
import { GEO_LAYER_TYPES, buildActiveGeoLayers, GeoLayerRegistry } from '../data/geoLayerRegistry.js';

const defaultActiveTypes = Object.freeze(Object.values(GEO_LAYER_TYPES));

export const GeoLayerContext = createContext(Object.freeze({
  registry: GeoLayerRegistry,
  activeTypes: defaultActiveTypes,
  activeLayers: buildActiveGeoLayers(defaultActiveTypes),
  isLayerActive: () => false
}));

export function GeoLayerProvider({ activeTypes = defaultActiveTypes, children }) {
  const normalizedTypes = useMemo(() => Object.freeze([...new Set(activeTypes)]), [activeTypes]);
  const value = useMemo(() => Object.freeze({
    registry: GeoLayerRegistry,
    activeTypes: normalizedTypes,
    activeLayers: buildActiveGeoLayers(normalizedTypes),
    isLayerActive: (type) => normalizedTypes.includes(type)
  }), [normalizedTypes]);

  return <GeoLayerContext.Provider value={value}>{children}</GeoLayerContext.Provider>;
}

export function useGeoLayers() {
  return useContext(GeoLayerContext);
}
