export const createBoundsXml = (coords) => {
  return `
    <gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Maproulette">
      <metadata>
        <link href="https://github.com/maproulette/maproulette3">
          <text>Maproulette</text>
        </link>
        <time>${new Date().now}</time>
      </metadata>
      <trk>
        <name>Do not edit outside of this area!</name>
        <trkseg>
          <trkpt lon="${coords[0]}" lat="${coords[1]}"/>
        </trkseg>
      </trk>
      <wpt lon="${coords[0]}" lat="${coords[1]}"/>
    </gpx>
  `
}