package com.front.auth.servlet;

import com.front.auth.configuration.ApplicationConfig;
import com.front.auth.controller.Dispatcher;
import com.front.auth.dao.CustomerControllerDao;
import com.front.auth.model.dto.CustomerDto;
import com.front.auth.model.entity.Customer;
import com.front.auth.utils.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.SQLException;

public class CheckCustomer extends Dispatcher {

    private static final Logger log = LoggerFactory.getLogger(CheckCustomer.class);

    public String getServletInfo(){
        return "CheckCustomer servlet";
    }
    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ApplicationConfig.class);
        String login = request.getParameter("login");
        String password = request.getParameter("password");
        Customer customer = null;
        try {
            customer = context.getBean(CustomerControllerDao.class).getEntityByLoginPassword(login, password);
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        if (customer == null){
            log.info("Неуспешный логин пользователя {}", login);
            this.forward("/registration.html", request, response);
        }
        else {
            CustomerDto customerDto = new CustomerDto();
            customerDto.setId(customer.getId());
            customerDto.setLogin(customer.getLogin());
            customerDto.setBalance(customer.getBalance());
            customerDto.setRole(customer.getRole());
            servletContext.setAttribute("customer", customerDto);

            String token = JwtUtil.getJwtHours(customer, 1);
            HttpSession session = request.getSession();
            session.setAttribute("token", token);
            log.debug("Логин пользователя {} ", customerDto.getLogin());
            response.sendRedirect(request.getContextPath() + "/main.jsp");
        }
    }
}