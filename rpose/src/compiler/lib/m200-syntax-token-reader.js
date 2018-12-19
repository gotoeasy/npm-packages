const MODULE = '[' + __filename.substring(__filename.replace(/\\/g, '/').lastIndexOf('/')+1, __filename.length-3) + '] ';

// ------------ Token阅读器 ------------
class TokenReader{
	constructor(tokens) {
		this.ary = tokens;
		this.maxLength = this.ary.length;
		this.pos = 0;
console.debug(MODULE, tokens);
	}

	skip(len){
		if ( len > 0 ) {
			this.pos = this.pos + len;
			if ( this.pos > this.maxLength ) {
				this.pos = this.maxLength;
			}
		}
		return this.pos;
	}

	getPos(){
		return this.pos;
	}

	eof(){
		return this.pos >= this.maxLength;
	}

	readToken(){
		let rs = this.getCurrentToken();
		(this.pos < this.maxLength) && (this.pos += 1);
		return rs;
	}

	getPreToken(){
		return this.pos == 0 ? {} : this.ary[this.pos-1];
	}
	getCurrentToken(){
		return this.pos >= this.maxLength ? {} : this.ary[this.pos];
	}
	getNextToken(len = 1){
		let idx = len < 1 ? 1 : len;
		return (this.pos + idx) >= this.maxLength ? {} : this.ary[this.pos+idx];
	}

}

module.exports = TokenReader;
