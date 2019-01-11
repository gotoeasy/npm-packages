// ---------------------------
// 前端路由
// ---------------------------
const Router = ((BUS)=>{

    let curPath;                        // 当前路由地址

    // 安装路由事件
    let fnLocationChange = e => BUS.at('router.locationchange', e);
    window.addEventListener('popstate', fnLocationChange, false);
    
    // 期初显示，window.onload时按指定路由显示
    BUS.on('window.onload', e => {
        route(!location.hash ? '' : location.hash.substring(1), null, '', true);             // 用true指定当找不到时跳转到默认地址，无默认地址时再显示404
    });

    // 路由地址变化时，显示指定路由
    BUS.on('router.locationchange', e => {
        route(!location.hash ? '' : location.hash.substring(1), e.state);
    });


    // 路由注册
    let routes = [];                                                            // 本页除notfound以外的全部路由，可能异步注册或按需注册
    let notfoundRoutes = [];                                                    // 404页
    let defaultRoutes = [];                                                     // 默认页
    let register = route => {
        if ( route.notfound ) {
            notfoundRoutes.push(route);
            return;
        }

        route.path == null && (route.path = '');                                // 路径没填时默认为空串
        routes.push(route);
        route.default && defaultRoutes.push(route);
    };

    // 路由匹配器
    let match = (pattern, path) => {
        return pattern == path; // TODO 通配符匹配
    };

    // 单纯路由跳转，历史记录无关，通常当地址变化时调用
    let currentRoutes = [];
    let route = (path, state, title, useDefault) => {
        if ( !routes.length ) {
            notfoundRoutes.forEach(rt => rt.component.route());                 // 如果有404页则显示，漏配置路由，或配置了路由但不能及时注册，总之很奇怪
            return;                                                             // 多数是没有路由的页面，也可能是会异步添加路由，不能贸然关闭事件
        }

        let nextRoutes = [];
        routes.forEach(rt => match(rt.path, path) && nextRoutes.push(rt));      // 找出匹配的待显示路由

        if ( !nextRoutes.length && useDefault && defaultRoutes.length ) {
            nextRoutes = defaultRoutes;                                         // 初期显示输入错误路由时，可指定默认路由，比如首页，避免404
            history.replaceState('', '', '#' + defaultRoutes[0].path);          // 改下地址，免得难看
        }

        if ( nextRoutes.length ) {
            // 正常找到
            notfoundRoutes.forEach(rt => rt.component.setState({active:0}));    // 隐藏404页
            currentRoutes.forEach(rt => rt.component.setState({active:0}));     // 隐藏当前页
            nextRoutes.forEach(rt => rt.component.route(state));                // 显示指定页
            currentRoutes = nextRoutes;                                         // 保存活动路由
            curPath = path;                                                     // 保存活动路径
        }else{
            // 无效的地址
            currentRoutes.forEach(rt => rt.component.setState({active:0}));     // 隐藏当前页
            notfoundRoutes.forEach(rt => rt.component.route());                 // 显示404页
        }
    };

    // 显示指定路由，指定路由地址和活动路由地址不相同时添加历史记录，通常由程序调用
    let push = (path, state, title) => {
        if ( /^http[s]?:/i.test(path) ) return link(path, state);               // 以http[s]:开头时直接跳转页面

       // route(path, state, title);                                              // 路由跳转
        curPath != path && history.pushState(state, title, '#' + path);               // 路由地址不一致时，添加历史记录
    };

    // 显示指定路由，并替换当前历史记录，通常由程序调用
    let replace = (path, state, title) => {
        if ( /^http[s]?:/i.test(path) ) return link(path, state);               // 以http[s]:开头时直接跳转页面

        //route(path, state, title);                                              // 路由跳转
        history.replaceState(state, title, '#' + path);                               // 替换当前历史记录
    };

    // 页面跳转
    let url = (url, params) => {
        location.href = url;                                                    // 页面跳转
    };

    return {register, route, push, replace, url};
})(BUS);
