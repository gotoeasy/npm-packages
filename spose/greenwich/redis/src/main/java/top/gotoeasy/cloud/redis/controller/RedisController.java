package top.gotoeasy.cloud.redis.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;

import top.gotoeasy.cloud.redis.service.RedisService;

@RestController
public class RedisController {

    @Autowired
    private RedisService redisService;

    @RequestMapping("/set")
    public void set(@RequestParam("key") String key, @RequestParam("value") String value,
            @RequestParam(value = "expire", required = false) String expire) {
        redisService.set(key, value, expire);
    }

    @HystrixCommand(fallbackMethod = "fallbackGet")
    @RequestMapping("/get")
    public String get(@RequestParam("key") String key) {
        return redisService.get(key);
    }

    @RequestMapping("/delete")
    public void delete(@RequestParam("key") String key) {
        redisService.delete(key);
    }

    public String fallbackGet(String key) {
        return "<<fallback>>";
    }

}
