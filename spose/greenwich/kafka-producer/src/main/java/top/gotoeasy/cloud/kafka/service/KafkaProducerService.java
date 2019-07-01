package top.gotoeasy.cloud.kafka.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaProducerException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public boolean send(String topic, String message) {
        try {
            kafkaTemplate.send(topic, message).get();
            return true;
        } catch (Exception e) {
            throw new KafkaProducerException(null, message, e);
        }
    }

}
