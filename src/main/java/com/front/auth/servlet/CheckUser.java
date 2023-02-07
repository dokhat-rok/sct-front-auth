package com.front.auth.servlet;

import com.front.auth.configuration.ApplicationConfig;
import com.front.auth.controller.Dispatcher;
import com.front.auth.dao.CustomerControllerDao;
import com.front.auth.model.dto.CustomerDto;
import com.front.auth.model.entity.Customer;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.io.*;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.*;
import javax.servlet.http.*;

public class CheckUser extends Dispatcher {
    /*private final Logger log = LoggerFactory.getLogger("com.project.servlet");*/
    private static final Logger log = LoggerFactory.getLogger(CheckUser.class);

    public String getServletInfo(){
        return "CheckUser servlet";
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
            servletContext.setAttribute("user", customerDto);

            String secret = "SystemCityTransport";
            Map<String, Object> claims = new HashMap<>();
            claims.put("login", customer.getLogin());
            claims.put("role", customer.getRole());
            claims.put("balance", customer.getBalance());

            Date now = new Date(System.currentTimeMillis());
            Date expirationDate = new Date(now.getTime() + 60 * 60 * 1000);

            String token = Jwts.builder().setClaims(claims).setSubject(customer.getId().toString()).setIssuedAt(now).setExpiration(expirationDate).signWith(SignatureAlgorithm.HS512, secret).compact();
            HttpSession session = request.getSession();
            session.setAttribute("userJwt", token);
            log.debug("Логин пользователя {} ", customerDto.getLogin());
            response.sendRedirect(request.getContextPath() + "/main.jsp");
        }
    }
}