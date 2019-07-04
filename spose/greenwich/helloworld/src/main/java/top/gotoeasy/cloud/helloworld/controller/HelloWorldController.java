package top.gotoeasy.cloud.helloworld.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import top.gotoeasy.cloud.helloworld.feign.FeignKafkaProducerService;
import top.gotoeasy.cloud.helloworld.feign.FeignRedisService;

@RestController
public class HelloWorldController {

    private final Logger              log = LoggerFactory.getLogger(HelloWorldController.class);

    @Autowired
    private FeignRedisService         feignRedisService;
    @Autowired
    private FeignKafkaProducerService feignKafkaProducerService;

    @RequestMapping("/hello/{name}")
    public String hello(@PathVariable("name") String name) {
        String info = feignRedisService.get(name); // 从redis取缓存信息
        log.info("/hello (name={}, info={})", name, info);

        return info == null ? ("hello " + name) : ("hello " + name + " (" + info + ")");
    }

    @RequestMapping("/send")
    public boolean send(@RequestParam(name = "topic", required = false) String topic,
            @RequestParam(name = "message", required = false) String message) {
        log.info("/send (topic={}, message={})", topic, message);
        return feignKafkaProducerService.send(topic, message); // 发送消息到kafka
    }
}
