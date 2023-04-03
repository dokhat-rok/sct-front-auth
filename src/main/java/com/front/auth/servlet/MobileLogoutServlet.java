package com.front.auth.servlet;

import com.front.auth.controller.Dispatcher;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/mobile/logout")
public class MobileLogoutServlet extends Dispatcher {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        request.getSession().invalidate();
    }
}
