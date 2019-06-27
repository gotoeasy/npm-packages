package top.gotoeasy.cloud.helloworld.feign.fallback;

import org.springframework.stereotype.Component;

import top.gotoeasy.cloud.helloworld.feign.FeignRedisService;

@Component
public class FeignRedisFallback implements FeignRedisService {

    @Override
    public String get(String key) {
        return null;
    }

}
