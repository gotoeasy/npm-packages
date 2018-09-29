
// ------------ Ast遍历器 ------------
// TODO
class AstVisitor{
	constructor(ast, deepFirst) {
		this.ast = ast;
		this.deepFirst = deepFirst;
		this.root = {
			isRoot: x=>true,
			_before: x=>null,
			_after: x=>null,
			_child: x=>ast.length?ast[0]:null,
			_parent: x=>null,
		};
		this.current = this.root;

		this.defineTreeProperty(this.root, ast);
	}


	defineTreeProperty(parent, nodes){

		for ( let i=0, node; i<nodes.length; i++ ) {
			node = nodes[i];

			// before 前一个兄弟节点
			Object.defineProperty(node, '_before', {
				enumerable: false,
				configurable: false,
				get: (n=1) => (i-n>=0) ? nodes[i-n] : null
			});

			// after 后一个兄弟节点
			Object.defineProperty(node, '_after', {
				enumerable: false,
				configurable: false,
				get: (n=1) => (i+n<nodes.length) ? nodes[i+n] : null
			});

			// child 第一个子节点
			Object.defineProperty(node, '_child', {
				enumerable: false,
				configurable: false,
				get: () => node.children && node.children.length ? node.children[0] : null
			});

			// parent 父节点
			Object.defineProperty(node, '_parent', {
				enumerable: false,
				configurable: false,
				get: () => parent
			});


			// 子节点递归定义
			if ( node.children ) {
				this.defineTreeProperty(node, node.children);
			}
		}

	}

}

module.exports = AstVisitor;
