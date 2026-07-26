/** RFC 7464 record separator that frames each record in a JSON text sequence. */
const RECORD_SEPARATOR = 0x1e
/** Bytes read to inspect the leading byte without loading a large file. */
const DETECTION_HEAD_BYTES = 8

type JsonSubmission = {
  kind: 'json'
  geoJSON: unknown
}

type LineByLineSubmission = {
  kind: 'lineByLine'
  file: File
}

export type LocalGeoJSONSubmission = JsonSubmission | LineByLineSubmission

export const isLineByLineGeoJSONText = (text: string) => text.charCodeAt(0) === RECORD_SEPARATOR

export const detectLocalGeoJSONSubmission = async (file: File): Promise<LocalGeoJSONSubmission> => {
  const head = await file.slice(0, DETECTION_HEAD_BYTES).text()
  if (isLineByLineGeoJSONText(head)) {
    return { kind: 'lineByLine', file }
  }

  const text = await file.text()
  return { kind: 'json', geoJSON: JSON.parse(text) }
}
