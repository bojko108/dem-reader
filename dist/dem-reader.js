/** 
 * dem-reader - v1.0.0
 * description: Module for extracting elevation data from GeoTIFF files
 * author: bojko108 <bojko108@gmail.com>
 * 
 * github: https://github.com/bojko108/dem-reader
 */
    
'use strict';

const GeoTIFF = require('geotiff');
const transformGeographicToUTM = require('transformations').transformGeographicToUTM;
class DemReader {
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

module.exports = DemReader;
