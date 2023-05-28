<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<html>
	<head>
		<title>IRent</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
		<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
		<script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;apikey=fe70a204-82ee-47c1-9ade-c0fd218c5c7e" type="text/javascript"></script>

		<script src="jquery-3.6.0.min.js" type="text/javascript"></script>
		<script src="rest.js" type="text/javascript"></script>
		<script src="main.js" type="text/javascript"></script>
		<link href="main.css" rel="stylesheet">

	</head>
	<body>
		<div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
			<div id="toast" class="toast hide text-white bg-danger" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="toast-header">
				<strong class="me-auto">Ошибка</strong>
				<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
				<div class="toast-body">
				Ошибка
				</div>
			</div>
		</div>

		<nav class="navbar sticky-top navbar-expand-lg navbar-dark bg-dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="#">IRent</a>
			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav me-auto mb-2 mb-lg-0">
				<li id="link_map" class="nav-item">
					<a class="nav-link active" href="#map-container">Карта</a>
				</li>
				<li id="link_parking" class="nav-item">
					<a class="nav-link" href="#parking-container">Парковки</a>
				</li>
				<li id="link_transport" class="nav-item">
					<a class="nav-link" href="#transport-container">Транспорт</a>
				</li>
				<li id="link_customers" class="nav-item">
					<a class="nav-link" href="#customers-container">Пользователи</a>
				</li>
				<li id="link_trips" class="nav-item">
					<a class="nav-link" href="#trips-container">Аренды</a>
				</li>
				<li id="link_price" class ="nav-item">
					<a class="nav-link" href="#price-container">Цена</a>
				</li>
			</ul>	
			<form class="form-inline nav-form" action="logout" method="post">
				<span id="customer-login"></span><span id="customer-balance"></span>
				<button id="logout" class="btn btn-outline-success my-2 my-sm-0" type="submit">Выход</button>
			</form>	  
			</div>		
		</div>
		</nav>
		<div id="map-container" class="page-container container-fluid">
			<div id="common-toolbar" class="bg-light"> 
				<form id="parking-form" class="row">
					<div class="col-auto">
						<input id="parking-name" type="text" class="form-control" placeholder="Название" aria-label="Название">
					</div>
					<div class="col-auto">
						<input id="parking-radius" type="number" min="50" max="500" class="form-control" value="200" placeholder="Радиус, м" aria-label="Радиус, м">
					</div>
					<div class="col-auto">
						<button id="create-parking" type="button" class="btn btn-primary">ОК</button>
					</div>
					<div class="col-auto">
						<button type="button" class="btn btn-light cancel">Отмена</button>
					</div>
				</form>
				<form id="vehicle-form" class="row">
					<div class="col-auto">
						<select id="vehicle-type" class="form-select" >
							<option value="BICYCLE">Велосипед</option>
							<option value="SCOOTER">Электросамокат</option>
						</select>
					</div>
					<div class="col-auto">
						<select id="vehicle-parking" class="form-select">							
						</select>
					</div>
					<div class="col-auto">
						<button id="create-vehicle" type="button" class="btn btn-primary">ОК</button>
					</div>
					<div class="col-auto">
						<button type="button" class="btn btn-light cancel">Отмена</button>
					</div>
				</form>
				
				<form id="toolbar" class="row">
					<div class="col">
						<button id="init-create-parking" type="button" class="btn btn-primary float-end">Создать парковку</button>
						<button id="init-create-vehicle" type="button" class="btn btn-primary float-end">Создать ТС</button>
					</div>
				</form>	
			</div>
			<div id="map"></div>
		</div>

		<div id="parking-container" class="page-container">
			<div class="filter">
				<input id="name-filter" type="text" placeholder="Название" onchange="initParkingPageFiltered()"/>
				<select id="type-filter" onchange="initParkingPageFiltered()">
					<option value=></option>
					<option value="ALL">Все</option>
					<option value="ONLY_BICYCLE">Только велосипеды</option>
					<option value="ONLY_SCOOTER">Только самокаты</option>
				</select>
				<select id="status-filter" onchange="initParkingPageFiltered()">
					<option value=></option>
					<option value="ACTIVE">Активна</option>
					<option value="NON_ACTIVE">Неактивна</option>
				</select>
				<input type="submit" value="Сбросить" onclick="dropParkingFiltered()"/>
			</div>
			<table class="table parkingTable">
				<thead>
				<tr>
					<th scope="col">ID</th>
					<th scope="col">Название</th>
					<th scope="col">Координаты</th>
					<th scope="col">Радиус, м</th>
					<th scope="col">Тип</th>
					<th scope="col">Статус</th>
					<th scope="col">Количество транспортов</th>
				</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>

		<div id="transport-container" class="page-container">
			<div class="filter">
				<input id="ident-filter" type="text" placeholder="Номер" onchange="initTransportPageFiltered()"/>
				<input id="p-name-filter" type="text" placeholder="Парковка" onchange="initTransportPageFiltered()"/>
				<select id="cond-filter" onchange="initTransportPageFiltered()">
					<option value=></option>
					<option value="EXCELLENT">Отлично</option>
					<option value="GOOD">Хорошо</option>
					<option value="SATISFACTORY">Посредственно</option>
				</select>
				<select id="t-status-filter" onchange="initTransportPageFiltered()">
					<option value=></option>
					<option value="FREE">Свободен</option>
					<option value="BUSY">Занят</option>
					<option value="UNAVAILABLE">Недоступен</option>
				</select>
				<input type="submit" value="Сбросить" onclick="dropTransportFiltered()"/>
			</div>
			<table class="table transportTable">
				<thead>
				<tr>
					<th scope="col">ID</th>
					<th scope="col">Тип</th>
					<th scope="col">Номер</th>
					<th scope="col">Координаты</th>
					<th scope="col">Парковка</th>
					<th scope="col">Состояние</th>
					<th scope="col">Статус</th>
					<th scope="col">Зарядка</th>
					<th scope="col">Макс скорость</th>
				</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>

		<div id="customers-container" class="page-container">
			<div class="filter">
				<input id="login-filter" type="text" placeholder="Логин" onchange="initCustomersPageFiltered()"/>
				<select id="role-filter" onchange="initCustomersPageFiltered()">
					<option value=></option>
					<option value="USER">Пользователь</option>
					<option value="MANAGER">Менеджер</option>
					<option value="ADMIN">Администратор</option>
				</select>
				<input type="submit" value="Сбросить" onclick="dropCustomersFiltered()"/>
			</div>
			<table class="table">
				<thead>
				<tr>
					<th scope="col">Логин</th>
					<th scope="col">Баланс</th>
					<th scope="col">Роль</th>
					<th scope="col">Количество поездок</th>
				</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>

		<div id="trips-container" class="page-container">
			<div class="filter">
				<input id="r-login-filter" type="text" placeholder="Логин пользователя" onchange="initTripsPageFiltered()"/>
				<input id="r-ident-filter" type="text" placeholder="Номер транспорта" onchange="initTripsPageFiltered()"/>
				<select id="r-status-filter" onchange="initTripsPageFiltered()">
					<option value=></option>
					<option value="OPEN">В процессе</option>
					<option value="CLOSE">Завершена</option>
				</select>
				<input type="submit" value="Сбросить" onclick="dropTripsFiltered()"/>
			</div>
			<table class="table">
				<thead>
				<tr>
					<th scope="col">ID</th>
					<th scope="col">Клиент</th>
					<th scope="col">ТС</th>
					<th scope="col">Статус</th>
					<th scope="col">Время начала/конца</th>
					<th scope="col">Парковки</th>
					<th scope="col">Цена, р.</th>
				</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>

		<div id="price-container" class="page-container">
			<table class="table priceTable">
				<thead>
				<tr>
					<th scope="col">Тип транспорта</th>
					<th scope="col">Цена старта, р</th>
					<th scope="col">Цена минуты, р</th>
				</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>
	</body>
</html>