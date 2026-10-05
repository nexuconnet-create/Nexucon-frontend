/**
 * Geospatial Coordinate Conversion & Building Polygon Analysis Utility
 * Supports:
 * - Decimal Degrees (WGS84 DD)
 * - Degrees, Minutes, Seconds (DMS)
 * - UTM (Universal Transverse Mercator) Zone 31N and Zone 32N (WGS84 and Nigerian Minna Datum)
 * - 4-corner building boundary mapping, center point calculation, and footprint area (Shoelace)
 */

export type CoordinateSystem =
  | 'WGS84_DD'
  | 'DMS'
  | 'UTM_31N_WGS84'
  | 'UTM_31N_MINNA'
  | 'UTM_32N_WGS84'
  | 'UTM_32N_MINNA';

export interface CornerInput {
  id: number;
  label: string; // e.g. "Corner 1 (NW)", "Corner 2 (NE)", etc.
  // Decimal Degrees
  lat?: number | string;
  lng?: number | string;
  // DMS
  latDeg?: number | string;
  latMin?: number | string;
  latSec?: number | string;
  latDir?: 'N' | 'S';
  lngDeg?: number | string;
  lngMin?: number | string;
  lngSec?: number | string;
  lngDir?: 'E' | 'W';
  // UTM
  easting?: number | string;
  northing?: number | string;
}

export interface ConvertedCorner {
  id: number;
  label: string;
  lat: number;
  lng: number;
  formattedLatDms: string;
  formattedLngDms: string;
  easting: number;
  northing: number;
  utmZone: string;
}

export interface ConversionResult {
  system: CoordinateSystem;
  corners: ConvertedCorner[];
  center: {
    lat: number;
    lng: number;
    formattedLatDms: string;
    formattedLngDms: string;
  };
  footprintAreaSqm: number;
  perimeterMeters: number;
  googleMapsUrl: string;
}

// -------------------------------------------------------------
// Mathematical UTM to Lat/Long & Inverse Algorithms
// -------------------------------------------------------------

export function utmToLatLon(
  easting: number,
  northing: number,
  zone: number = 31,
  northernHemisphere: boolean = true,
  datum: 'WGS84' | 'MINNA' = 'WGS84'
): { lat: number; lng: number } {
  let a = 6378137.0;
  let f = 1 / 298.257223563;
  if (datum === 'MINNA') {
    a = 6378249.145; // Clarke 1880 RGS
    f = 1 / 293.465;
  }

  const b = a * (1 - f);
  const e = Math.sqrt(1 - (b * b) / (a * a));
  const ePrimeSq = (a * a - b * b) / (b * b);
  const k0 = 0.9996;

  const x = easting - 500000.0;
  const y = northernHemisphere ? northing : northing - 10000000.0;

  const M = y / k0;
  const mu =
    M /
    (a *
      (1 -
        (e * e) / 4 -
        (3 * Math.pow(e, 4)) / 64 -
        (5 * Math.pow(e, 6)) / 256));

  const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu) +
    ((1097 * Math.pow(e1, 4)) / 512) * Math.sin(8 * mu);

  const N1 = a / Math.sqrt(1 - e * e * Math.pow(Math.sin(phi1), 2));
  const T1 = Math.pow(Math.tan(phi1), 2);
  const C1 = ePrimeSq * Math.pow(Math.cos(phi1), 2);
  const R1 =
    (a * (1 - e * e)) /
    Math.pow(1 - e * e * Math.pow(Math.sin(phi1), 2), 1.5);
  const D = x / (N1 * k0);

  let lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      ((D * D) / 2 -
        (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ePrimeSq) *
          (Math.pow(D, 4) / 24) +
        (61 +
          90 * T1 +
          298 * C1 +
          45 * T1 * T1 -
          252 * ePrimeSq -
          3 * C1 * C1) *
          (Math.pow(D, 6) / 720));
  lat = (lat * 180) / Math.PI;

  const lonOrigin = (zone - 1) * 6 - 180 + 3;
  let lng =
    lonOrigin +
    (((D -
      (1 + 2 * T1 + C1) * (Math.pow(D, 3) / 6) +
      (5 -
        2 * C1 +
        28 * T1 -
        3 * C1 * C1 +
        8 * ePrimeSq +
        24 * T1 * T1) *
        (Math.pow(D, 5) / 120)) /
      Math.cos(phi1)) *
      180) /
      Math.PI;

  if (datum === 'MINNA') {
    // 3-parameter shift from Minna to WGS84 for Nigeria (dx=-92, dy=-93, dz=122)
    lat += 0.000305;
    lng -= 0.00085;
  }

  return { lat, lng };
}

