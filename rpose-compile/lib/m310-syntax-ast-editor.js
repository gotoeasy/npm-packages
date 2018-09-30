const options = require('./m020-options')();
const AstVisitor = require('./m300-syntax-ast-visitor')
const util = require('./m900-util')

// ------------ Ast编辑器 ------------
// 连续的文本、表达式，合并为一个表达式
function AstEditor(ast){

	let visitor = new AstVisitor(ast);

	this.edit = function() {
		joinText(ast);
		return copyTree(ast);
	}

	function copyTree(nodes){

		if ( !nodes ) {
			return null;
		}

		let ary = [];
		nodes.forEach(node=>{
			let rs = {};
			if ( !node.delete ) {
				for ( let k in node ) {
					rs[k] = node[k];
				}
				ary.push(rs);

				if ( rs.children ) {
					rs.children = copyTree(rs.children);
				}
			}
		});

		return ary;
	}

	function joinText(nodes){

		if ( !nodes || !nodes.length ) {
			return;
		}

		let aryRs = [];
		let aryTxtNodes = [];
		for ( let i=0,node; i<nodes.length; i++ ) {
			node = nodes[i];
			if ( node.type == options.TypeText || node.type == options.TypeEscapeExpression || node.type == options.TypeUnescapeExpression ) {
				aryTxtNodes.push(node);
			}else{
				joinNodes(aryTxtNodes);
				aryTxtNodes = [];
			}
		}

		if ( aryTxtNodes.length ) {
			joinNodes(aryTxtNodes);
			aryTxtNodes = [];
		}

		for ( let i=0,node; i<nodes.length; i++ ) {
			joinText(nodes[i].children);
		}

	}

	function joinNodes(nodes){
		if ( !nodes.length ) {
			return null;
		}
		if ( nodes.length == 1 ) {
			return nodes[0];
		}

		let ary = [], expr;
		for ( let i=0; i<nodes.length; i++ ) {
			nodes[i].delete = true;

			if ( nodes[i].type == options.TypeText ) {
				expr = nodes[i].src.replace(/\n/g, '\\n').replace(/'/g, "\\'");
				ary.push(`'${expr}'`);
			}else{
				ary.push(util.getExpression(nodes[i].src));
			}
		}
		
		// 连续的文本表达式节点，合并到第一个节点上，其他节点加删除标志
		delete nodes[0].delete;
		nodes[0].type = options.TypeUnescapeExpression;
		nodes[0].src = ary.join(' + ');
	}

}

module.exports = AstEditor;
