// ------------------------------------------------------------------------------
// rpose用页面预渲染器
// 
// 传入源文件信息选项
//   - srcPath，如 c:/test/project/src
//   - file，绝对路径，如 c:/test/project/src/pages/demo-page.rpose
//   - name，单纯文件名，如 demo-page
//   - nocss，没有外部css文件时为true，默认false
//   - type，源文件中声明的预渲染类型，字符串如空白串''、loader、loader-section等
//   - inlinesymbols，内联svg-symbol代码
//
// 【注】
// 触发window.onload事件时
// rpose会按类名查找“.pre-render”节点，然后添加类“loaded”，便于自定义控制隐藏效果
// 延后数秒后会删除“.pre-render”节点
// 所以需注意“.pre-render”和“.loaded”的使用便于rpose辅助处理，否则需自行手动控制
//
// ------------------------------------------------------------------------------
module.exports = function defaultPreRender(opts){
    
    let preRender = '';
    if ( /^loader$/i.test(opts.type) ) {
        preRender = getLoaderHtml(false);   // 单纯旋转图
    }else if ( /^loader\-section$/i.test(opts.type) ) {
        preRender = getLoaderHtml(true);    // 旋转图+芝麻开门
    }

    let refs = [`<script src="./${opts.name}.js" defer></script>`, `<link href="./${opts.name}.css" rel="stylesheet">`];
    opts.nocss && refs.pop();

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Cache-Control" content="max-age=18000"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
${refs.join('\n')}
</head>
<body>${preRender}${opts.inlinesymbols || ''}</body>
</html>`;

};


function getLoaderHtml(useSection){
    
    let section = useSection ? '<div class="loader-section section-left"></div><div class="loader-section section-right"></div>' : '';

    return `<div class="pre-render loader-wrapper">
        <div class="loader"></div>
        ${section}
        <style type="text/css">
            .loader-wrapper {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 1000;
            }

            .loader {
              display: block;
              position: relative;
              left: 50%;
              top: 50%;
              width: 150px;
              height: 150px;
              margin: -75px 0 0 -75px;
              border-radius: 50%;
              border: 3px solid transparent;
              border-top-color: #3498db;
              -webkit-animation: spin 2s linear infinite;
              animation: spin 2s linear infinite;
              z-index: 1001;
            }

            .loader:before {
              content: "";
              position: absolute;
              top: 5px;
              left: 5px;
              right: 5px;
              bottom: 5px;
              border-radius: 50%;
              border: 3px solid transparent;
              border-top-color: #e74c3c;
              -webkit-animation: spin 3s linear infinite;
              animation: spin 3s linear infinite;
            }

            .loader:after {
              content: "";
              position: absolute;
              top: 15px;
              left: 15px;
              right: 15px;
              bottom: 15px;
              border-radius: 50%;
              border: 3px solid transparent;
              border-top-color: #f9c922;
              -webkit-animation: spin 1.5s linear infinite;
              animation: spin 1.5s linear infinite;
            }

            @-webkit-keyframes spin {
              0% {
                -webkit-transform: rotate(0deg);
                transform: rotate(0deg);
              }

              to {
                -webkit-transform: rotate(360deg);
                transform: rotate(360deg);
              }
            }

            @keyframes spin {
              0% {
                -webkit-transform: rotate(0deg);
                transform: rotate(0deg);
              }

              to {
                -webkit-transform: rotate(360deg);
                transform: rotate(360deg);
              }
            }

            .loader-section {
              position: fixed;
              top: 0;
              width: 51%;
              height: 100%;
              background: #222222;
              z-index: 1000;
              -webkit-transform: translateX(0);
              transform: translateX(0);
            }

            .section-left {
              left: 0;
            }

            .section-right {
              right: 0;
            }

            .loaded.loader-wrapper .loader-section.section-left {
              -webkit-transform: translateX(-100%);
              transform: translateX(-100%);
            }

            .loaded.loader-wrapper .loader-section.section-right,
            .loaded.loader-wrapper .loader-section.section-left {
              -webkit-transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
              transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
            }

            .loaded.loader-wrapper .loader-section.section-right {
              -webkit-transform: translateX(100%);
              transform: translateX(100%);
            }

            .loaded .loader {
              opacity: 0;
              -webkit-transition: all 0.3s ease-out;
              transition: all 0.3s ease-out;
            }

            .loaded.loader-wrapper {
              visibility: hidden;
              -webkit-transform: translateY(-100%);
              transform: translateY(-100%);
              -webkit-transition: all 0.3s 1s ease-out;
              transition: all 0.3s 1s ease-out;
            }
        </style>
    </div>
`;

}