export function latLonToUtm(
  lat: number,
  lon: number,
  forcedZone?: number,
  datum: 'WGS84' | 'MINNA' = 'WGS84'
): { easting: number; northing: number; zone: number } {
  let adjustedLat = lat;
  let adjustedLon = lon;

  let a = 6378137.0;
  let f = 1 / 298.257223563;
  if (datum === 'MINNA') {
    a = 6378249.145;
    f = 1 / 293.465;
    adjustedLat -= 0.000305;
    adjustedLon += 0.00085;
  }

  const b = a * (1 - f);
  const e = Math.sqrt(1 - (b * b) / (a * a));
  const ePrimeSq = (a * a - b * b) / (b * b);
  const k0 = 0.9996;

  const zone = forcedZone ?? Math.floor((adjustedLon + 180) / 6) + 1;
  const lonOrigin = (zone - 1) * 6 - 180 + 3;
  const lonOriginRad = (lonOrigin * Math.PI) / 180;

  const latRad = (adjustedLat * Math.PI) / 180;
  const lonRad = (adjustedLon * Math.PI) / 180;

  const N = a / Math.sqrt(1 - e * e * Math.pow(Math.sin(latRad), 2));
  const T = Math.pow(Math.tan(latRad), 2);
  const C = ePrimeSq * Math.pow(Math.cos(latRad), 2);
  const A = Math.cos(latRad) * (lonRad - lonOriginRad);

  const M =
    a *
    ((1 -
      (e * e) / 4 -
      (3 * Math.pow(e, 4)) / 64 -
      (5 * Math.pow(e, 6)) / 256) *
      latRad -
      ((3 * e * e) / 8 +
        (3 * Math.pow(e, 4)) / 32 +
        (45 * Math.pow(e, 6)) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * Math.pow(e, 4)) / 256 + (45 * Math.pow(e, 6)) / 1024) *
        Math.sin(4 * latRad) -
      ((35 * Math.pow(e, 6)) / 3072) * Math.sin(6 * latRad));

  const easting =
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * ePrimeSq) * Math.pow(A, 5)) /
          120) +
    500000.0;

  let northing =
    k0 *
    (M +
      N *
        Math.tan(latRad) *
        ((A * A) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * ePrimeSq) *
            Math.pow(A, 6)) /
            720));

  if (adjustedLat < 0) {
    northing += 10000000.0;
  }

  return { easting, northing, zone };
}

// -------------------------------------------------------------
// DMS to DD & DD to DMS Conversion
// -------------------------------------------------------------

export function dmsToDd(
  deg: number,
  min: number,
  sec: number,
  direction: 'N' | 'S' | 'E' | 'W' = 'N'
): number {
  let dd = Math.abs(deg) + (Math.abs(min) || 0) / 60 + (Math.abs(sec) || 0) / 3600;
  if (direction === 'S' || direction === 'W') {
    dd = -dd;
  }
  return dd;
}

export function ddToDms(
  dd: number,
  isLatitude: boolean
): { degrees: number; minutes: number; seconds: number; direction: string } {
  const abs = Math.abs(dd);
  const degrees = Math.floor(abs);
  const minutesNotTrunc = (abs - degrees) * 60;
  const minutes = Math.floor(minutesNotTrunc);
  const seconds = parseFloat(((minutesNotTrunc - minutes) * 60).toFixed(2));
  const direction = isLatitude
    ? dd >= 0
      ? 'N'
      : 'S'
    : dd >= 0
    ? 'E'
    : 'W';

  return { degrees, minutes, seconds, direction };
}

export function formatDms(dd: number, isLatitude: boolean): string {
  const { degrees, minutes, seconds, direction } = ddToDms(dd, isLatitude);
  return `${degrees}° ${minutes}' ${seconds.toFixed(2)}" ${direction}`;
}

// -------------------------------------------------------------
// 4-Corner Calculations (Center, Area, Perimeter)
// -------------------------------------------------------------

export function calculatePolygonCenter(
  points: { lat: number; lng: number }[]
): { lat: number; lng: number } {
  if (points.length === 0) return { lat: 0, lng: 0 };
  const sumLat = points.reduce((acc, p) => acc + p.lat, 0);
  const sumLng = points.reduce((acc, p) => acc + p.lng, 0);
  return {
    lat: parseFloat((sumLat / points.length).toFixed(6)),
    lng: parseFloat((sumLng / points.length).toFixed(6)),
  };
}

