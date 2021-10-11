// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Determine sizes for each markers on the map
function size(magnitude) {
  return magnitude * 40000;
}

function colours(magnitude) {
  var colour = "";
  if (magnitude <= 1) {
    return colour = "#a0c30f";
  }
  else if (magnitude <= 2) {
    return colour = "#ffe433";
  }
  else if (magnitude <= 3) {
    return colour = "#f1b009";
  }
  else if (magnitude <= 4) {
    return colour = "#dc7e00";
  }
  else if (magnitude <= 5) {
    return colour = "#c04c00";
  }
  else if (magnitude > 5) {
    return colour = "#9e0d08";
  }
  else {
    return colour = "#800a06";
  }
}

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
  console.log(data.features);
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  console.log(earthquakeData[0].geometry.coordinates[1]);
  console.log(earthquakeData[0].geometry.coordinates[0]);
  console.log(earthquakeData[0].properties.mag);

  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<hr> <p> Earthquake Magnitude: " + feature.properties.mag + "</p>")
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    pointToLayer: function (feature, coordinates) {
      var geoMarkers = {
        radius: size(feature.properties.mag),
        fillColor: colours(feature.properties.mag),
        fillOpacity: 1,
        weight: 1
      }
      return L.circle(coordinates, geoMarkers);
    }
  })

  createMap(earthquakes);
}

// Create function for earthquake map
function createMap(earthquakes) {

  var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "outdoors-v11",
    accessToken: API_KEY
  });

  var greyMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
  });

  var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoor Map": outdoorMap,
    "Grayscale Map": greyMap,
    "Dark Map": darkMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };


  // Create map
  var myMap = L.map("map", {
    center: [
      11.544916552219117, 38.11824458511297
    ],
    zoom: 2.5,
    layers: [outdoorMap, earthquakes]
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Set up the legend.
  var legend = L.control({ 
    position: 'bottomright' 
  });

  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        magnitude = [0, 1, 2, 3, 4, 5];

    for (var i = 0; i < magnitude.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colours(magnitude[i] + 1) + '"></i> ' +
        magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
    }
    return div;
  };

  // Add the info legend to the map.
  legend.addTo(myMap);

}