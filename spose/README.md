# @gotoeasy/spose

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/spose.svg)](https://www.npmjs.com/package/@gotoeasy/spose)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/gotoeasy/npm-packages/blob/master/LICENSE)
<br>

简易搭建`Greenwich`版微服务

<br>
<br>

## 安装
```
npm i -g @gotoeasy/spose
```


## 命令行例子
Java、Gradle、Redis、Kafka、ES等环境需自行准备
```
// 以下命令创建注册中心，会生成eureka工程目录并编译打包为jar文件
spose eureka
```


## 列表

<details>
<summary><strong>1. 注册中心 `eureka`</strong></summary> 

* spring boot 2.1.6.RELEASE
* spring cloud Greenwich.RELEASE
* 一个起动类
* 配置文件

版本已定，起动类的类名和包名会不同但完全没影响<br>
实际上仅仅是配置不同，而且，配置文件通常又是外置<br>
所以，这个事情干一次就够了<br>

命令行执行 `spose eureka`，随即生成工程目录并编译打包

</details>


<details>
<summary><strong>2. 配置中心 <mark>Config</mark></strong></summary> 

同理 `spose config`

</details>


<details>
<summary><strong>3. 网关 <mark>Gateway</mark></strong></summary> 

`spose gateway`

</details>


<details>
<summary><strong>4. 熔断监控 <mark>Turbine</mark></strong></summary> 

`spose turbine`<br>
可选，按需开启使用

</details>


<details>
<summary><strong>5. 服务监控 <mark>Spring Boot Admin</mark></strong></summary> 

`spose admin`<br>
可选，按需开启使用

</details>


<details>
<summary><strong>6. 链路跟踪 <mark>Zipkin</mark></strong></summary> 

`spose zipkin`<br>
按官方推荐，实际处理是下载最新版zipkin-server到当前目录供直接起动<br>
可选，按需开启使用，被跟踪服务需相应配置

</details>


<details>
<summary><strong>7. 微服务 <mark>Redis</mark></strong></summary> 

`spose redis`<br>
假装一套缓存支持，极简接口，连接Redis

</details>


<details>
<summary><strong>8. 微服务 <mark>Kafka Producer</mark></strong></summary> 

`spose kafka-producer`<br>
假装一套消息队列生产者，极简接口，连接Kafka

</details>


<details>
<summary><strong>9. 微服务 <mark>Kafka Consumer</mark></strong></summary> 

`spose kafka-consumer`<br>
假装一套消息队列消费者，极简接口，连接Kafka

</details>


<details>
<summary><strong>10. 微服务 <mark>Kafka To ElasticSearch</mark></strong></summary> 

`spose kafka2es`<br>
假装一套消息队列消费者，消费队列中的日志，保存到ES中，连接Kafka、ES

</details>


<details>
<summary><strong>11. 微服务 <mark>Hello World</mark></strong></summary> 

`spose helloworld`<br>
联动各微服务

</details>

