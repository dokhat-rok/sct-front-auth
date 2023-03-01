package com.front.auth.utils;

import com.front.auth.model.entity.Customer;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.sql.Date;
import java.util.HashMap;
import java.util.Map;

public class JwtUtil {

    private static final long HOUR = 3_600_000;

    private static final long DAY = 86_400_000;

    private static String jwt(Customer customer, long milliSeconds){

        String secret = "SystemCityTransport";
        Map<String, Object> claims = new HashMap<>();
        claims.put("login", customer.getLogin());
        claims.put("role", customer.getRole());
        claims.put("balance", customer.getBalance());

        Date now = new Date(System.currentTimeMillis());
        Date expirationDate = new Date(now.getTime() + milliSeconds);

        return Jwts.builder().setClaims(claims).setSubject(customer.getId().toString()).setIssuedAt(now).setExpiration(expirationDate).signWith(SignatureAlgorithm.HS512, secret).compact();
    }

    public static String getJwtDays(Customer customer, long days){
        return jwt(customer, DAY * days);
    }

    public static String getJwtHours(Customer customer, long hours){
        return jwt(customer, HOUR * hours);
    }
}
