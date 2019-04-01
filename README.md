# dem-reader

This library can be used for extracting elevation data from a local GeoTIFF file.

## Install

You can install it with NPM (`npm install bojko108/dem-reader`) or Yarn (`yarn add bojko108/dem-reader`) and then:

```js
import DemReader from 'dem-reader';
```

## Calculate elevation values

You can calculate elevation values for single points or GeoJSON geometries. Geometries are modified in place, meaning that the elevation value is appended to coordinates array as third element! Following GeoJSON geometries are supported:

- [Point](#point)
- [LineString](#linestring)
- [MultiLineString](#multilinestring)

Coordinates must be either geographical or in GeoTIFF file's coordinate system. If you pass geographical coordinates, the DEM file must be in `UTM35` projection (or in `WGS84`) as the library supports only this projection for now. 

### Single points

```js
import DemReader from 'dem-reader';

const file = 'path/to/GeoTIFF/file';
const point = [42.60788543745605, 23.35463742347579];

const dem = await DemReader.fromFile(file);

const elevation = await dem.getElevationForPoint(point, 'EPSG:4326');
// elevation is: 812.4079 meters
```

### GeoJSON geometries

#### Point

```js
import DemReader from 'dem-reader';

const file = 'path/to/GeoTIFF/file';
const point = {
  type: 'Point',
  coordinates: [23.237647338683313, 42.658865111793808]
};

const dem = await DemReader.fromFile(file);

await dem.calculateElevationForGeometry(point, 'EPSG:4326');
// point is now:
// {
//   type: 'Point',
//   coordinates: [23.237647338683313, 42.658865111793808, 664.9458]
// }
```

#### LineString

```js
import DemReader from 'dem-reader';

const file = 'path/to/GeoTIFF/file';
const line = {
  type: 'LineString',
  coordinates: [...]
};

const dem = await DemReader.fromFile(file);

await dem.calculateElevationForGeometry(line, 'EPSG:4326');
// line now has elevation values
```

#### MultiLineString

```js
import DemReader from 'dem-reader';

const file = 'path/to/GeoTIFF/file';
const multiLine = {
  type: 'MultiLineString',
  coordinates: [...]
};

const dem = await DemReader.fromFile(file);

await dem.calculateElevationForGeometry(multiLine, 'EPSG:4326');
// multiLine now has elevation values
```

## Dependencies

- [geotiffjs](https://github.com/geotiffjs/geotiff.js)
- [transformations](https://github.com/bojko108/transformations)

## License

dem-reader is [MIT](https://github.com/bojko108/dem-reader/tree/master/LICENSE) License @ bojko108

```

```
