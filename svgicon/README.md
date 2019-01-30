# @gotoeasy/svgicon

[![NPM version](https://img.shields.io/npm/v/@gotoeasy/svgicon.svg)](https://www.npmjs.com/package/@gotoeasy/svgicon)
[![License](https://img.shields.io/badge/License-Apache%202-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0)
<br>

简化满足svg图标需求<br>

- [x] 使用命令行，从指定git地址导入svg图标到本地磁盘缓存<br>
- [x] 使用命令行，从指定npm包导入svg图标到本地磁盘缓存<br>
- [x] 使用命令行，从指定本地目录导入svg图标到本地磁盘缓存<br>
- [x] 使用命令行，打开浏览器浏览本地磁盘缓存的全部svg图标<br>
- [x] 浏览器编辑本地磁盘缓存的图标（收藏/取消收藏）<br>
- [x] 使用命令行，按收藏内容生成webfonts相关文件<br>
- [ ] 使用命令行，清除svg图标的本地磁盘缓存<br>
- [ ] 导出收藏图标<br>

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

