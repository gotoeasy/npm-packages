package top.gotoeasy.cloud.elasticsearch.service;

import java.util.HashMap;
import java.util.Map;

import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class Kafka2EsService {

    private final Logger        log = LoggerFactory.getLogger(Kafka2EsService.class);

    @Autowired
    private RestHighLevelClient client;

    @Value("${elasticsearch.index:idx-log}")
    private String              index;

    @KafkaListener(topics = "${kafka.topic:topic-log}")
    public void onMessage(String message) {

        Map<String, String> map = new HashMap<>();
        map.put("log", message);

        try {
            IndexRequest indexRequest = new IndexRequest(index).source(map);
            client.index(indexRequest, RequestOptions.DEFAULT);
        } catch (Exception e) {
            log.error(message, e);
        }
    }

}
