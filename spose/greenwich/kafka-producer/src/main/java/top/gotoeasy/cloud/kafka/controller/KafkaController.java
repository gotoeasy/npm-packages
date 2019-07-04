package top.gotoeasy.cloud.kafka.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import top.gotoeasy.cloud.kafka.service.KafkaProducerService;

@RestController
public class KafkaController {

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @RequestMapping("/send")
    public boolean send(@RequestParam("topic") String topic, @RequestParam("message") String message) {
        return kafkaProducerService.send(topic, message);
    }

}
