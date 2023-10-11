	// Frontend utils
    var showMenu = false;
    function handleClickMenu() {
        showMenu = !showMenu;
        document.getElementById("menuBtn").textContent = showMenu ? "╳" : "ඞ"
        if(showMenu){
            document.getElementById("menuItems").style.display = "block";
            // v CHANGER ICI POUR LA TAILLE DU MENU v
            document.getElementById("sideMenu").style.width = "20vw"
			document.getElementById("sideMenu").style.border = "solid 1px black"
			document.getElementById("sideMenu").style.borderRight = "none"
        }else{
            document.getElementById("menuItems").style.display = "none";
            document.getElementById("sideMenu").style.width = "auto";
			document.getElementById("sideMenu").style.border = "none"
        }
    }
    
    // Init OSM
	var startlat = 43.54563;
	var startlon = 3.89178;
	var options = {
		center: [startlat, startlon],
		zoomDelta: 0.25,
		zoomSnap: 0,
		zoom: 10
	}
	var map = L.map('map', options);
	var nzoom = 10;					

	//basemaps
	var basemaps = {
		OSM: L.tileLayer.wms('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: 'OSM'
		}),
		Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
			layers: 'TOPO-WMS'
		}),
		Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
			layers: 'OSM-Overlay-WMS'
		}),
		'Topography, then places': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
			layers: 'TOPO-WMS,OSM-Overlay-WMS'
		}),
		'Places, then topography': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
			layers: 'OSM-Overlay-WMS,TOPO-WMS'
		}),
		'No Layers': L.tileLayer.wms('', {
		})
	};

	L.control.layers(basemaps).addTo(map);
	basemaps.OSM.addTo(map);

	var geojsonMarkerOptions = {
		radius: 8,
		fillColor: "#ff7800",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	var styleQuartier = {
		fillColor: "#F00020",//"#3A9D23",
		color: "#F00020",
		opacity: 0.3,
		fillOpacity: 0.2
	};

	var styleCommune = {
		fillColor: "#0080FF",
		color: "#0080FF",
		opacity: 0.5,
		fillOpacity: 0.15
	};
	
	// pour les communes
	$.getJSON({
		//url: rootUrl + L.Util.getParamString(parameters),
		url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Ametropole_montpellier_wgs84&maxFeatures=50&outputFormat=application%2Fjson",
		success: handleJson
	});

	// pour les quartiers
	$.getJSON({
		//url: rootUrl + L.Util.getParamString(parameters),
		url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Aquartier_wgs84&maxFeatures=50&outputFormat=application%2Fjson",
		success: handleJsonQuartier
	});

	// pour la culture
	$.getJSON({
		//url: rootUrl + L.Util.getParamString(parameters),
		url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Aculture_wgs84_point&outputFormat=application%2Fjson",
		//success: handleJson
		success: handleJson2 
	});

	var quartier, commune;

	//couche quartier
	function handleJsonQuartier(data) {
		quartier = L.geoJson(data, {
			style : styleQuartier,
			onEachFeature: onEachFeatureQuartier,
		});//.addTo(map);
	};

    function onEachFeatureQuartier(feature, layer) {
        if (feature.geometry.type == "MultiPolygon"){
            layer.bindPopup("<b>Bienvenue dans le quartier de " + feature.properties.libquart + "!</b>").openPopup();
        }
    }


    function displayJsonLayer(data){
		if (document.getElementById("quartier").checked) {
			quartier.addTo(map);
		} else {
			map.removeLayer(quartier);
		}
		if (document.getElementById("commune").checked) {
			commune.addTo(map);
		} else {
			map.removeLayer(commune);
		}
	}

	// couche commune
	function handleJson(data) {
		commune = L.geoJson(data, {
			style: styleCommune,
			onEachFeature: onEachFeature,
		}).addTo(map);
	};

	// fonction de création de marker pour handleJson
    function onEachFeature(feature, layer) {
        if (feature.geometry.type == "MultiPolygon"){
            layer.bindPopup("<b>Bienvenue sur la commune de " + feature.properties.nom_comm + "!</b><br>Il y a " + feature.properties.population + " habitants.").openPopup();
        }
        if (feature.geometry.type == "MultiPoint"){
            var slap = "";
            if (feature.properties.theme){
                slap += slap + "<b>Theme du lieu : " + feature.properties.theme + "</b><br>";
            }
            if (feature.properties.nom){
                slap += slap + "Nom du lieu : " + feature.properties.nom ;
            }
            layer.bindPopup(slap).openPopup();
        }
    }
	
	
	// Affichage de la couche des forêts
    var rootUrl = 'http://localhost:8080/geoserver/cite/wms';
	var com_metro = L.tileLayer.wms(rootUrl, {
		layers: 'cite:foret_wgs84',
		Format: 'image/png',
		transparent: true
	});
	console.log(com_metro)
	var route_autoroute = L.tileLayer.wms(rootUrl, {
		layers: 'cite:route_wgs84',	
		'cql_filter' : "cl_admin = 'Autoroute'",
		Format: 'image/png',
		transparent: true
	});
	console.log(route_autoroute)
	var route_dep = L.tileLayer.wms(rootUrl, {
		layers: 'cite:route_wgs84',
		styles: 'route_dep',
		'cql_filter': "cl_admin='Départementale'",	
		Format: 'image/png',
		transparent: true
	});
	var route_nat = L.tileLayer.wms(rootUrl, {
		layers: 'cite:route_wgs84',	
		styles: 'route_nat',
		'cql_filter': "cl_admin='Nationale'",
		Format: 'image/png',
		transparent: true
	});
	var route_inter = L.tileLayer.wms(rootUrl, {
		layers: 'cite:route_wgs84',	
		styles: 'route_inter',
		'cql_filter': "cl_admin='Route intercommunale'",
		Format: 'image/png',
		transparent: true
	});
	var route_autre = L.tileLayer.wms(rootUrl, {
		layers: 'cite:route_wgs84',	
		styles: 'route_autre',
		'cql_filter': "cl_admin is null",
		Format: 'image/png',
		transparent: true
	});

    function displayRouteLayer(data){
		if (document.getElementById("foret").checked) {
			com_metro.addTo(map);
		} else {
			map.removeLayer(com_metro);
		}
		if (document.getElementById("Autoroute").checked) {
			route_autoroute.addTo(map);
		} else {
			map.removeLayer(route_autoroute);
		}
		if (document.getElementById("nat").checked) {
			route_nat.addTo(map);
		} else {
			map.removeLayer(route_nat);
		}
		if (document.getElementById("inter").checked) {
			route_inter.addTo(map);
		} else {
			map.removeLayer(route_inter);
		}
		if (document.getElementById("depart").checked) {
			route_dep.addTo(map);
		} else {
			map.removeLayer(route_dep);
		}
		if (document.getElementById("autre").checked) {
			route_autre.addTo(map);
		} else {
			map.removeLayer(route_autre);
		}
    }

	function getCat(cats, cat) {
		for (var i = 0; i < cats.length; i++) {
			if (cats[i]["label"] === cat) {
				return cats[i];
			}
		}
		return ;
	}

	var Routing = L.Routing.control({
		language: 'fr',
		routeWhileDragging: false,
		fitSelectedRoutes: true
	});



	var pointItineraire2;

	var xloc;
	var yloc;

	// Récupération de la position
	map.locate({setView: false, maxZoom: 16});
	function onLocationFound(e) {
		xloc = e.latlng.lat;
		yloc = e.latlng.lng;
		console.log(xloc)
		console.log(yloc)
	}
	map.on('locationfound', onLocationFound);
	function onLocationError(e) {
		alert(e.message);
	}
	map.on('locationerror', onLocationError)

	function Itineraire(){
			
		let desti = document.getElementById("Destination").value;
		let origin = document.getElementById("Origin").value;
		let x1;
		let y1;
		if(origin=="position"){
			x1 = xloc
			y1 = yloc
		} else {
			x1 = pointItineraire2[origin][0];
			y1 = pointItineraire2[origin][1];    
		}
		let x2 = pointItineraire2[desti][0];
		let y2 = pointItineraire2[desti][1];

		//clear route
		Routing.getPlan().setWaypoints([]);

		Routing.getPlan().setWaypoints([
			L.latLng(x1,y1),
			L.latLng(x2,y2),
		]);
		map.removeLayer(Routing);
		Routing.addTo(map);
	}

	function handleJson2 (data){
		var cats = [];
		var total = 0
		for (var i = 0; i < data.features.length; i++) {
			if (pointItineraire === undefined) {
				var pointItineraire = {
					[data.features[i].properties.nom]: [data.features[i].properties.latitude, 
					data.features[i].properties.longitude]
				}
			} else {
				pointItineraire[data.features[i].properties.nom] = [
				data.features[i].properties.latitude, 
				data.features[i].properties.longitude]
			}
			pointItineraire2 = pointItineraire

			var cat = getCat(cats, data.features[i].properties.theme);
			//console.log(cat)
			if (cat === undefined) {
				cat = {
					"interestPoints" : createInterestPoints(),
					"id" : "cat" + i,
					"label" : data.features[i].properties.theme
				}
				cats.push(cat);
				
			}
			total = i
			cat["interestPoints"].addData(data.features[i]);
		}
		console.log(pointItineraire)

		// Ajout des commandes de points d'interêts
		let div = document.getElementById("interestMenu");
		for (var i = 0; i < cats.length; i++) {
			if(cats[i]["label"]){
				console.log()
				div.innerHTML += '<form><img style="width:20px; height:auto;margin-left:1em;margin-right:1em;" src="pins/' + cats[i]['label'].replace(/ /g,'') + '.png"></img><input id="' + cats[i]["id"] + '" type="checkbox"/>' + cats[i]["label"] + '</form>';
			} else {
				div.innerHTML += '<form><img style="width:20px; height:auto;margin-left:1em;margin-right:1em;" src="pins/null.png"></img><input id="' + cats[i]["id"] + '" type="checkbox"/>Autre</form>';
			}
		}
		
		for (var i = 0; i < cats.length; i++) {
			document.getElementById(cats[i]["id"]).addEventListener("click", handleCommand, false);
		}
		
		var markersCheck = L.markerClusterGroup();
		function handleCommand() {
			var selectedCat;
			for (var i = 0; i < cats.length; i++) {
				if (cats[i]["id"] === this.id) {
					selectedCat = cats[i];
					break;
				}
			}
			//console.log(selectedCat["interestPoints"])
			if (document.getElementById(selectedCat.id).checked) {
				markersCheck.addLayer(selectedCat["interestPoints"]);
				map.addLayer(markersCheck);
			} else {
				map.removeLayer(selectedCat["interestPoints"])
				markersCheck.clearLayers(selectedCat["interestPoints"]);
				for (var i = 0; i < cats.length; i++) {
					console.log(cats[i]["id"])
					if (document.getElementById(cats[i]["id"]).checked) {
						console.log(cats[i]["interestPoints"])
						markersCheck.addLayer(cats[i]["interestPoints"]);
						map.addLayer(markersCheck);
					}
			}
		}
	}
		
		var divOrigin = document.getElementById("Origin");
		var divDestination = document.getElementById("Destination");
		tmp = ""
		for (var i = 0; i < total; i++) {
			tmp += '<option value="' + data.features[i].properties.nom +'">' + data.features[i].properties.nom + '</option>';
		}
		divDestination.innerHTML = tmp
		tmp += '<option value="position">POSITION</option>';
		divOrigin.innerHTML = tmp

	}

	function createInterestPoints () {

		return new L.geoJson([], {
			pointToLayer: function(feature, latlng) {
				//console.log("pins/" + feature.properties.theme + ".png")

				if (feature.properties.theme){
					var smallIcon = L.icon({
						iconUrl: "pins/" + feature.properties.theme.replace(/ /g,'') + ".png",
						//shadowUrl: 'icon-shadow.png',
						iconSize:     [33, 44], // taille de l'icone
						//shadowSize:   [50, 64], // taille de l'ombre
						iconAnchor:   [16, 44], // point de l'icone qui correspondra à la position du marker
						//shadowAnchor: [32, 64],  // idem pour l'ombre
						popupAnchor:  [-3, -76] // point depuis lequel la popup doit s'ouvrir relativement à l'iconAnchor
					});
				} else {
					var smallIcon = L.icon({
						iconUrl: "pins/null.png",
						//shadowUrl: 'icon-shadow.png',
						iconSize:     [33, 44], // taille de l'icone
						//shadowSize:   [50, 64], // taille de l'ombre
						iconAnchor:   [16, 44], // point de l'icone qui correspondra à la position du marker
						//shadowAnchor: [32, 64],  // idem pour l'ombre
						popupAnchor:  [-3, -76] // point depuis lequel la popup doit s'ouvrir relativement à l'iconAnchor
					});
				}
				return L.marker(latlng, {icon: smallIcon});
			},
			onEachFeature: function(feature, layer) {
				var html = '';
				if (feature.properties.nom) {
					html += '<b>' + "Nom du lieu : " + feature.properties.nom + '</b></br>';
				}
				if (feature.properties.theme) {
					html += "<b>Theme du lieu : " + feature.properties.theme + "</b><br>";
				}
				if (feature.properties.adresse) {
					html += '<b>' + "Adresse : " + feature.properties.adresse + '</b></br>';
				}
				
				layer.bindPopup(html).openPopup(); // Transformer multipoints en points pour réussir à afficher les popups
			}
		});
	}
