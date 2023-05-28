package com.front.auth.model.entity;

import com.front.auth.model.enums.CustomerStatus;
import com.front.auth.model.enums.Role;

public class Customer {
    private Long id;
    private String login;
    private String password;
    private Long balance;
    private Role role;
    private CustomerStatus status;

    public Long getId() {
        return id;
    }

    public String getLogin() {
        return login;
    }

    public String getPassword() {
        return password;
    }

    public Long getBalance() {
        return balance;
    }

    public Role getRole() {
        return role;
    }

    public CustomerStatus getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setBalance(Long balance) {
        this.balance = balance;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setStatus(CustomerStatus status) {
        this.status = status;
    }
}
