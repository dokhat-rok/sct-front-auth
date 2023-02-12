package com.front.auth.servlet;

import com.front.auth.controller.Dispatcher;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/jwt")
public class JwtTokenServlet extends Dispatcher {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();
        String token = (String) session.getAttribute("customerJwt");
        PrintWriter writer = response.getWriter();
        writer.println(token);
    }
}
