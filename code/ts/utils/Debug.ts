"use strict";
class debug {
	static log(...args:any[]);
	static log() {
		function _log(arg:any, _name?:string, _depth?:number) {
			// console.log(arg);
			let name = _name || "";
			let depth:number = _depth == undefined ? 0 : _depth;
			let type = typeof arg, type_label = type;
			if (type == 'object') {
				if (arg.constructor.name) type_label = arg.constructor.name;
				else type_label = arg.toString();
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

	//diag code based on tedvm_'s code he shared with me.
	//_method value can be either one method or multiple, if the counts should be added in multiple places.
	static logDiag(_method:string | string[], cpu:number, time:number) {
		function initializeMethod(method:string) {
			Memory['diag'][method] = {
				count: 0,
				cpu: 0,
				ticks: 0,
				time: 0,
				lasttick: 0,
			};
		}
		if (!Memory['diag']) {
			Memory['diag'] = {};
			initializeMethod('Total'); //always keep that up top.
		}
		let methods: string[];
		if (typeof _method == "string") {
			methods = <string[]>[_method];
		} else {
			methods = <string[]>_method;
		}
		for (let m in methods){
			let method = methods[m];
			if (!Memory['diag'][method]) initializeMethod(method);

			Memory['diag'][method].count++;
			Memory['diag'][method].cpu += cpu;
			Memory['diag'][method].time += time;

			if (Memory['diag'][method].lasttick != Game.time) { //new tick
				Memory['diag'][method].ticks++;
				Memory['diag'][method].lasttick = Game.time;
			}
		}
	}

	static printDiag(){
		// function pad(width, string, padding) {
		// 	return (width <= string.length) ? string : pad(width, padding + string, padding)
		// }
		var widthSize = 0;
		for(let method in Memory['diag'] ){
			if(method.length > widthSize) {
				widthSize = method.length;
			}
		}
		
		console.log('----- Diagnostic Log -----');
		let keys = _.sortBy(Object.keys(Memory['diag']));
		for (let k in keys) {
			let method = keys[k];
			var cpu = Memory['diag'][method].cpu,
				ticks = Memory['diag'][method].ticks,
				count = Memory['diag'][method].count,
				time = Memory['diag'][method].time;
			
			// var CpuPerTick = cpu / ticks,
			// 	ActionsPerTick = count / ticks,
			// 	CpuPerAction = cpu / count,
			// 	TimePerTick = cpu / ticks,
			// 	TimePerAction = cpu / count;

			function pad(str: string, amount:number) {
				return str + ' '.repeat(amount - str.length);
			}

			console.log(
				  pad('['+method+']', widthSize+10)
				+ pad('CPU/Tick (' + (cpu / ticks).toFixed(2) + ')', 24)
				+ pad('CPU/Action (' + (cpu / count).toFixed(2) + ')', 24)
				+ pad('Time/Tick (' + (time / ticks).toFixed(2) + ')', 24)
				+ pad('Time/Action (' + (time / count).toFixed(2) + ')', 24)
				+ pad('Actions/Tick (' + (count / ticks).toFixed(2) + ')', 24)
				+ pad('Total Ticks (' + ticks + ')', 24)
			);
		}
	}

	static diag(method) {
		var time = (new Date()).getTime(), 
			cpu = Game.cpu.getUsed();

		return {
			stop: function() {
				debug.logDiag(method, Game.cpu.getUsed() - cpu, (new Date()).getTime() - time);
			}
		}
	}
}

// debug.log(['test', {a:'test'}]);