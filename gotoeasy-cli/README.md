# @gotoeasy/gotoeasy-cli
简化操作
<br>
* 把package.js简化为package.btf，方便阅读编辑
* 简化发布过程，自动累加最小版本号
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/gotoeasy-cli.svg)](https://www.npmjs.com/package/@gotoeasy/gotoeasy-cli)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>

## Install
```
npm i -g @gotoeasy/gotoeasy-cli
```


## 初次创建package.btf
```js
// 在当前目录创建package.btf文件例子（存在也会被覆盖）
gotoeasy initpackage

// 也可使用缩写命令ge替代gotoeasy
ge initpackage
```


## package.btf文件内容样本
```js
// -------------------------------------------------
// 这是个替代package.json用的配置文件
// 结合gotoeasy-cli命令行轻松化
// 
// 主要是因为json配置文件看得不爽
// 更是因为package.json竟然不能写注释
// 最后是发布前修改版本号感觉太琐碎了
// 
// 除name和version是必须外，其他都是可选
// 按这个例子文件根据需要删减选填
// 然后使用命令gotoeasy publish简写ge p自动转换发布
// 发布仅自动累加更新最小版本
// -------------------------------------------------
[name] // 项目名 （必填）
name

[version] // 版本号 （必填）
0.0.0

[main] // 入口文件
index.js

[dependencies] // 依赖库
xxxxx : *
yyyyy : *
zzzzz : *

[devDependencies] // 开发依赖库
xxxxx : *
yyyyy : *

[bin] // cli命令
gotoeasy = bin/gotoeasy
ge = bin/gotoeasy

[scripts] // 脚本命令
test = echo "Error: no test specified" && exit 1

[description] // 描述
gotoeasy-cli

[keywords] // 检索关键字，多个关键字用半角逗号分隔
keyword1, keyword2, keyword3

[engines] // 指定环境要求版本
node : >= 10.0.0
npm : >= 6.1.0

[repository] // 仓库
type= git
url = git+https://github.com/xxxxx/yyyyyyy.git

[homepage] // 主页，github项目会被自动识别设定
https://github.com/gotoeasy/........../README.md

[bugs] // BUG提交地址，github项目会自动识别设定
url = https://github.com/xxxxx/yyyyyyy/issues

[author] // 作者信息
name = your name
email= your email

[license] // 协议
Apache-2.0

```

## package.btf修改好后，使用命令发布npm包
```js
// 累加package.btf文件中的小版本号后转换为package.js，使用npm publish命令发布，更新package.btf小版本号
gotoeasy publish

// 也可使用缩写命令
ge p
```


## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

