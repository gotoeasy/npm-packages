package top.gotoeasy.cloud.kafka.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    @KafkaListener(topics = "${kafka.topic}")
    public void getMessage(String message) {
        System.out.println("kafka 消费者监听处理消息:" + message);
    }

}
