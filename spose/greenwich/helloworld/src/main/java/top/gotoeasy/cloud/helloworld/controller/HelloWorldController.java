package top.gotoeasy.cloud.helloworld.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import top.gotoeasy.cloud.helloworld.feign.FeignRedisService;

@RestController
public class HelloWorldController {

    @Autowired
    private FeignRedisService feignRedisService;

    @RequestMapping("/hello/{name}")
    public String hello(@PathVariable("name") String name) {
        String info = feignRedisService.get(name);
        return info == null ? ("hello " + name) : ("hello " + name + " (" + info + ")");
    }

}
