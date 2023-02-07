package com.front.auth.model.dto;

import com.front.auth.model.enums.Role;

public class CustomerDto {
    private Long id;
    private String login;
    private Long balance;
    private Role role;

    public Long getId() {
        return id;
    }

    public String getLogin() {
        return login;
    }

    public Long getBalance() {
        return balance;
    }

    public Role getRole() {
        return role;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public void setBalance(Long balance) {
        this.balance = balance;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
