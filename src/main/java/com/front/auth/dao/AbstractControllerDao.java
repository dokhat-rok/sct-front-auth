package com.front.auth.dao;
import java.sql.*;
import java.util.List;

public abstract class AbstractControllerDao<E, K> {
    private final DBConnectionManager dbConnectionManager;

    public abstract List<E> getAll();
    public abstract E update(E entity);
    public abstract E getEntityById(K id);
    public abstract boolean delete(K id);
    public abstract boolean create(E entity) throws SQLException;

    public AbstractControllerDao(DBConnectionManager dbConnectionManager){
        this.dbConnectionManager = dbConnectionManager;
    }

    // Получение экземпляра PrepareStatement
    public PreparedStatement getPrepareStatement(String sql) throws SQLException {
        Connection connection = dbConnectionManager.getConnection();
        PreparedStatement ps = null;
        try {
            ps = connection.prepareStatement(sql);
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return ps;
    }

    // Закрытие PrepareStatement
    public void closePrepareStatement(PreparedStatement ps){
        if (ps != null) {
            try {
                ps.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    // Получение экземпляра Statement
    public Statement getStatement() throws SQLException {
        Connection connection = dbConnectionManager.getConnection();
        Statement s = null;
        try {
            s = connection.createStatement();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return s;
    }

    // Закрытие Statement
    public void closeStatement(Statement s){
        if (s != null) {
            try {
                s.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
