// ---------------------------
// DOM挂载
// ---------------------------
function mount(dom, selector, context){
	(context || document).querySelector(selector || 'body').appendChild(dom);
}
