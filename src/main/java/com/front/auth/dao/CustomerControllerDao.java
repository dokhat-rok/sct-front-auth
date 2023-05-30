package com.front.auth.dao;

import com.front.auth.model.entity.Customer;
import com.front.auth.model.enums.CustomerStatus;
import com.front.auth.model.enums.Role;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

public class CustomerControllerDao extends AbstractControllerDao<Customer, Integer> {

    public CustomerControllerDao(DBConnectionManager dbConnectionManager) {
        super(dbConnectionManager);
    }

    @Override
    public List<Customer> getAll() {
        return null;
    }

    @Override
    public Customer update(Customer entity) {
        return null;
    }

    @Override
    public Customer getEntityById(Integer id) {
        return null;
    }


    public Customer getEntityByLoginPassword(String requestLogin, String requestPassword) throws SQLException {
        String query = "SELECT ID, BALANCE, ROLE, STATUS FROM CUSTOMER WHERE LOGIN = '" + requestLogin + "' AND PASSWORD = '"
                + requestPassword + "' AND STATUS = '" + CustomerStatus.ACTIVE.name() + "';";
        PreparedStatement preparedStatement = super.getPrepareStatement(
                query
        );
        ResultSet rs = preparedStatement.executeQuery();
        if(rs.next()){
            Customer customer = new Customer();
            customer.setId(rs.getLong(1));
            customer.setLogin(requestLogin);
            customer.setPassword(requestPassword);
            customer.setBalance(rs.getLong(2));
            customer.setRole(Role.valueOf(rs.getString(3)));
            super.closePrepareStatement(preparedStatement);
            return customer;
        }
        super.closePrepareStatement(preparedStatement);
        return null;
    }

    @Override
    public boolean delete(Integer id) {
        return false;
    }

    @Override
    public boolean create(Customer customer) throws SQLException {

        Statement statement = super.getStatement();
        ResultSet rs = statement.executeQuery("select ID, LOGIN FROM CUSTOMER");
        long lastId = 0;
        boolean confirmUnique = true;
        while(rs.next()){
            long id = rs.getLong(1);
            String confirmLogin = rs.getString(2);

            lastId = id;
            confirmUnique = !customer.getLogin().equals(confirmLogin);
        }
        if(confirmUnique){
            String query = "insert into CUSTOMER values (" + (lastId + 1) + ", '" + customer.getLogin() + "', '"
                    + customer.getPassword() + "', " + customer.getBalance() + ",  '" + customer.getRole()
                    +"', '" + customer.getStatus() + "');";
            System.out.println(query);
            statement.executeUpdate(
                    query
            );
            super.closeStatement(statement);
            return true;
        }

        super.closeStatement(statement);
        return false;
    }
}
