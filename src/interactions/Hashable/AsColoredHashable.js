// A curated subset of contrasting colors from:
// http://godsnotwheregodsnot.blogspot.com/2013/11/kmeans-color-quantization-seeding.html
const CONTRASTING_COLORS = [
  "#FFFF00",
  "#1CE6FF",
  "#FF34FF",
  "#FFDBE5",
  "#63FFAC",
  "#B79762",
  "#8FB0FF",
  "#809693",
  "#FEFFE6",
  "#4FC601",
  "#FF2F80",
  "#00C2A0",
  "#FFAA92",
  "#FF90C9",
  "#D16100",
  "#DDEFFF",
  "#A1C299",
  "#0AA6D8",
  "#FFB500",
  "#C2FFED",
  "#A079BF",
  "#C0B9B2",
  "#C2FF99",
  "#0CBD66",
  "#EEC3FF",
  "#B77B68",
  "#FAD09F",
  "#FF8A9A",
  "#D157A0",
  "#BEC459",
  "#0086ED",
  "#B4A8BD",
  "#00A6AA",
  "#A3C8C9",
  "#FF913F",
  "#00FECF",
  "#8CD0FF",
  "#04F757",
  "#C8A1A1",
  "#D790FF",
  "#9B9700",
  "#549E79",
  "#FFF69F",
  "#99ADC0",
  "#FDE8DC",
  "#CB7E98",
  "#A4E804",
  "#83AB58",
  "#D1F7CE",
  "#C8D0F6",
  "#A3A489",
  "#8ADBB4",
  "#C895C5",
  "#FF6832",
  "#66E1D3",
  "#CFCDAC",
  "#D0AC94",
  "#7ED379",
  "#D68E01",
  "#78AFA1",
  "#FEB2C6",
  "#B5F4FF",
  "#D2DCD5",
  "#0AA3F7",
  "#E98176",
  "#DBD5DD",
  "#5EBCD1",
  "#9695C5",
  "#E773CE",
  "#D86A78",
  "#CA834E",
  "#FF5DA7",
  "#F7C9BF",
  "#6B94AA",
  "#51A058",
  "#E7AB63",
  "#97979E",
  "#F4D749",
  "#DDB6D0",
  "#9FB2A4",
  "#00D891",
  "#BC65E9",
  "#C6DC99",
  "#F5E1FF",
  "#FFA0F2",
  "#CCAA35",
  "#8BB400",
  "#C86240",
  "#CCB87C",
  "#B88183",
  "#B5D6C3",
  "#A38469",
  "#9F94F0",
  "#B894A6",
  "#71BB8C",
  "#00B433",
  "#789EC9",
  "#6D80BA",
  "#5EFF03",
  "#E4FFFC",
  "#1BE177",
  "#BCB1E5",
  "#A76F42",
  "#A88C85",
  "#F4ABAA",
  "#A3F3AB",
  "#00C6C8",
  "#EA8B66",
  "#BDC9D2",
  "#9FA064",
  "#DFFB71",
  "#98D058",
  "#D7BFC2",
  "#D25B88",
  "#00B57F",
  "#00CCFF",
  "#92896B",
];

// Simple fast hashing -- enough to get a unique color
function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/**
 * Returns a hex color based off a hash of the hashable value, which must be a
 * string or have a toString method
 */
export function computeHashColor(hashable) {
  if (!hashable || !hashable.toString) return "";

  const hash = hashCode(hashable.toString());
  return CONTRASTING_COLORS[Math.abs(hash) % CONTRASTING_COLORS.length];
}

/**
 * Provides basic methods for generating different colors based on a string's
 * hashcode
 */
export class AsColoredHashable {
  constructor(hashable) {
    this.hashColor = computeHashColor(hashable);
  }
}

export default (hashable) => new AsColoredHashable(hashable);
