/**
 * Discriminated union for backend JSON fields that may carry a GeoJSON
 * FeatureCollection, a Feature, or a bare Geometry (e.g. `Task.geometries`).
 *
 * Narrow with `.type === 'FeatureCollection' | 'Feature' | …` and TypeScript
 * will refine the variable to the precise GeoJSON type — no leaf casts needed.
 * Note that `Geometry` itself is a union including `GeometryCollection`, which
 * does not have `coordinates`; use `'coordinates' in value` to narrow it out.
 */
export type GeoJSONValue = GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry
