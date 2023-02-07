package com.front.auth.servlet;

import com.front.auth.controller.Dispatcher;

import java.io.*;

import javax.servlet.*;

import javax.servlet.http.*;

public class Registration extends Dispatcher {

    public String getServletInfo(){
        return "Registration servlet";
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (request.getParameter("submit_login")!=null){
            this.forward("/CheckUser", request, response);
        }
        else if (request.getParameter("submit_registration")!=null) {
            this.forward("/registration.html", request, response);
        }
    }

}
