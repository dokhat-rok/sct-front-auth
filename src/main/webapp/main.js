var pages = [];
var activePage;
var map;

var activeParking, activeVehicle;

var parkingService = new ParkingService();
var transportService = new TransportService();
var rentService = new RentService();
var customerService = new CustomerService();
var priceService = new PriceService();

var parkingBalloonContentLayout;

var parkingList;

$(document).ready(function() {
	pages = [$("div#map-container"), $("div#trips-container"), $("div#transport-container"), $("div#parking-container"),
		$("div#customers-container"), $("div#price-container")];
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
	return customerService.customer.role == 'ADMIN' || customerService.customer.role == 'MANAGER';
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
	} else if(pageName == "#transport-container") {
		initTransportPage();
	} else if(pageName == "#customers-container") {
		initCustomersPage();
	} else if(pageName == "#parking-container") {
		initParkingPage();
	} else if(pageName == "#price-container") {
		initPricePage();
	}
}

function initVehicleCreation() {
	parkingService.getParkings(parkings => {
		$("#vehicle-parking").empty();
		parkings.forEach(parking => {
			$("#vehicle-parking").append(`<option value="${parking.name}">${parking.name}</option>`);
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
	transportService.createTransports({
		type: $("#vehicle-type").val(),
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
	parkingService.createParking({
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
	transportService.getTransports(function(vehicles) {
		vehicles.forEach(vehicle => addVehicleToMap(vehicle));
	});
	parkingService.getParkings(parkings => {
		parkings.forEach(parking => addParkingToMap(parking));
	});
}

function initTripsPage() {
	rentService.getRents(fillTrips);
}

function initTripsPageFiltered() {
	var login = $("#r-login-filter").val();
	var ident = $("#r-ident-filter").val();
	var status = $("#r-status-filter").val();
	var filter = {
		login: login == '' ? null : login,
		transportIdent: ident == '' ? null : ident,
		status: status == '' ? null : status,
		page: 0,
		size: 100
	}
	rentService.getRents(fillTrips, filter);
}

function dropTripsFiltered() {
	document.getElementById("r-login-filter").value = '';
	document.getElementById("r-ident-filter").value = '';
	document.getElementById("r-status-filter").selectedIndex = 0;
	initTripsPage();
}

function fillTrips(rents) {
	var tableBody = $('div#trips-container table tbody');
	tableBody.empty();
	rents.content.forEach(item => {
		var statusText, badgeClass;
		if(item.status == 'CLOSE') {
			statusText = 'Завершена';
			badgeClass = 'alert-success';
		} else {
			badgeClass = 'alert-primary';
			statusText = 'В процессе';
		}

		tableBody.append(
			'<tr>' +
			`<td>${item.id}</td>` +
			`<td>${item.customer.login}</td>` +
			`<td>${item.transport.identificationNumber}</td>` +
			`<td><span class="badge ${badgeClass}">${statusText}</span></td>` +
			`<td>${item.beginTimeRent} ${item.endTimeRent ? ' - ' + item.endTimeRent : ''}</td>` +
			`<td>${item.beginParking.name} -> ` + (item.endParking ? `${item.endParking.name}</td>` : '</td>') +
			`<td>${item.amount ? item.amount : ''}</td>` +
			'</tr>');
	});
}

function initTransportPage() {
	parkingService.getParkings(parkingL => {
		parkingList = parkingL;
	});
	transportService.getTransportsPageable(fillTransport);
}

function initTransportPageFiltered() {
	var ident = $("#ident-filter").val();
	var pName = $("#p-name-filter").val();
	var cond = $("#cond-filter").val();
	var status = $("#t-status-filter").val();
	var filter = {
		identificationNumber: ident == '' ? null : ident,
		parkingName: pName == '' ? null : pName,
		condition: cond == '' ? null : cond,
		status: status == '' ? null : status,
		page: 0,
		size: 100
	}
	transportService.getTransportsPageable(fillTransport, filter);
}

function fillTransport(transports) {
	var tableBody = $('div#transport-container table tbody');
	tableBody.empty();
	transports.content.forEach(item => {
		var id = item.id;
		var type, condition, status;
		type = item.type == "SCOOTER" ? 'Самокат' : 'Велосипед';

		condition = item.condition;
		if(condition == 'EXCELLENT') {
			condition = 'Отлично';
		}
		else if(condition == 'GOOD') {
			condition = 'Хорошо';
		}
		else {
			condition = 'Посредственно';
		}

		status = item.status;
		if(status == 'FREE') {
			status = 'Свободен';
		}
		else if(status == 'BUSY') {
			status = 'Занят';
		}
		else {
			status = 'Недоступен';
		}

		tableBody.append(
			'<tr>' +
			`<td id="id-${id}" class="immutable">${item.id}</td>` +
			`<td id="type-${id}" class="immutable">${type}</td>` +
			`<td id="ident-${id}" class="immutable">${item.identificationNumber}</td>` +
			`<td id="coor-${id}">${item.coordinates ? item.coordinates : '-'}</td>` +
			`<td id="park-${id}" class="park-selector">${item.parking ? item.parking.name : '-'}</td>` +
			`<td id="cond-${id}" class="condition-selector">${condition}</td>` +
			`<td id="status-${id}" class="status-selector">${status}</td>` +
			`<td id="charge-${id}" class="number">${item.chargePercentage ? item.chargePercentage : '-'}</td>` +
			`<td id="speed-${id}" class="number">${item.maxSpeed ? item.maxSpeed : '-'}</td>` +
			'</tr>');
	});
}

function dropTransportFiltered() {
	document.getElementById("ident-filter").value = '';
	document.getElementById("p-name-filter").value = '';
	document.getElementById("cond-filter").selectedIndex = 0;
	document.getElementById("t-status-filter").selectedIndex = 0;
	initTransportPage();
}

function initCustomersPage() {
	customerService.getCustomersPageable(fillCustomers);
}

function initCustomersPageFiltered() {
	var login = $("#login-filter").val();
	var role = $("#role-filter").val();
	var filter = {
		login: login == '' ? null : login,
		role: role == '' ? null : role,
		page: 0,
		size: 100
	}
	customerService.getCustomersPageable(fillCustomers, filter);
}

function fillCustomers(customers) {
	var tableBody = $('div#customers-container table tbody');
	tableBody.empty();
	customers.content.forEach(item => {
		var role = item.role;
		if(role == 'USER'){
			role = 'Пользователь';
		}
		else if(role == 'MANAGER' ) {
			role = 'Менеджер';
		}
		else {
			role = 'Администратор';
		}
		tableBody.append(
			'<tr>' +
			`<td>${item.login}</td>` +
			`<td>${item.balance}</td>` +
			`<td>${role}</td>` +
			`<td>${item.tripCount}</td>` +
			'</tr>');
	});
}

function dropCustomersFiltered() {
	document.getElementById("login-filter").value = '';
	document.getElementById("role-filter").selectedIndex = 0;
	initCustomersPage();
}

function initParkingPage() {
	parkingService.getParkingPageable(fillParking);
}

function initParkingPageFiltered() {
	var name = $("#name-filter").val();
	var type = $("#type-filter").val();
	var status = $("#status-filter").val();
	var filter = {
		name: name == '' ? null : name,
		type: type == '' ? null : type,
		status: status == '' ? null : status,
		page: 0,
		size: 100
	}
	parkingService.getParkingPageable(fillParking, filter);
}

function dropParkingFiltered() {
	document.getElementById("name-filter").value = '';
	document.getElementById("type-filter").selectedIndex = 0;
	document.getElementById("status-filter").selectedIndex = 0;
	initParkingPage();
}

function initPricePage() {
	var tableBody = $('div#price-container table tbody');
	tableBody.empty();
	['BICYCLE', 'SCOOTER'].forEach(type => {
		priceService.getPrice(type, function (price) {
			tableBody.append(
				'<tr>' +
				`<td id="name-${type}" class="immutable">${type == "SCOOTER" ? "Самокат" : "Велосипед"}</td>` +
				`<td id="init-${type}">${price.init}</td>` +
				`<td id="minute-${type}">${price.perMinute}</td>` +
				'</tr>'
			);
		});
	});
}

function fillParking(parkingList) {
	var tableBody = $('div#parking-container table tbody');
	tableBody.empty();
	parkingList.content.forEach(item => {
		var id = item.id;
		var type, status;

		type = item.type;
		if(type == "ALL") {
			type = "Все";
		}
		else if(type == "ONLY_BICYCLE") {
			type = "Только велосипеды";
		}
		else {
			type = "Только самокаты";
		}

		status = item.status;
		status = status == "ACTIVE" ? "Активна" : "Неактивна";

		tableBody.append(
			'<tr>' +
			`<td id="id-${id}" class="immutable">${id}</td>` +
			`<td id="name-${id}" class="immutable">${item.name}</td>` +
			`<td id="coor-${id}">${item.coordinates}</td>` +
			`<td id="rad-${id}" class="number">${item.allowedRadius}</td>` +
			`<td id="park_type-${id}" class="immutable">${type}</td>` +
			`<td id="park_status-${id}" class="status-selector">${status}</td>` +
			`<td class="immutable">${item.transports.length}</td>` +
			'</tr>');
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
	var typeName = vehicle.type == 'BICYCLE' ? 'Велосипед' : 'Cамокат';
	content = 	`<strong>${typeName} ${vehicle.identificationNumber}</strong><br>` +
				`Статус: ${statusName}<br>`;
	if(vehicle.parking != null) {
		content += `Парковка: ${vehicle.parking.name}<br>`;
	}

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


$(function () {
	var conditionSelector =
		"<select id='sel'>" +
			"<option>Отлично</option>" +
			"<option>Хорошо</option>" +
			"<option>Посредственно</option>"
		"</select>";

	var statusSelector =
		"<select id='sel'> " +
			"<option>Свободен</option>" +
			"<option>Занят</option>" +
			"<option>Недоступен</option>" +
		"</select>";

	$('.transportTable').on('dblclick', 'td', function () {

		var tdClass =$(this).attr("class");
		if(tdClass == 'immutable') {
			return;
		}
		var origContent = $(this).text();

		var inputType;
		var select = false;
		if(tdClass == 'condition-selector') {
			inputType = conditionSelector;
			select = true;
		}
		else if(tdClass == 'status-selector') {
			inputType = statusSelector;
			select = true;
		}
		else if(tdClass == 'park-selector') {
			inputType = "<select id='sel'>";
			parkingList.forEach(item => {
				inputType += "<option>" + item.name + "</option>";
			})
			inputType += "<option>-</option></select>";
			select = true;
		}
		else if(tdClass == 'number') {
			inputType = "<input type='number' value='" + origContent + "' />";
		}
		else {
			inputType = "<input type='text' value='" + origContent + "' />";
		}

		$(this).html(inputType);
		if(select) {
			changeSelected(document.getElementById('sel'), origContent);
		}
		$(this).children().first().focus();

		$(this).children().first().keypress(function (e) {
			if (e.which == 13) {
				var newContent;
				if(select) {
					var sel = document.getElementById('sel');
					newContent = sel.options[sel.selectedIndex].innerText;
				}
				else {
					newContent = $(this).val();
				}
				var elem = $(this).parent();
				elem.text(newContent);
				var id = elem.attr("id").split("-")[1];
				var transport = {
					"identificationNumber" : document.getElementById('ident-' + id).innerText,
					"coordinates" : document.getElementById('coor-' + id).innerText,
					"condition" : document.getElementById('cond-' + id).innerText,
					"status" : document.getElementById('status-' + id).innerText,
					"chargePercentage" : document.getElementById('charge-' + id).innerText,
					"maxSpeed" : document.getElementById('speed-' + id).innerText,
					"parking" : {
						"name" : document.getElementById('park-' + id).innerText
					}
				};

				var condition = transport["condition"];
				console.log(condition);
				console.log(transport);
				if(condition == 'Отлично') {
					condition = 'EXCELLENT';
				}
				else if(condition == 'Хорошо') {
					condition = 'GOOD';
				}
				else {
					condition = 'SATISFACTORY';
				}
				transport["condition"] = condition;

				var status = transport["status"];
				if(status == 'Свободен') {
					status = 'FREE';
				}
				else if(status == 'Занят') {
					status = 'BUSY';
				}
				else {
					status = 'UNAVAILABLE';
				}
				transport["status"] = status;

				var type = transport["type"];
				transport["type"] = type == 'Самокат' ? 'SCOOTER' : 'BICYCLE';

				var charge = transport["chargePercentage"];
				transport["chargePercentage"] = charge == '-' ? null : charge;

				var speed = transport["maxSpeed"];
				transport["maxSpeed"] = speed == '-' ? null : speed;

				var coordinates = transport["coordinates"];
				transport["coordinates"] = coordinates == '-' ? null : coordinates;

				if(transport["parking"]["name"] == '-'){
					transport["parking"]["name"] = null;
				}
				transportService.updateTransport(transport, {});
			}
		});

		$(this).children().first().blur(function(){
			$(this).parent().text(origContent);
		});

	});
});

$(function () {
	var statusSelector =
		"<select id='sel'> " +
		"<option>Активна</option>" +
		"<option>Неактивна</option>" +
		"</select>";

	$('.parkingTable').on('dblclick', 'td', function () {

		console.log("Начало")
		var tdClass =$(this).attr("class");
		if(tdClass == 'immutable') {
			console.log("Неизменяемая")
			return;
		}
		var origContent = $(this).text();

		var inputType;
		var select = false;
		if(tdClass == 'status-selector') {
			inputType = statusSelector;
			select = true;
		}
		else if(tdClass == 'number') {
			inputType = "<input type='number' value='" + origContent + "' />";
		}
		else {
			inputType = "<input type='text' value='" + origContent + "' />";
		}

		$(this).html(inputType);
		if (select) {
			changeSelected(document.getElementById('sel'), origContent);
		}

		$(this).children().first().focus();

		$(this).children().first().keypress(function (e) {
			if (e.which == 13) {
				var newContent;
				if(select) {
					var sel = document.getElementById('sel');
					newContent = sel.options[sel.selectedIndex].innerText;
				}
				else {
					newContent = $(this).val();
				}
				if(newContent == origContent) {
					return;
				}
				var elem = $(this).parent();
				elem.text(newContent);
				var id = elem.attr("id").split("-")[1];
				var parking = {
					"name" : document.getElementById('name-' + id).innerText,
					"coordinates" : document.getElementById('coor-' + id).innerText,
					"allowedRadius" : document.getElementById('rad-' + id).innerText,
					"type" : document.getElementById('park_type-'+id).innerText,
					"status" : document.getElementById('park_status-' + id).innerText
				};

				var status = parking["status"];
				status = status == "Активна" ? "ACTIVE" : "NON_ACTIVE";
				parking["status"] = status;

				var type = parking["type"];
				if(type == 'Все') {
					type = 'ALL';
				}
				else if(type == 'Только велосипеды') {
					type = "ONLY_BICYCLE";
				}
				else {
					type = "Только самокаты";
				}
				parking["type"] = type;

				parkingService.updateParking(parking, {});
			}
		});

		$(this).children().first().blur(function(){
			$(this).parent().text(origContent);
		});

	});
});

$(function () {
	$('.priceTable').on('dblclick', 'td', function () {
		var tdClass =$(this).attr("class");
		if(tdClass == 'immutable') {
			return;
		}
		var OriginalContent = $(this).text();
		$(this).html("<input type='number' value='" + OriginalContent + "' />");
		$(this).children().first().focus();

		$(this).children().first().keypress(function (e) {
			if (e.which == 13) {
				var newContent = $(this).val();
				var elem = $(this).parent();
				elem.text(newContent);
				var type = elem.attr("id").split("-")[1];
				var price = {
					"init" : document.getElementById('init-' + type).innerText,
					"perMinute" : document.getElementById('minute-' + type).innerText
				};

				priceService.updatePrice(type, price, {});
			}
		});

		$(this).children().first().blur(function(){
			$(this).parent().text(OriginalContent);
		});

	});
});

function changeSelected(select, text) {
	console.log(select)
	for(var i = 0; i < select.options.length; i++) {
		if (select[i].value == text) {
			select.selectedIndex = i;
		}
	}
}