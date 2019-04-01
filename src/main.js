const GeoTIFF = require('geotiff');
const transformGeographicToUTM = require('transformations').transformGeographicToUTM;

export default class DemReader {
  constructor(image) {
    this._epsg = 'EPSG:' + image.getGeoKeys().ProjectedCSTypeGeoKey;
    this._image = image;

    const tiepoint = this._image.getTiePoints()[0];
    const pixelScale = this._image.getFileDirectory().ModelPixelScale;

    this._pxToGeo = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1 * pixelScale[1]];
    this._geoToPx = [-this._pxToGeo[0] / this._pxToGeo[1], 1 / this._pxToGeo[1], 0, -this._pxToGeo[3] / this._pxToGeo[5], 0, 1 / this._pxToGeo[5]];
  }

  static fromFile(path) {
    return new Promise((yes, no) => {
      GeoTIFF.fromFile(path)
        .then(tif => {
          tif.getImage().then(image => {
            yes(new DemReader(image));
          });
        })
        .catch(ex => {
          no(ex);
        });
    });
  }

  async calculateElevationForGeometry(geometry, sourceEPSG = 'EPSG:4326') {
    if (geometry.type === 'Point') {
      let vertex = geometry.coordinates;
      const elevation = await this.getElevationForPoint([vertex[1], vertex[0]], sourceEPSG);
      vertex[2] = elevation;
    } else if (geometry.type === 'MultiLineString') {
      for (let i = 0; i < geometry.coordinates.length; i++) {
        const part = geometry.coordinates[i];
        for (let j = 0; j < part.length; j++) {
          let vertex = part[j];
          const elevation = await this.getElevationForPoint([vertex[1], vertex[0]], sourceEPSG);
          vertex[2] = elevation;
        }
      }
    } else if (geometry.type === 'LineString') {
      for (let i = 0; i < geometry.coordinates.length; i++) {
        let vertex = geometry.coordinates[i];
        const elevation = await this.getElevationForPoint([vertex[1], vertex[0]], sourceEPSG);
        vertex[2] = elevation;
      }
    } else {
      throw `Geometry ${geometry.type} is not supported.`;
    }
  }

  async getElevationForPoint(geoPoint, sourceEPSG = 'EPSG:4326') {
    if (sourceEPSG !== this._epsg) {
      geoPoint = transformGeographicToUTM(geoPoint);
    }

    const px = this._transformPoint(geoPoint, this._geoToPx);
    const elevation = await this._getElevationForPoint(px);

    return elevation[0];
  }

  async getElevationForPoints(geoPoints, sourceEPSG = 'EPSG:4326') {
    let result = [];
    for (let i = 0; i < geoPoints.length; i++) {
      const elevation = await this.getElevationForPoint(geoPoints[i], sourceEPSG);
      result.push(elevation);
    }
    return result;
  }

  async _getElevationForPoint([x, y]) {
    const window = [Math.floor(x), Math.floor(y), Math.ceil(x), Math.ceil(y)];
    const data = await this._image.readRasters({ window });
    return data[0];
  }

  _transformPoint([y, x], parameters) {
    const xt = parameters[0] + x * parameters[1] + x * parameters[2];
    const yt = parameters[3] + x * parameters[4] + y * parameters[5];

    return [xt, yt];
  }
}

// // const file = './src/data/_cut_bg.tif';
// const file = './src/data/cut_25m.tif';
// let image;
// const getPixelAt = coordinates => {
//   const [sw, sh] = image.getResolution();
//   const origin = image.getOrigin();

//   const x = (coordinates[0] - origin[0]) / sw;
//   const y = (coordinates[1] - origin[1]) / sh;

//   return [Math.floor(x), Math.floor(y)];
// };

// export function getElevation(point) {
//   GeoTIFF.fromFile(file).then(tif => {
//     tif.getImage().then(img => {
//       image = img;

//       // console.log(image.getFileDirectory().ModelPixelScale);

//       var tiepoint = image.getTiePoints()[0];
//       var pixelScale = image.getFileDirectory().ModelPixelScale;
//       var geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1 * pixelScale[1]];
//       var invGeoTransform = [-geoTransform[0] / geoTransform[1], 1 / geoTransform[1], 0, -geoTransform[3] / geoTransform[5], 0, 1 / geoTransform[5]];
//       // console.log(tiepoint);
//       // console.log(pixelScale);
//       // console.log(geoTransform);
//       // console.log(invGeoTransform);

//       let Xgeo = invGeoTransform[0] + point[0] * invGeoTransform[1] + point[1] * invGeoTransform[2];
//       let Ygeo = invGeoTransform[3] + point[0] * invGeoTransform[4] + point[1] * invGeoTransform[5];

//       // console.log([Xgeo, Ygeo]);

//       const pnt = getPixelAt(point);
//       // console.log(pnt);
//       // console.log(point);
//       // console.log(pnt);
//       console.log('as function', [pnt[0] - 1, pnt[1] - 1, pnt[0] + 1, pnt[1] + 1]);

//       img.readRasters({ window: [pnt[0] - 1, pnt[1] - 1, pnt[0] + 1, pnt[1] + 1] }).then(data => {
//         console.log(data[0]);
//       });
//     });
//   });

//   return point[2];
// }
