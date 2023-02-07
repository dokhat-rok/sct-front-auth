package com.front.auth.controller;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;
import java.io.IOException;
import javax.servlet.RequestDispatcher;
import javax.servlet.http.*;

public class Dispatcher extends HttpServlet  {

    protected ServletContext servletContext;

    @Override
    public void init(){
        servletContext = getServletContext();
    }

    protected void forward(String address, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
        RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(address);
        dispatcher.forward(request, response);
    }
}
