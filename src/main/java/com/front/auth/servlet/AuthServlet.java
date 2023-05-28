package com.front.auth.servlet;

import com.front.auth.access.Registration;
import com.front.auth.configuration.ApplicationConfig;
import com.front.auth.controller.Dispatcher;
import com.front.auth.dao.CustomerControllerDao;
import com.front.auth.model.entity.Customer;
import com.front.auth.utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;

@WebServlet("/auth")
public class AuthServlet extends Dispatcher {

    private final Logger log = LoggerFactory.getLogger(AuthServlet.class);

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ApplicationConfig.class);

        Customer customer;
        String login = request.getParameter("login");
        String password = request.getParameter("password");
        try {
            CustomerControllerDao customerController = context.getBean(CustomerControllerDao.class);
            log.info("Авторизация пользователя {}", login);
            customer = customerController.getEntityByLoginPassword(login, password);
        } catch (SQLException e) {
            log.info("Ошибка авторизации пользователя {}", login);
            throw new RuntimeException(e);
        }

        if(customer == null){
            log.info("Ошибка авторизации {} - пользователь не найден", login);
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Ошибка авторизации - пользователь не найден");
        }
        else{
            String token = JwtUtil.getJwtDays(customer, 7);
            HttpSession session = request.getSession();
            session.setAttribute("token", token);
            response.getWriter().println("{\"token\":\"" + token + "\"}");
            response.setContentType("application/json");
            log.info("Авторизация пользователя {} пройдена успешно", login);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApplicationContext context = new AnnotationConfigApplicationContext(ApplicationConfig.class);

        String login = request.getParameter("login");
        String password = request.getParameter("password");
        String confirmPassword = request.getParameter("confirmPassword");

        if(Registration.checkRegistration(login, password, confirmPassword)){
            Customer customer = AddCustomer.createNewCustomer(login, password);
            log.info("{}", customer.getLogin());

            try {
                CustomerControllerDao userController = context.getBean(CustomerControllerDao.class);
                boolean successRegistration = userController.create(customer);
                log.info("{}", successRegistration);
                if (successRegistration) {
                    response.setContentType("application/json; charset=UTF-8");
                    String json = "{ " +
                            "\"login\" : \"" + customer.getLogin() + "\", " +
                            "\"password\":\"" + customer.getPassword() + "\", " +
                            "\"balance\":" + customer.getBalance() + "," +
                            "\"role\":\"" + customer.getRole() + "\"" +
                            "}";
                    PrintWriter writer = response.getWriter();
                    writer.println(json);
                    writer.flush();
                } else {
                    response.sendError(HttpServletResponse.SC_BAD_REQUEST);
                }
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
