# @gotoeasy/spose

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/spose.svg)](https://www.npmjs.com/package/@gotoeasy/spose)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/gotoeasy/npm-packages/blob/master/LICENSE)
<br>

Greenwich

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


## 微服务

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
<summary><strong>2. 配置中心 `config`</strong></summary> 

同理 `spose config`

</details>

<details>
<summary><strong>3. 网关 `gateway`</strong></summary> 

同理 `spose gateway`

</details>

