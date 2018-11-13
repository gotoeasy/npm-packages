# @gotoeasy/count-line-cli
代码行数统计
<br>
* 统计指定目录代码行数
* 统计指定git仓库代码行数
* 提供配置功能
<br>
<br>

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/count-line-cli.svg)](https://www.npmjs.com/package/@gotoeasy/count-line-cli)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>
<br>

## Install
```
npm i -g @gotoeasy/count-line-cli
```


## API

* `count-line dir --csv 目录`
```
// 统计指定目录的代码行数，统计结果以csv形式输出到当前目录
count-line dir --csv d:/target-path/test

// 也可以使用命令缩写cl
cl dir d:/target-path/test

```

* `count-line giturl --csv git仓库地址`
```
// 下载指定git仓库代码并统计，统计结果以csv形式输出到当前目录
count-line giturl --csv https://github.com/gotoeasy/npm-packages.git
```

* `count-line init`
```
// 创建代码行数统计的配置文件，进行个性化设定
count-line init
```
<br>

## NOTE
* 根目录有`.gitignore`文件时将被利用并忽略相关文件，但解析匹配可能有搞错的情况
* 行数统计没有使用语言级别的严格的词法解析，不能确保完全正确，特别是JSP等多语言混用的时候


## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

