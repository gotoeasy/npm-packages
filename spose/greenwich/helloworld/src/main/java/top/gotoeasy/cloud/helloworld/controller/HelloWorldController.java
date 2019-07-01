package top.gotoeasy.cloud.helloworld.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import top.gotoeasy.cloud.helloworld.feign.FeignKafkaProducerService;
import top.gotoeasy.cloud.helloworld.feign.FeignRedisService;

@RestController
public class HelloWorldController {

    @Autowired
    private FeignRedisService         feignRedisService;
    @Autowired
    private FeignKafkaProducerService feignKafkaProducerService;

    @RequestMapping("/hello/{name}")
    public String hello(@PathVariable("name") String name) {
        String info = feignRedisService.get(name); // 从redis取缓存信息
        return info == null ? ("hello " + name) : ("hello " + name + " (" + info + ")");
    }

    @RequestMapping("/send")
    public boolean send(@RequestParam("message") String message) {
        return feignKafkaProducerService.send(message); // 发送消息到kafka
    }
}
