var geoserverUrl = "http://localhost:8080/geoserver";
		var selectedPoint = null;

		var source = null;
		var target = null;

// initialize the map with osm background
		var startlat = 48.8538835413;
		var startlon = 2.3493797332;

				var options = {
				 center: [startlat, startlon],
				 zoom: 12
				}
				
		var map = L.map('map', options);
				var nzoom = 12;
				
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: 'OSM'}).addTo(map);

//marqueur à l'adresse donnée			
		var myMarker = L.marker([startlat, startlon], {title: "Coordinates", alt: "Coordinates", draggable: true}).addTo(map).on('dragend', function() 
			{	
			 var lat = myMarker.getLatLng().lat.toFixed(8);
			 var lon = myMarker.getLatLng().lng.toFixed(8);
			 var czoom = map.getZoom();
			 if(czoom < 18) { nzoom = czoom + 2; }
			 if(nzoom > 18) { nzoom = 18; }
			 if(czoom != 18) { map.setView([lat,lon], nzoom); } else { map.setView([lat,lon]); }
			 document.getElementById('lat').value = lat;
			 document.getElementById('lon').value = lon;
			 //myMarker.bindPopup("Lat " + lat + "<br />Lon " + lon).openPopup();
			});

		function chooseAddr(lat1, lng1)
		{
			 myMarker.closePopup();
			 map.setView([lat1, lng1],18);
			 myMarker.setLatLng([lat1, lng1]);
			 lat = lat1.toFixed(8);
			 lon = lng1.toFixed(8);
			 document.getElementById('lat').value = lat;
			 document.getElementById('lon').value = lon;
			 //myMarker.bindPopup("Lat " + lat + "<br />Lon " + lon).openPopup();
		}

		function myFunction(arr)
		{
			 var out = "<br />";
			 var i;

			 if(arr.length > 0)
			{
				  for(i = 0; i < arr.length; i++)
				  {
				   out += "<div class='address' title='Show Location and Coordinates' onclick='chooseAddr(" + arr[i].lat + ", " + arr[i].lon + ");return false;'>" + arr[i].display_name + "</div>";
					}
				  document.getElementById('results').innerHTML = out;
			 }
			 else
			 {
				document.getElementById('results').innerHTML = "Oups... L'adresse inscrite est introuvable, veuillez réessayer.";
			 }

		}

		function addr_search()
		{
			 var inp = document.getElementById("addr");
			 var xmlhttp = new XMLHttpRequest();
			 var url = "https://nominatim.openstreetmap.org/search?format=json&limit=3&q=" + inp.value;
			 xmlhttp.onreadystatechange = function()
			{
			if (this.readyState == 4 && this.status == 200)
				{
				var myArr = JSON.parse(this.responseText);
				myFunction(myArr);
				}
			};
		 xmlhttp.open("GET", url, true);
		 xmlhttp.send();
		}
// marqueurs velib
		var markerLOKL = L.geoJSON(velib, 
					{
					<!-- style: function (feature) { -->
					<!-- return feature.properties && feature.properties.style; -->
					<!-- }, -->
						pointToLayer: function (feature, latlng) 
						{
							return L.circleMarker(latlng, 
							{
								radius: 10,
								fillColor: "#ff7800",
								color: "#000",
								weight: 1,
								opacity: 1,
								fillOpacity: 0.8
							});
						}
					});
		var markers = L.markerClusterGroup();
					//var marker = L.marker(new L.LatLng([velib]));
					markers.addLayer(markerLOKL);
					map.addLayer(markers);		
		
		
		
		
		
// empty geojson layer for the shortes path result
var pathLayer = L.geoJSON(null);

// draggable marker for starting point. Note the marker is initialized with an initial starting position
var sourceMarker = L.marker([-1.283147351126288, 36.822524070739746], {
	draggable: true
})
	.on("dragend", function(e) {
		selectedPoint = e.target.getLatLng();
		getVertex(selectedPoint);
		getRoute();
	})
	.addTo(map);

// draggbale marker for destination point.Note the marker is initialized with an initial destination positon
var targetMarker = L.marker([-1.286107765621784, 36.83449745178223], {
	draggable: true
})
	.on("dragend", function(e) {
		selectedPoint = e.target.getLatLng();
		getVertex(selectedPoint);
		getRoute();
	})
	.addTo(map);

// function to get nearest vertex to the passed point
function getVertex(selectedPoint) {
	var url = `${geoserverUrl}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=routing:nearest_vertex&outputformat=application/json&viewparams=x:${
		selectedPoint.lng
	};y:${selectedPoint.lat};`;
	$.ajax({
		url: url,
		async: false,
		success: function(data) {
			loadVertex(
				data,
				selectedPoint.toString() === sourceMarker.getLatLng().toString()
			);
		}
	});
}

// function to update the source and target nodes as returned from geoserver for later querying
function loadVertex(response, isSource) {
	var features = response.features;
	map.removeLayer(pathLayer);
	if (isSource) {
		source = features[0].properties.id;
	} else {
		target = features[0].properties.id;
	}
}

// function to get the shortest path from the give source and target nodes
function getRoute() {
	var url = `${geoserverUrl}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=routing:shortest_path&outputformat=application/json&viewparams=source:${source};target:${target};`;

	$.getJSON(url, function(data) {
		map.removeLayer(pathLayer);
		pathLayer = L.geoJSON(data);
		map.addLayer(pathLayer);
	});
}

getVertex(sourceMarker.getLatLng());
getVertex(targetMarker.getLatLng());
getRoute();



