package com.front.auth.configuration;

import com.front.auth.dao.DBConnectionManager;
import com.front.auth.dao.CustomerControllerDao;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "classpath:/application.properties")
public class ApplicationConfig {
    @Bean
    public DBConnectionManager dbConnectionManager(){
        System.out.println(DBConnectionManager.class);
        return new DBConnectionManager();
    }

    @Bean
    public CustomerControllerDao userControllerDao(){
        System.out.println(CustomerControllerDao.class);
        return new CustomerControllerDao(this.dbConnectionManager());
    }

}
