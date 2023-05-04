var jwtToken = null;
var irentServiceUrl = 'http://localhost:8081/api/v1';

class CustomerService {
  customer;

  constructor() {
  }	
	
  loadCurrentCustomer(successMethod) {
	if(jwtToken) {
		callRestService('/customer/current', currentCustomer => {
			this.customer = currentCastomer;
			successMethod.call();
		});
	} else {
		this.getJwt(jwt => {
			jwtToken = JSON.parse(jwt);
			callRestService('/customer/current', currentCustomer => {
				this.customer = currentCustomer;
				successMethod.call();
			});
		})
	};
  }

  getCustomersPageable(successMethod) {
	  callRestService('/customer/all/pageable', successMethod, 'GET', {"page":0, "size":100});
  }
  
  getJwt(successMethod) {
    $.ajax({
		url: `/sct_front_auth_war/jwt`, // вызов сервлета
		success: successMethod,
		error: showErrorToast
	});
  }
}

class ParkingService {
  constructor() {
  }	
	
  getParkings(successMethod) {
    callRestService('/parking/all', successMethod);
  }

  getParkingPageable(successMethod, data = {page: 0, size: 100}) {
	  callRestService('/parking/all/pageable', successMethod, 'GET', data)
  }

  createParking(parking, successMethod) {
    callRestService('/parking', successMethod, 'POST', parking);
  }

  updateParking(parking, successMethod) {
	  callRestService('/parking', successMethod, 'PUT', parking);
  }

  deleteParking(id, successMethod) {
    callRestService(`/parking/${id}`, successMethod, 'DELETE');
  }
}

class TransportService {
  constructor() {
  }
	
  getTransports(successMethod) {
    callRestService('/transport/all', successMethod);
  }

  getTransportsPageable(successMethod) {
	  callRestService('/transport/all/pageable', successMethod, 'GET', {"page":0, "size":100})
  }

  createTransports(transport, successMethod) {
    callRestService('/transport', successMethod, 'POST', transport);
  }

  updateTransport(transport, successMethod) {
	  callRestService('/transport', successMethod, 'PUT', transport);
  }
} 

class RentService {
  constructor() {
  }
	
  getRents(successMethod) {
    callRestService('/rent/all/pageable', successMethod, 'GET', {"page": 0, "size": 100});
  }
}

class PriceService {
	constructor() {}

	getPrice(transportType, successMethod) {
		callRestService(`/price/${transportType}`, successMethod);
	}

	updatePrice(transportType, data, successMethod) {
		callRestService(`/price/${transportType}`, successMethod, 'PUT', data);
	}
}

function callRestService(restUrl, successMethod, method = 'GET', data = null) {
	$.ajax({
		url: `${irentServiceUrl}${restUrl}`,
		method: method,
		data: method == 'GET' ? getQuery(data) : JSON.stringify(data),
		headers: {
			"Authorization": `Bearer ${jwtToken.token}`,
			"Content-Type": 'application/json'
		},
		success: successMethod,
		error: showErrorToast
	});
}

function getQuery(data) {
	var query = '';
	for(key in data) {
		if (data[key] == null) {
			continue;
		}
		query += key + "=" + data[key] + '&'
	}
	return query.length > 0 ? query.slice(0, -1) : null;
}

function showErrorToast(error) {
	var errorBody = error.responseJSON;	
	var errorMessage = errorBody.message ? errorBody.message : 'Внутренняя ошибка сервиса';
	
	$('#toast .toast-body').html(errorMessage);
	$('#toast').toast('show');
}
