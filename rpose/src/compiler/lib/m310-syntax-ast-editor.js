const options = require('./m020-options')();
const util = require('./m900-util')
const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + ']';

// ------------ Ast编辑器 ------------
// 连续的文本、表达式，合并为一个表达式
function AstEditor(){

	this.edit = function(ast) {
		joinText(ast);
		return ast;
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

		if ( aryTxtNodes.length > 1 ) {
			joinNodes(aryTxtNodes);
			aryTxtNodes = [];
		}

		// 删除被合并的节点
		let idxs = [];
		nodes.forEach((v,i)=>v.delete && idxs.push(i));
		while(idxs.length){
			nodes.splice(idxs.pop(),1);
		}

		// 继续子节点
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
			i && (nodes[i].delete = true); // 第一个节点以外加删除标志

			if ( nodes[i].type == options.TypeText ) {
				// 字符串时用引号引起来，便于相加
				expr = nodes[i].src.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/'/g, "\\'");
				ary.push(`'${expr}'`);
			}else{
				// 表达式时直接用
				ary.push(util.getExpression(nodes[i].src));
			}
		}
		
		// 连续的文本表达式节点，合并到第一个节点上，其他节点加删除标志
		nodes[0].type = options.TypeUnescapeExpression;
		nodes[0].src = options.ExpressionUnescapeStart + ary.join(' + ') + options.ExpressionUnescapeEnd;
	}

}


module.exports = AstEditor;
