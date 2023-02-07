package com.front.auth.access;

public class WrongLoginException extends Exception{
    public WrongLoginException(){

    }
    public WrongLoginException(String e){
        super(e);
    }
}
