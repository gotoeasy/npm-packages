package top.gotoeasy.cloud.helloworld;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableCircuitBreaker
@SpringBootApplication
@EnableFeignClients(basePackageClasses = HwlloWorldServiceApplication.class)
public class HwlloWorldServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HwlloWorldServiceApplication.class, args);
    }

}
