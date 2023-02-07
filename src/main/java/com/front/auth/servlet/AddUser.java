package com.front.auth.servlet;

import com.front.auth.access.Registration;
import com.front.auth.configuration.ApplicationConfig;
import com.front.auth.controller.Dispatcher;
import com.front.auth.dao.CustomerControllerDao;
import com.front.auth.model.dto.CustomerDto;
import com.front.auth.model.enums.Role;
import com.front.auth.model.entity.Customer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class AddUser extends Dispatcher {
    public String getServletInfo(){
        return "Add user servlet";
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApplicationContext context = new AnnotationConfigApplicationContext(ApplicationConfig.class);

        if (request.getParameter("save") != null) {
            String login = request.getParameter("login");
            String password = request.getParameter("password");
            String confirmPassword = request.getParameter("confirm_password");

            boolean confirmRegistration = Registration.checkRegistration(login, password, confirmPassword);

            if (confirmRegistration) {
                Customer customer = new Customer();
                customer.setId(0L);
                customer.setLogin(login);
                customer.setPassword(password);
                customer.setBalance(0L);
                customer.setRole(Role.USER);

                try {
                    CustomerControllerDao userController = context.getBean(CustomerControllerDao.class);
                    boolean successRegistration = userController.create(customer);
                    if (successRegistration) {
                        customer = userController.getEntityByLoginPassword(login, password);
                        CustomerDto customerDto = new CustomerDto();
                        customerDto.setLogin(customer.getLogin());
                        customerDto.setBalance(customer.getBalance());
                        customerDto.setRole(customer.getRole());
                        servletContext.setAttribute("user", customerDto);
                        this.forward("/jspFiles/successRegistration.jsp", request, response);
                    }
                    else {
                        this.forward("/htmlFiles/errorRegistration.html", request, response);
                    }
                }
                catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            else {
                this.forward("/errorRegistration.html", request, response);
            }
        }
        else if (request.getParameter("cancel") != null) {
            this.forward("/login.html", request, response);
        }
    }
}
