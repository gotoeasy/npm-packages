package top.gotoeasy.cloud.helloworld.feign.fallback;

import org.springframework.stereotype.Component;

import top.gotoeasy.cloud.helloworld.feign.FeignKafkaProducerService;

@Component
public class FeignKafkaProducerFallback implements FeignKafkaProducerService {

    @Override
    public boolean send(String message) {
        return false;
    }

}
