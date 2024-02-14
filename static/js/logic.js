// grab the data
let url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`;
let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

 // make request
 d3.json(url).then(function (data) {
    console.log(data);
    d3.json(url2).then(function(data2){
      makeMap(data, data2);
    })
  });

  function makeMap(data, data2) {
  
    // Step 1: Define your BASE Layers
    // Define variables for our tile layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Step 2: Create the OVERLAY (DATA) Layers
    let markers = [];
    let circles = [];
  
    // Loop through the data.
    for (let i = 0; i < data.features.length; i++){
  
      // Set the data location property to a variable.
      let row = data.features[i];
  
      // Check for the location property.
      if (row.geometry) {
        let latitude = row.geometry.coordinates[1];
        let longitude = row.geometry.coordinates[0];
        let depth = row.geometry.coordinates [2];
        let location = [latitude, longitude];
  
        // Add a new marker to the cluster group, and bind a popup.
        let magnitud = row.properties.mag;
        let popup_text=`<h1>${row.properties.title}</h1><hr><a href="${row.properties.url}" target="_blank">Link</a>`
        let marker = L.marker(location).bindPopup(popup_text);
  
        // for the marker layer
        markers.push(marker);

       // create if statenment to have different colors for circles
       let color;
       if (depth < 10) {
        color = "blue";
       } else if (depth < 30){
        color = "pink";
       } else if (depth < 50){
        color = "orange";
       } else if (depth < 70){
        color = "purple";
       } else if (depth < 90){
        color = "green";
       } else {
        color = "black";
       }
       
       //radius
       let radius = 6500 * (magnitud**2);

        //Create a new circle
        let circle = L.circle(location, {
            color: color,
            fillColor: color,
            fillOpacity: 0.75,
            radius: radius
          }).bindPopup(popup_text);

          circles.push(circle);
      }
    }
  
    let markerLayer = L.layerGroup(markers);
    let circleLayer = L.layerGroup(circles);
    let tectonicLayer = L.geoJSON(data2);
  
    // Step 3: Create the MAP object
  
    // Create a map object, and set the default layers.
    let myMap = L.map("map", {
      center: [32.7767, -96.7970],
      zoom: 4,
      layers: [street, circleLayer, tectonicLayer]
    });
  
    // Step 4: Add the Layer Controls (Legend goes here too)
  
    // Only one base layer can be shown at a time.
    let baseMaps = {
      Street: street,
      Topography: topo
    };
  
    // Overlays that can be toggled on or off
    let overlayMaps = {
      Markers: markerLayer,
      Circles: circleLayer,
      Tectonic :tectonicLayer
    };
  
    // Pass our map layers into our layer control.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Create a legend control
let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'legend');
    let colors = ['blue', 'pink', 'orange', 'purple', 'green', 'black'];
    let labels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];

  

    // Loop through the colors and generate a label with a colored square for each
    for (let i = 0; i < colors.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            labels[i] + '<br>';
    }

    return div;
};

legend.addTo(myMap);
  }
  