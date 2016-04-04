class debug {
	static log(...args:any[]);
	static log() {
		function _log(arg:any, _name?:string, _depth?:number) {
			// console.log(arg);
			let name = _name || "";
			let depth:number = _depth == undefined ? 0 : _depth;
			let type = typeof arg, type_label = type;
			if (type == 'object') {
				// if (arg.constructor.name) type_label = arg.constructor.name;
				type_label = arg.toString();
			}
			// output += '    '.repeat(depth) + '&lt;' + type_label + '&gt;' + name + ': ';
			output += '    '.repeat(depth) + (name ? '<u>' + name + '</u>:' : '') + type_label + ' = ';
			if (type == 'function') {
				output += '<i>{ ... }</i><br>';
			} else if (type == 'object' || type == 'array') {
				if (depth < 2){
					output += '<br>';
					for (var member in arg) {
						// let type = typeof arg;
						_log(arg[member], member, depth + 1);
						// output += ' '.repeat(depth + 1) + '&lt;' + type + '&gt; ' + arg[l] + '<br>';
					}
				}else{
					output += '<i> ... </i><br>';
				}
			} else {
				output += '<i>' + arg + '</i><br>';
			}
		}

		var output = '';
		for (let l in arguments){
			_log(arguments[l]);
		}
		console.log(output);
	}
}

// debug.log(['test', {a:'test'}]);