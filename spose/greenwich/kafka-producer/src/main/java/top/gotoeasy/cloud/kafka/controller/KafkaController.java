package top.gotoeasy.cloud.kafka.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import top.gotoeasy.cloud.kafka.service.KafkaProducerService;

@RestController
public class KafkaController {

    @Value("${kafka.topic}")
    private String               topic;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @RequestMapping("/send")
    public boolean send(@RequestParam("message") String message) {
        return kafkaProducerService.send(topic, message);
    }

}
