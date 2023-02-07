package com.front.auth.access;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Registration {
    public static boolean checkRegistration(String login, String password, String  confirmPassword){
        Pattern pattern = Pattern.compile("[a-zA-z0-9_]{1,20}");
        try{
            Matcher matcher = pattern.matcher(login);
            if(!matcher.matches()){
                throw new WrongLoginException("Ошибка ввода логина");
            }

            matcher = pattern.matcher(password);
            if(!matcher.matches() || !password.equals(confirmPassword)){
                throw new WrongPasswordException("Ошибка ввода пароля");
            }
            return true;
        }
        catch (WrongLoginException | WrongPasswordException w){
            System.out.println(w.toString());
            return false;
        }
    }
}
