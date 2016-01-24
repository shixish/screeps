var _ = require('lodash'),
    Harvester = require('harvester'),
    Guard = require('guard'),
    Builder = require('builder'),
    Spawn = require('spawn');
    
// var max_unit_measure = 10;

// Game.prototype.creep.byRole = function(){
//     if (!harvesters){
//         harvesters = {};
//         for(var c in Game.creeps) {
//             var creep = Game.creeps[c];
//                 if(creep.memory.role == 'guard') {
//             	Guard.work(creep);
//             }
//             else if(creep.memory.role == 'harvester') {
//     			Harvester.work(creep);
//     		}
//     		else if(creep.memory.role == 'builder') {
//     		    Builder.work(creep);
//     		}
//         }
//     }
//     return harvesters;
// }

// var harvesters = room.find(Game.creeps, {
//     filter: {memory: 'harvester'}
// });
var CreepCache = function(){
    var creep_cache = {};
    var creep_cache_length = {};
    
    this.add = function(creep){
        var role = creep.memory.role,
            name = creep.name;
        
        // console.log('caching:', creep, role);
        if (role && name){
            if (!creep_cache.hasOwnProperty(role)){
                creep_cache[role] = {};
                creep_cache_length[role] = 0;
            }
            
            creep_cache[role][name] = creep;
            creep_cache_length[role] += 1;
        }else{
            console.log("unable to cache:", creep)
        }
    }
    
    this.get = function(role){
        return creep_cache[role];
    }
    
    this.length = function(role){
        return creep_cache_length[role] || 0;
    }
    
    this.weighted_lengths = function(){
        return {
            harvester: (1 + this.length('harvester'))/4.0, 
            builder: (1 + this.length('builder'))/2,
            guard: (1 + this.length('guard'))*2.0
        };
    }
    
    // this.min_creep_role = function(){
    //     var weights = this.weighted_lengths();
    //     var min_value, min_index;
    //     for (var i in weights){
    //         var value = weights[i];
    //         if (min_value == undefined || value < min_value){
    //             min_value = value;
    //             min_index = i;
    //         }
    //     }
    //     return min_index;
    // }
}

module.exports.loop = function () {
    // console.log('tick');
    
    var Cache = new CreepCache();
    
    // var creep_cache = {};
    // var creep_cache_length = {};
    // var cache_creep = function(creep){
    //     var role = creep.memory.role,
    //         name = creep.name;
        
    //     // console.log('caching:', creep, role);
    //     if (role && name){
    //         if (!creep_cache.hasOwnProperty(role)){
    //             creep_cache[role] = {};
    //             creep_cache_length[role] = 0;
    //         }
            
    //         creep_cache[role][name] = creep;
    //         creep_cache_length[role] += 1;
    //     }else{
    //         console.log("unable to cache:", creep)
    //     }
    // }
    
    
	for(var c in Game.creeps) {
	   // console.log(c);
		var creep = Game.creeps[c];
		Cache.add(creep);
        // cache_creep(creep);

		if(creep.memory.role == 'guard') {
        	Guard.work(creep);
        }
        else if(creep.memory.role == 'harvester') {
			Harvester.work(creep);
		}
		else if(creep.memory.role == 'builder') {
		    Builder.work(creep);
		}
// 		else{
// 		    console.log('creep created without a role...');
// 		    creep.memory.role = "harvester";
// 		}
	}
	for (var s in Game.spawns){
	    var spawn = Game.spawns[s];
        // Spawn.work(spawn);
        
        // var build_role = Cache.min_creep_role();
        // console.log("trying to build a " + build_role);
        
        var weights = Cache.weighted_lengths();
        var build_value, build_role;
        for (var i in weights){
            var value = weights[i];
            if (build_value == undefined || value < build_value){
                build_value = value;
                build_role = i;
            }
        }
        // return min_index;
        
        // console.log(build_value);
        var build_value_cap = 3; //keeps the overall population down
        
        var name;
        if (spawn.energy > 50 && build_value < build_value_cap){ //keep a minimum of 50 energy floating for builders
            if (build_role == 'harvester'){
                name = Harvester.make(spawn);
            }
            else if (build_role == 'builder'){
                name = Builder.make(spawn);
            }
            else if (build_role == 'guard'){
                name = Guard.make(spawn);
            }
            if (!(name < 0)){
                console.log("Making a new " + build_role);
            }
        }
	}
}