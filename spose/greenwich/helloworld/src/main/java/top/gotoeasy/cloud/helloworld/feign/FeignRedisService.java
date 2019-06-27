package top.gotoeasy.cloud.helloworld.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import top.gotoeasy.cloud.helloworld.feign.fallback.FeignRedisFallback;

@FeignClient(value = "redis", fallback = FeignRedisFallback.class)
public interface FeignRedisService {

    @RequestMapping("/get")
    public String get(@RequestParam("key") String key);

}
