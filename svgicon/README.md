# @gotoeasy/svgicon

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/svgicon.svg)](https://www.npmjs.com/package/@gotoeasy/svgicon)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>

简化满足svg图标需求： 收集 => 筛选 => 图标字体<br>

- [x] 从指定git地址导入svg图标到本地磁盘缓存<br>
- [x] 从指定npm包导入svg图标到本地磁盘缓存<br>
- [x] 从指定目录导入svg图标到本地磁盘缓存<br>
- [x] 开启服务器，通过浏览器检索浏览图标<br>
- [x] 通过浏览器筛选图标（收藏/取消收藏）<br>
- [x] 使用命令行，按收藏内容生成webfonts相关文件<br>

<br>

[![https://github.com/gotoeasy/npm-packages/blob/master/svgicon/www/search.png](https://github.com/gotoeasy/npm-packages/blob/master/svgicon/www/search.png)](https://github.com/gotoeasy/npm-packages/blob/master/svgicon/www/search.png)


<br>
<br>

## Install
```
npm i -g @gotoeasy/svgicon
```


## Sample (cli)
```
// import from giturl
svgicon imp https://github.com/FortAwesome/Font-Awesome.git


// import from npm package
svgicon imp @fortawesome/fontawesome-free


// import from dir
svgicon imp ./svgicons


// open the browser to show the icons, and edit your favorites
svgicon open


// create webfonts by favorites icons
svgicon font
```




## `Links`
* `npm-packages` https://github.com/gotoeasy/npm-packages

