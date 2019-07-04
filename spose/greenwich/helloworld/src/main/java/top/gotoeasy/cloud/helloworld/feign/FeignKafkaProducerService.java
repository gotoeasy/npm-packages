package top.gotoeasy.cloud.helloworld.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import top.gotoeasy.cloud.helloworld.feign.fallback.FeignKafkaProducerFallback;

@FeignClient(value = "kafka-producer", fallback = FeignKafkaProducerFallback.class)
public interface FeignKafkaProducerService {

    @RequestMapping("/send")
    public boolean send(@RequestParam("topic") String topic, @RequestParam("message") String message);

}
