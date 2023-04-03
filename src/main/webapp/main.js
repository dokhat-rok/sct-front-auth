var pages = [];
var activePage;
var map;

var activeParking, activeVehicle;

var parkingsService = new ParkingsService();
var vehiclesService = new VehiclesService();
var tripsService = new TripsService();
var customerService = new CustomerService();

var parkingBalloonContentLayout;

$(document).ready(function() {
	pages = [$("div#map-container"), $("div#trips-container")];
	pages.forEach(page => page.hide());
	
	customerService.loadCurrentCustomer(currentCustomer => {
		$("span#customer-login").html(customerService.customer.login);
		if(customerService.customer.balance) {
			$("span#customer-balance").html(`${customerService.customer.balance}р.`);
		}
		
		initLayout();
	});
});

function isAdmin() {
	return customerService.customer.role == 'ADMIN';
}

function initLayout() {
	activePage = pages[0];
	activePage.show();
	
    initPage('#map-container');

	$("ul.navbar-nav a").click(function(target) {	
		let container = $("div" + target.currentTarget.hash);
		if(!container.is(activePage)) {
			container.show();
			activePage.hide();
			activePage = container;
			initPage(target.currentTarget.hash);
			$('ul.navbar-nav a').removeClass('active');
			$(this).addClass('active');
		}
	});
}

function initPage(pageName) {
	if(pageName == "#map-container") {
		initMapPage();
	} else if(pageName == "#trips-container") {
		initTripsPage();
	}	
}

function initVehicleCreation() {
	parkingsService.getParkings(parkings => {
		$("#vehicle-parking").empty();
		parkings.forEach(parking => {
			$("#vehicle-parking").append(`<option value="${parking.id}">${parking.name}</option>`); 
		});		
	});

	$("#vehicle-form").show();
	$("#toolbar").hide();
	activeVehicle = new ymaps.Placemark(
        map.getCenter(), {
			
		}, {
			preset: 'islands#governmentCircleIcon',
			iconColor: 'green',
			draggable: true,
		});

	map.geoObjects.add(activeVehicle);	
}

function completeVehicleCreation() {
	var vehicleType;
	if($("#vehicle-type").val() == 'ELECTRIC_SCOOTER'){
		vehicleType = 'SCOOTER'
	}
	else{
		vehicleType = 'BICYCLE'
	}
	vehiclesService.createVehicle({
		type: vehicleType,
		parking: {name: $("#vehicle-parking").val()}
	}, () => {
		complateFormAction();
		loadMapObjects();		
	});
}

function initParkingCreation() {
	$("#parking-form").show();
	$("#toolbar").hide();
	activeParking = new ymaps.Circle([map.getCenter(), 200],
	{ hintContent: 'Новая парковка' }, {
		draggable: true,
		fillColor: "#3DED9777",
		strokeColor: "#028A0F",
		strokeOpacity: 0.8,
		strokeWidth: 5
	});

	map.geoObjects.add(activeParking);

	$("#parking-name").val('Новая парковка');
	$("#parking-radius").val(200);
	$("#parking-radius").bind("change paste keyup", function() {
		activeParking.geometry.setRadius($(this).val());
	});	
}

function completeParkingCreation() {
	parkingsService.createParking({
		name: $("#parking-name").val(),
		type: "ALL",
		allowedRadius:$("#parking-radius").val(),
		coordinates: activeParking.geometry.getCoordinates().toString()
	}, () => {
		complateFormAction();
		loadMapObjects();
	});
}

/*function removeParking(parkingMapObject) {
	parkingsService.deleteParking(parkingMapObject.getData().properties.get('objectId'), loadMapObjects);
}*/

function complateFormAction() {
	if(activeParking != null) {
		map.geoObjects.remove(activeParking);
		$("#toolbar").show();
		$("#parking-form").hide();
		activeParking = null;
	}

	if(activeVehicle != null) {
		map.geoObjects.remove(activeVehicle);
		$("#toolbar").show();
		$("#vehicle-form").hide();
		activeVehicle = null;
	}
}