export function calculateFootprintAreaSqm(
  utmPoints: { easting: number; northing: number }[]
): number {
  if (utmPoints.length < 3) return 0;
  // Shoelace formula in projected metric Cartesian coordinates
  let sum = 0;
  const n = utmPoints.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += utmPoints[i].easting * utmPoints[j].northing;
    sum -= utmPoints[j].easting * utmPoints[i].northing;
  }
  return parseFloat((Math.abs(sum) / 2).toFixed(2));
}

export function calculatePerimeterMeters(
  utmPoints: { easting: number; northing: number }[]
): number {
  if (utmPoints.length < 2) return 0;
  let perimeter = 0;
  const n = utmPoints.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = utmPoints[j].easting - utmPoints[i].easting;
    const dy = utmPoints[j].northing - utmPoints[i].northing;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return parseFloat(perimeter.toFixed(2));
}

// -------------------------------------------------------------
// Master 4-Corner Conversion Pipeline
// -------------------------------------------------------------

export function convertCorners(
  system: CoordinateSystem,
  inputs: CornerInput[]
): ConversionResult {
  const converted: ConvertedCorner[] = inputs.map((corner, index) => {
    let lat = 0;
    let lng = 0;
    let easting = 0;
    let northing = 0;
    let utmZone = '31N';

    if (system === 'WGS84_DD') {
      lat = parseFloat(String(corner.lat || 0)) || 0;
      lng = parseFloat(String(corner.lng || 0)) || 0;
      const utm = latLonToUtm(lat, lng, 31, 'WGS84');
      easting = parseFloat(utm.easting.toFixed(2));
      northing = parseFloat(utm.northing.toFixed(2));
      utmZone = `${utm.zone}N`;
    } else if (system === 'DMS') {
      const latDeg = parseFloat(String(corner.latDeg || 0)) || 0;
      const latMin = parseFloat(String(corner.latMin || 0)) || 0;
      const latSec = parseFloat(String(corner.latSec || 0)) || 0;
      const latDir = corner.latDir || 'N';

      const lngDeg = parseFloat(String(corner.lngDeg || 0)) || 0;
      const lngMin = parseFloat(String(corner.lngMin || 0)) || 0;
      const lngSec = parseFloat(String(corner.lngSec || 0)) || 0;
      const lngDir = corner.lngDir || 'E';

      lat = dmsToDd(latDeg, latMin, latSec, latDir);
      lng = dmsToDd(lngDeg, lngMin, lngSec, lngDir);

      const utm = latLonToUtm(lat, lng, 31, 'WGS84');
      easting = parseFloat(utm.easting.toFixed(2));
      northing = parseFloat(utm.northing.toFixed(2));
      utmZone = `${utm.zone}N`;
    } else if (
      system === 'UTM_31N_WGS84' ||
      system === 'UTM_31N_MINNA' ||
      system === 'UTM_32N_WGS84' ||
      system === 'UTM_32N_MINNA'
    ) {
      const eVal = parseFloat(String(corner.easting || 0)) || 0;
      const nVal = parseFloat(String(corner.northing || 0)) || 0;
      const zoneNum = system.includes('32N') ? 32 : 31;
      const datumType = system.includes('MINNA') ? 'MINNA' : 'WGS84';

      const res = utmToLatLon(eVal, nVal, zoneNum, true, datumType);
      lat = parseFloat(res.lat.toFixed(6));
      lng = parseFloat(res.lng.toFixed(6));
      easting = eVal;
      northing = nVal;
      utmZone = `${zoneNum}N`;
    }

    return {
      id: corner.id ?? index + 1,
      label: corner.label || `Corner ${index + 1}`,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      formattedLatDms: formatDms(lat, true),
      formattedLngDms: formatDms(lng, false),
      easting,
      northing,
      utmZone,
    };
  });

  const center = calculatePolygonCenter(converted);
  const utmPoints = converted.map((c) => ({
    easting: c.easting,
    northing: c.northing,
  }));
  const footprintAreaSqm = calculateFootprintAreaSqm(utmPoints);
  const perimeterMeters = calculatePerimeterMeters(utmPoints);

  const googleMapsUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}&t=k`;

  return {
    system,
    corners: converted,
    center: {
      lat: center.lat,
      lng: center.lng,
      formattedLatDms: formatDms(center.lat, true),
      formattedLngDms: formatDms(center.lng, false),
    },
    footprintAreaSqm,
    perimeterMeters,
    googleMapsUrl,
  };
}

export const convertFourCorners = convertCorners;
