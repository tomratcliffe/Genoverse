// NOTE/TODO: File is basically copied from the Line graph
// Minimal dead-weight was removed after this was done, so there's likely a lot of unnecessary code still in here
// Needs a sanity check and tidy up before we go any further with this

Genoverse.Track.Controller.Graph.Scatter = {};

Genoverse.Track.Model.Graph.Scatter = Genoverse.Track.Model.Graph.extend({
  parseData: function (data, chr, start, end) {
    var features = [];
    var feature, x;

    function getX(f) {
      return typeof f.x !== 'undefined' ? f.x : f.start + (f.start === f.end ? 0 : (f.end - f.start + 1) / 2);
    }

    data.sort(function (a, b) { return (a.start - b.start) || (a.x - b.x); });

    for (i = 0; i < data.length; i++) {
      if (typeof data[i].y !== 'undefined' && !data[i].coords) {
        x = getX(data[i]);

        if (feature && feature.coords[feature.coords.length - 1][0] === x - 1) {
          feature.coords.push([ x, data[i].y ]);
          feature.end = x;
        } else {
          if (feature) {
            features.push(feature);
          }

          feature = $.extend({ coords: [[ x, data[i].y ]], start: x, end: x }, data[i]);
        }
      } else {
        if (feature) {
          features.push(feature);
          feature = undefined;
        }

        features.push(data[i]);
      }
    }

    if (feature) {
      features.push(feature);
    }

    return this.base(features, chr, start, end);
  },
});

const scatterSize = 1;

const plotCoords = (canvas, feature) => {
  feature.coordPositions.forEach(([xPos, yPos], index) => {
    const correspondingValues = feature.coords[index];

    // To plot crosses, uncomment below:
    // canvas.beginPath();
    // canvas.moveTo(xPos - scatterSize, yPos - scatterSize);
    // canvas.lineTo(xPos + scatterSize, yPos + scatterSize);
    // canvas.moveTo(xPos + scatterSize, yPos - scatterSize);
    // canvas.lineTo(xPos - scatterSize, yPos + scatterSize);
    // canvas.stroke();

    // Plot circles at each
    canvas.fillStyle = correspondingValues[1] > 0 ? 'green' : 'red';
    canvas.beginPath();
    canvas.arc(xPos, yPos, scatterSize, 0, 2 * Math.PI);
    canvas.closePath();
    canvas.fill();
  });
}

Genoverse.Track.View.Graph.Scatter = Genoverse.Track.View.Graph.extend({
  featureHeight: 1,

  positionFeatures: function (features, params) {
    var scale  = params.scale;
    var yScale = this.track.getYScale();
    var margin = this.prop('marginTop');
    var zeroY  = margin - this.prop('range')[0] * yScale;
    var add    = (scale > 1 ? scale / 2 : 0) - params.scaledStart;

    function setCoords(c) {
      return [ c[0] * scale + add, c[1] * yScale + zeroY ];
    }

    for (var i = 0; i < features.length; i++) {
      features[i].coordPositions = features[i].coords.map(setCoords);
    }

    params.featureHeight = this.prop('height');

    return this.base(features, params);
  },

  draw: function (features, featureContext, labelContext, scale) {
    if (!features.length) {
      return;
    }

    var datasets     = this.featureDataSets(features);

    datasets.list.forEach(({name}) => {
      const set = datasets.features[name];

      set.forEach(feature => {
        plotCoords(featureContext, feature);
      });
    })

    // Don't allow features to be drawn in the margins
    var height       = this.prop('height');
    var marginTop    = this.prop('marginTop');
    var marginBottom = this.prop('margin');
    featureContext.clearRect(0, 0,                     this.width, marginTop - 1);
    featureContext.clearRect(0, height - marginBottom, this.width, marginBottom);
  }
});

Genoverse.Track.Graph.Scatter = Genoverse.Track.Graph.extend({
  type       : 'Scatter',
  showPopups : true, // If true, clicking on the track will show popups. If false, popups will not appear.
  fill       : false,
  lineWidth  : 1,
  model      : Genoverse.Track.Model.Graph.Scatter,
  view       : Genoverse.Track.View.Graph.Scatter
});
