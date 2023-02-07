package com.front.auth.model.enums;

public enum Role {
    USER, ADMIN;

    public static Role getRole(String role){
        return switch(role){
            case "USER" -> Role.USER;
            case "ADMIN" -> Role.ADMIN;
            default -> null;
        };
    }

    public static String getRoleString(Role role){
        return switch(role){
            case USER -> "USER";
            case ADMIN -> "ADMIN";
        };
    }
}