function initMapPage() {
	if(isAdmin()) {
		$("#parking-form").hide();
		$("#vehicle-form").hide();
		$("#init-create-parking").click(initParkingCreation);
		$("#init-create-vehicle").click(initVehicleCreation);
		$("#create-parking").click(completeParkingCreation);
		$("#create-vehicle").click(completeVehicleCreation);
		$("button.cancel").click(complateFormAction);
	} else {
		$("#common-toolbar").hide();
		$("#parking-form").hide();
		$("#vehicle-form").hide();
	}

	ymaps.ready(() => {
		map = new ymaps.Map('map', {
			center: [47.222078, 39.720358],
			zoom: 13,
			controls: ['zoomControl', 'searchControl']
		}, {
			searchControlProvider: 'yandex#search',
		});

		loadMapObjects();	
	});	
}

function loadMapObjects() {
	map.geoObjects.removeAll();
	vehiclesService.getVehicles(function(vehicles) {
		vehicles.forEach(vehicle => addVehicleToMap(vehicle));
	});
	parkingsService.getParkings(parkings => {
		parkings.forEach(parking => addParkingToMap(parking));
	});
}

function initTripsPage() {
	var tableBody = $('div#trips-container table tbody');
	var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

	tripsService.getTrips(function(trips) {
		tableBody.empty();
		trips.forEach(item => {
			var statusText, badgeClass;
			if(item.status == 'CLOSE') {
				statusText = 'ЗАВЕРШЕНА';
				badgeClass = 'alert-success';
			} else {
				badgeClass = 'alert-primary';
				statusText = 'В ПРОЦЕССЕ';
			} 

			tableBody.append(
				'<tr>' + 
					`<td>${item.id}</td>` + 
					`<td>${item.customer.login}</td>` +
					`<td>${item.transport.identificationNumber}</td>` +
					`<td><span class="badge ${badgeClass}">${statusText}</span></td>` + 
					`<td>${item.beginTimeRent} ${item.endTimeRent ? ' - ' + item.endTimeRent : ''}</td>` +
					`<td>${item.beginParking.name} -> ` + (item.endParking ? `${item.endParking.name}</td>` : '</td>') +
					`<td>${item.amount ? item.amount : '40'}</td>` +
				'</tr>');
		});
	});	
}

function addParkingToMap(parking) {
	var parkingArea = new ymaps.Circle([
        [parking.coordinates.split(',')[0], parking.coordinates.split(',')[1]],
        parking.allowedRadius
    ], {
        hintContent: parking.name,
		objectId: parking.id,
    }, {
        draggable: false,
        fillColor: /*"#DB709377"*/ "#75bbfd77",
        strokeColor: /*"#990066"*/ "#21669b",
        strokeOpacity: 0.8,
        strokeWidth: 3,
		objectId: parking.id
    });

	map.geoObjects.add(parkingArea);
	parkingArea.events.add('click', function (e) {
		var coords = e.get('coords');
        map.balloon.open(coords, {
			contentHeader: parking.name,
		});
    });
}

function addVehicleToMap(vehicle) {
	var color, statusName;
	if(vehicle.status == 'FREE') {
		color = 'green';
		statusName = 'Свободен';
	} else {
		color = 'blue';
		statusName = 'Арендован';
	}
	var content;
	var typeName = vehicle.type == 'BICYCLE' ? 'Велосипед' : 'Электросамокат';
	
	content = 	`<strong>${typeName} ${vehicle.identificationNumber}</strong><br>` +
				`Статус: ${statusName}<br>` + 
				`Парковка: ${vehicle.parking.name}<br>`;

	if(vehicle.type == 'SCOOTER') {
		content += `Макс. скорость: ${vehicle.maxSpeed} км/ч<br>`;
		content += `Заряд: ${vehicle.chargePercentage}%<br>`
	}

	var vehiclePlacemark = new ymaps.Placemark(
        [vehicle.coordinates.split(',')[0], vehicle.coordinates.split(',')[1]], {
			balloonContent: content
		}, {
			preset: 'islands#governmentCircleIcon',
			iconColor: color
		});
        
	map.geoObjects.add(vehiclePlacemark);
}
      
