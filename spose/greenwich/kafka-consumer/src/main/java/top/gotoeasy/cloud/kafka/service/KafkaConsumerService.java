package top.gotoeasy.cloud.kafka.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    @KafkaListener(topics = "${kafka.topic}")
    public void onMessage(String message, Acknowledgment acknowledgment) {
        // 消费处理消息
        System.out.println("消费处理:" + message);

        // 手动更新offset(需自动更新时删除Acknowledgment参数取消调用即可)
        acknowledgment.acknowledge();
    }

}
