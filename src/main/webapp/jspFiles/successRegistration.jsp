<html lang="ru">
    <%@page pageEncoding="UTF-8"%>
    <%request.setCharacterEncoding("UTF-8");%>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Страница подтверждения успешной регистрации посетителя</title>
    </head>
    <body>
        <h1>Регистрация посетителя успешно завершена</h1>
        <jsp:useBean id="customer" class="com.front.auth.model.dto.CustomerDto" scope="application"/>
        Пользователь: <%= customer.getLogin()%><br>
        Роль: <%= customer.getRole()%><br>
        Зарегистрирован.<br><br>
        <a href="<%=request.getContextPath()%>/login.html">Войти в систему</a>
    </body>
</html>