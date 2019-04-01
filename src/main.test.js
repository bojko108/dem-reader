import { assert } from 'chai';
import DemReader from '../dist/dem-reader';
import { multiLineString } from './data/tracks';

describe('DemReader Tests', () => {
  // const file = './src/data/_cut_bg.tif';
  const file = './src/data/cut_25m.tif';

  it('should create DemReader from local tiff file', function() {
    DemReader.fromFile(file).then(dem => {
      assert.isDefined(dem);
    });
  });

  it('should get elevation for point', function() {
    const point = [42.60788543745605, 23.35463742347579, 812.4079];

    DemReader.fromFile(file).then(dem => {
      dem
        .getElevationForPoint(point, 'EPSG:4326')
        .then(elevation => {
          assert.isDefined(elevation);
          assert.closeTo(elevation, point[2], 1);
        })
        .catch(ex => {
          console.log(ex);
        });
    });
  });

  it('should get elevation for points array', function() {
    const points = [
      [42.67236575170616, 23.166967817923663, 882.6761],
      [42.678948595053036, 23.36843502983302, 557.2801],
      [42.56486032940677, 23.375005288027527, 903.8342],
      [42.55830636299983, 23.173957109482043, 976.163],
      [42.5671459550356, 23.37177747945162, 895.1112],
      [42.60788543745605, 23.35463742347579, 812.4079]
    ];

    DemReader.fromFile(file).then(dem => {
      dem
        .getElevationForPoints(points, 'EPSG:4326')
        .then(elevations => {
          assert.isDefined(elevations);
          assert.equal(elevations.length, points.length);
          for (let i = 0; i < elevations.length; i++) {
            assert.closeTo(elevations[i], points[i][2], 1);
          }
        })
        .catch(ex => {
          console.log(ex);
        });
    });
  });

  it('should throw error if geometry is not supported', function() {
    const line = {
      type: 'NotSupported'
    };

    DemReader.fromFile(file).then(dem => {
      dem.calculateElevationForGeometry(line).catch(e => {
        assert.equal(e, 'Geometry NotSupported is not supported.');
      });
    });
  });

  it('should calculate elevation for Point geometry', function() {
    const point = {
      type: 'Point',
      coordinates: [23.237647338683313, 42.658865111793808]
    };

    DemReader.fromFile(file).then(dem => {
      dem
        .calculateElevationForGeometry(point, 'EPSG:4326')
        .then(() => {
          assert.closeTo(point.coordinates[2], 664.9458, 1);
        })
        .catch(ex => {
          console.log(ex);
        });
    });
  });

  it('should calculate elevation for LineString geometry', function() {
    const line = {
      type: 'LineString',
      coordinates: [
        [23.237647338683313, 42.658865111793808],
        [23.236057132101429, 42.657581890766238],
        [23.233851012581255, 42.654226858079163],
        [23.234090177532849, 42.65026847084345],
        [23.234690843099564, 42.646458748355684],
        [23.238331943335634, 42.641381360367141],
        [23.245579416167867, 42.637926710183393],
        [23.250003891741308, 42.635199700484655],
        [23.254822290327223, 42.632075108167705],
        [23.256016943730344, 42.627600860393088],
        [23.256254481807293, 42.623642354019587],
        [23.251062134293857, 42.61759128749452],
        [23.243989960016247, 42.612025360680782],
        [23.239271840474352, 42.607357013847619],
        [23.239132508103111, 42.603522920682401],
        [23.242462547004223, 42.600486663329079],
        [23.246223450493684, 42.599515970695528],
        [23.253589344255857, 42.600167709211192],
        [23.259642410244329, 42.604195277399079],
        [23.262293305121563, 42.612488025308089],
        [23.266015988940996, 42.61835386212028],
        [23.271783477115079, 42.621003787391487],
        [23.288320909175294, 42.623182724278706],
        [23.296904585365908, 42.622093189475919],
        [23.298867688641614, 42.617096263446648],
        [23.297930183766045, 42.611048097207416],
        [23.295120650232459, 42.605349624396041],
        [23.291065149547386, 42.601935773247781],
        [23.283105642009321, 42.598805327478921],
        [23.275130679192248, 42.595947364653505],
        [23.268585517981961, 42.593956099697095],
        [23.260755779092133, 42.591785717966758],
        [23.250869986202588, 42.589957753839208],
        [23.241768858209369, 42.590479778649026],
        [23.237203731011235, 42.592518029727351],
        [23.2323053541534, 42.597006952722886],
        [23.229339740096584, 42.603200593478533],
        [23.224431672694415, 42.607825613799484],
        [23.217840353231061, 42.609659422146308],
        [23.208339423014145, 42.607566951685399],
        [23.208409210559278, 42.600320563690005],
        [23.212862880659191, 42.594039975346419],
        [23.216940786466047, 42.590892449524461],
        [23.226929357780737, 42.587939846085099],
        [23.237405420757025, 42.586096542153044],
        [23.243230226498174, 42.584646720980196],
        [23.250442379412149, 42.584746529947623],
        [23.254506181809006, 42.584879632626553],
        [23.264842369906823, 42.585354293101219],
        [23.273997159207813, 42.587020473363232],
        [23.279650637371081, 42.588435359558289],
        [23.28693459793875, 42.590449966991436],
        [23.290789880392033, 42.590985320015207],
        [23.296388895560398, 42.590209306516122],
        [23.29733013700368, 42.586820536631478],
        [23.294134488487998, 42.584528770795373],
        [23.284490185349672, 42.58175415688644],
        [23.275650691486099, 42.577910777455976],
        [23.272809424635945, 42.575903492171868],
        [23.275052603071124, 42.572420539982097],
        [23.283379784611885, 42.572417782193583],
        [23.293913735048999, 42.57576837994538],
        [23.300907025832242, 42.579550680143413],
        [23.304255120561969, 42.582394259326925],
        [23.308751470645241, 42.587736640602152],
        [23.311337179362102, 42.590965725102279],
        [23.314228223743847, 42.595298743205959],
        [23.316717897307381, 42.600165846053628],
        [23.319352780231238, 42.602575716783036],
        [23.324406243082667, 42.604789709984445],
        [23.329950278383855, 42.608113373385009],
        [23.331726438502745, 42.612546954660701],
        [23.32934023374963, 42.618488276546799],
        [23.322139385433715, 42.624411640288486],
        [23.316930890820686, 42.627936852015885],
        [23.312581598452368, 42.632583668283928],
        [23.308778220774034, 42.637384696471401],
        [23.308029616593913, 42.640642990566683],
        [23.308912742002509, 42.644501010590744],
        [23.310407266840542, 42.647421362330022],
        [23.312995324512997, 42.650650480086604],
        [23.315189561636831, 42.65427716125717],
        [23.317698037102435, 42.655725617630004],
        [23.323246313910488, 42.655904070425599],
        [23.328802668389759, 42.652800061749673],
        [23.331568333331813, 42.646734179379706]
      ]
    };

    DemReader.fromFile(file).then(dem => {
      dem
        .calculateElevationForGeometry(line, 'EPSG:4326')
        .then(() => {
          for (let i = 0; i < line.coordinates.length; i++) {
            assert.equal(line.coordinates[i].length, 3);
          }
          assert.closeTo(line.coordinates[0][2], 664.9458, 1);
          assert.closeTo(line.coordinates[line.coordinates.length - 1][2], 617.0905, 1);
        })
        .catch(ex => {
          console.log(ex);
        });
    });
  });

  it('should calculate elevation for MultiLine geometry', function() {
    DemReader.fromFile(file).then(dem => {
      dem
        .calculateElevationForGeometry(multiLineString, 'EPSG:4326')
        .then(() => {
          for (let i = 0; i < multiLineString.coordinates.length; i++) {
            const part = multiLineString.coordinates[i];
            for (let j = 0; j < part.length; j++) {
              assert.equal(part[j].length, 3);
            }
            assert.closeTo(part[0][2], 663.7259, 1);
            assert.closeTo(part[part.length - 1][2], 1868.213, 1);
          }
        })
        .catch(ex => {
          console.log(ex);
        });
    });
  });
});