<html lang="ru">
    <%@page pageEncoding="UTF-8"%>
    <%request.setCharacterEncoding("UTF-8");%>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Страница успешного входа в систему</title>
    </head>
    <body>
        <br><h1>Вход посетителя в систему прошел успешно</h1>
        <jsp:useBean id="customer" class="com.front.auth.model.dto.CustomerDto" scope="application"/>
        Login: <%= customer.getLogin()%><br>
        Баланс: <%= customer.getBalance()%><br>
        <p></p>
        <button name="exit" onclick="window.location.href='<%=request.getContextPath()%>/login.html'">Выход</button>
    </body>
</html>