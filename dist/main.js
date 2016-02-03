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
//              Guard.work(creep);
//             }
//             else if(creep.memory.role == 'harvester') {
//              Harvester.work(creep);
//          }
//          else if(creep.memory.role == 'builder') {
//              Builder.work(creep);
//          }
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
            worker: (1 + this.length('worker'))/2.0,
            guard: (1 + this.length('guard'))*2.0
        };
    }

    this.should_build = function(){
        var weights = this.weighted_lengths();
        var build_value, build_role;
        for (var i in weights){
            var value = weights[i];
            if (build_value == undefined || value < build_value){
                build_value = value;
                build_role = i;
            }
        }
        var build_value_cap = 4;
        if (build_value <= build_value_cap)
            return build_role;
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

Creep.prototype.resetBodyCounts = function(){
    this.memory.bodyCounts = {
        move: 0,
        work: 0,
        carry: 0,
        attack: 0,
        ranged_attack: 0,
        heal: 0,
        tough: 0,
    };
    for (var b in this.body){
        // console.log(this.body[b].hits, this.body[b].type);
        if (this.body[b].hits > 0)
            this.memory.bodyCounts[this.body[b].type]++;
    }
}

Creep.prototype.canWork = function(){
    if (!this.memory.bodyCounts) this.resetBodyCounts();
    return this.memory.bodyCounts.work || 0;
}

Creep.prototype.canFight = function(){
    if (!this.memory.bodyCounts) this.resetBodyCounts();
    return this.memory.bodyCounts.attack || 0;
}

Creep.prototype.harvesting = function(target){
    if (this.carry.energy == this.carryCapacity){
        this.say('Harvested');
        this.retarget();
    }else{
        var action = this.harvest(target);
        if(action == ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }else if (action == ERR_BUSY){//The creep is still being spawned.
            //just wait
        }else if (action != 0){
            console.log('harvesting error:', action);
            this.retarget();
        }
    }
}

Creep.prototype.storing = function(target){
    if (this.carry.energy == 0){
        this.say('Stored');
        this.retarget();
    }else{
        var transferring = Math.min(target.storeCapacity - target.store.energy, this.carry.energy);
        if (transferring > 0){
            var action = this.transfer(target, RESOURCE_ENERGY, transferring);
            if(action == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }else if (action != 0){
                console.log('harvester transfer error:', action);
                this.retarget();
            }
        }else{
            this.retarget();
        }
    }
}

Creep.prototype.transferring = function(target){
    if (this.carry.energy == 0){
        this.say('Transfered');
        this.retarget();
    }else{
        var transferring = Math.min(target.energyCapacity - target.energy, this.carry.energy);
        if (transferring > 0){
            var action = this.transfer(target, RESOURCE_ENERGY, transferring);
            if(action == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }else if (action != 0){
                console.log('harvester transfer error:', action);
                this.retarget();
            }
        }else{
            this.retarget();
        }
    }
}

Creep.prototype.energizing = function(target){
    if (this.carry.energy == this.carryCapacity || target.energy == 0){//end condition:
        this.say('Energized');
        this.retarget();
    }else{
        //Otherwise the builders will bleed the system dry and run out of harvesters...
        if (target.energy > target.energyCapacity*.75){ //mostly full, then go for it.
            var action = target.transferEnergy(this);
            // if (target.energy <= 5){
            //     this.retarget(this);
            // }
            if(action == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }else if (action != 0){
                console.log('restocking error:', action);
                this.retarget();
            }
        }
    }
}

Creep.prototype.building = function(target){
    if (this.carry.energy == 0){//end condition:
        this.say('Built');
        this.retarget();
    }else{
        var action = this.build(target);
        if(action == ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }else if (action == ERR_BUSY){//The this is still being spawned.
            //just wait
        // }else if (action == ERR_INVALID_TARGET){
        }else if (action != 0){
            console.log('build error:', action);
            this.retarget();
        }
    }
}

Creep.prototype.upgrading = function(target){
    if (this.carry.energy == 0){//end condition:
        this.say('Built');
        this.retarget();
    }else{
        var action = this.upgradeController(target);
        if(action == ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }else if (action == ERR_BUSY){//The this is still being spawned.
            //just wait
        // }else if (action == ERR_INVALID_TARGET){
        }else if (action != 0){
            console.log('upgrading error:', action);
            this.retarget();
        }
    }
}

Creep.prototype.picking = function(target){
    var action = this.pickup(target);
    if(action == ERR_NOT_IN_RANGE) {
        this.moveTo(target);
    }else if (action == ERR_BUSY){//The this is still being spawned.
        //just wait
    }else if (action == ERR_INVALID_TARGET){
        this.retarget();
    }else if (action != 0){
        console.log('upgrading error:', action);
        this.retarget();
    }
}

Creep.prototype.moving = function(target){
    this.moveTo(target);
    this.retarget();
}

Creep.prototype.retarget = function(){
    this.retarget_count++;
    if (this.retarget_count > 3){
        console.log('CRITICAL: builder retargeting loop');
        return;
    }
    // this.resetBodyCounts();
    // console.log(Object.keys(this.memory.bodyCounts));
    // console.log(this.memory.bodyCounts.work);
    if (this.canWork()){
        // console.log('worker!');
        if (this.carry.energy > 0){
            var target = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: function(obj){
                    return (
                        (   
                            obj.structureType == STRUCTURE_SPAWN ||
                            obj.structureType == STRUCTURE_EXTENSION ||
                            obj.structureType == STRUCTURE_TOWER
                        )
                        && obj.energy < obj.energyCapacity
                    );
                }
            });
            if (target){
                this.memory.target_id = target.id;
                this.memory.action_name = 'transferring';
            }else{
                var target = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: function(obj){
                        return (
                            obj.structureType == STRUCTURE_STORAGE && obj.store.energy < obj.storeCapacity
                        );
                    }
                });
                if (target){
                    this.memory.target_id = target.id;
                    this.memory.action_name = 'storing';
                }else{
                    target = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                        // filter: { owner: { username: 'Invader' } }
                    });
                    if (target){
                        this.memory.target_id = target.id;
                        this.memory.action_name = 'building';
                    }else{
                        if (this.room.controller){
                            this.memory.target_id = this.room.controller.id;
                            this.memory.action_name = 'upgrading';
                        }
                    }
                }
            }
        }else{
            var target = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            if (target){
                this.memory.target_id = target.id;
                this.memory.action_name = 'picking';
            }else{
                var target = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: function(obj){
                        return (
                            obj.structureType == STRUCTURE_STORAGE
                            && obj.store.energy > obj.storeCapacity/2
                        );
                    }
                });
                if (target){
                    this.memory.target_id = target.id;
                    this.memory.action_name = 'energizing';
                }else{
                    var target = this.pos.findClosestByPath(FIND_SOURCES, {
                        maxOps: 500,
                        // filter: { owner: { username: 'Invader' } }
                        filter: function(obj){
                            return obj.energy > 0 //Sources can run out as well
                        }
                    });
                    // console.log('target', target);
                    if (target){
                        this.memory.target_id = target.id;
                        this.memory.action_name = 'harvesting';
                    }else{
                        if (Game.flags.resting){
                            this.memory.target_id = Game.flags.resting.id;
                            this.memory.action_name = 'moving';
                        }
                        console.log('unable to find a new harvest target');
                    }
                }
            }
        }
    }else if (this.canFight()){
        // console.log('fighter');
    }
    // this.work();
}

Creep.prototype.work = function(){
    this.retarget_count = 0;
    var target = Game.getObjectById(this.memory.target_id),
        action_name = this.memory.action_name,
        action_function = this[action_name];
    
    // this.retarget();
    // this.say(action_name);
    // console.log(action_name, target);
    if (target && action_function){
        // action_function(target);
        action_function.apply(this, [target]);
    }else{
        // console.log('unknown harvester action:', action_name);
        this.retarget();
    }
}

Room.prototype.storeSources = function(){
    var sources = this.find(FIND_SOURCES);
    this.memory.sources = {};
    for (var s in sources){
        var source = sources[s];
        this.memory.sources[source.id] = {};
        // console.log(source.id);
    }
}

Room.prototype.sources = function(){
    if (!this.memory.sources) this.storeSources();
    // var sources = [];
    // for (var s in this.memory.sources){
    //     var source_id = this.memory.sources[s];
    //     sources.push(Game.getObjectById(source_id));
    // }
    // return sources;
    return this.memory.sources;
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

    
    //Clear out the old memory:
    for (var c in Memory.creeps){
        // Game.getObjectById()
        if (!Game.creeps[c]){
            console.log('Deleting creep ' + c + " from memory.");
            delete Memory.creeps[c];
        }
    }

    for (var r in Game.rooms){
        // console.log(Game.rooms[r]);
        var room = Game.rooms[r];
        // console.log(room.sources());
        // var sources = room.sources();
        // for (var s in sources){
        //     var source = sources[s];
        //     // console.log(source.memory);
        // }
        // console.log(r);

        var towers = room.find(FIND_MY_STRUCTURES, {
            filter: function(obj){
                return (
                    obj.structureType == STRUCTURE_TOWER
                );
            }
        });

        var damaged = room.find(FIND_STRUCTURES, {
            filter: function(obj){
                // if (obj.structureType == STRUCTURE_ROAD){
                //     console.log(obj.hits, obj.hitsMax, obj.hitsMax*3/4);
                // }
                return (
                    (obj.structureType == STRUCTURE_ROAD)// ||  obj.structureType == STRUCTURE_WALL)
                    && obj.hits < obj.hitsMax
                );
            }
        });

        // var damaged = room.find(FIND_STRUCTURES, {
        //     filter: function(obj){
        //         // if (obj.structureType == STRUCTURE_ROAD){
        //         //     console.log(obj.hits, obj.hitsMax, obj.hitsMax*3/4);
        //         // }
        //         return (
        //             (obj.structureType == STRUCTURE_ROAD)// ||  obj.structureType == STRUCTURE_WALL)
        //             && obj.hits < obj.hitsMax
        //         );
        //     }
        // });
        // // console.log('damaged', damaged);
        // var repair_target = damaged.pop();
        // for (var t in towers){
        //     var tower = towers[t];
        //     // console.log(tower);
        //     var action = tower.repair(repair_target);
        //     console.log(repair_target, action);
        // }
    }
    
    for(var c in Game.creeps) {
       // console.log(c);
        var creep = Game.creeps[c];
        Cache.add(creep);
        // cache_creep(creep);

        // var roadToRepair = creep.pos.findClosest(FIND_STRUCTURES, {
        //     filter: function(object){
        //         return object.structureType === STRUCTURE_ROAD && (object.hits > object.hitsMax / 3);
        //     }
        // });
        // console.log(roadToRepair);

        

        if(creep.memory.role == 'guard') {
            Guard.work(creep);
        }else{
            // creep.memory.role == "worker";
            creep.work();
        }
//      else{
//          console.log('creep created without a role...');
//          creep.memory.role = "harvester";
//      }
    }
    for (var s in Game.spawns){
        var spawn = Game.spawns[s];
        var totalEnergy = spawn.energy;
        var totalCapacity = spawn.energyCapacity;

        var extensions = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: function(obj){
                return obj.structureType == STRUCTURE_EXTENSION;
            }
        });
        for (var e in extensions){
            var extension = extensions[e];
            totalEnergy += extension.energy;
            totalCapacity += extension.energyCapacity;
        }

        if (totalEnergy == totalCapacity){
            var build_role = Cache.should_build();
            // console.log('attempting to build: ' + build_role);
            if (build_role){
                // function fillBody(body, bodyParts, bodyCost){
                //     while(totalEnergy - (cost + bodyCost) > 0){
                //         for (var b in bodyParts){
                //             body.unshift(bodyParts[b]);
                //         }
                //         cost += bodycost;
                //     }
                //     return body;
                // }
                var memory = {
                        role: build_role
                    },
                    body = [MOVE],
                    cost = 50;

                if (build_role == 'worker'){
                    var bodycost = 100 + 50 + 50, count = 0;
                    // body = fillBody(body, [WORK, CARRY, MOVE], 100 + 50 + 50);
                    while(totalEnergy - (cost + bodycost) > 0 && count < 3){ //limit the amount of move parts
                        body.unshift(MOVE); //50
                        body.unshift(CARRY); //50
                        body.unshift(WORK); //100
                        cost += bodycost;
                        count++;
                    }
                    bodycost = 100 + 50;
                    while(totalEnergy - (cost + bodycost) > 0){
                        body.unshift(CARRY); //50
                        body.unshift(WORK); //100
                        cost += bodycost;
                    }
                    bodycost = 50;
                    while(totalEnergy - (cost + bodycost) > 0){
                        body.unshift(CARRY); //50
                        cost += bodycost;
                    }
                }else if (build_role == 'guard'){
                    var bodycost = 80 + 10 + 10 + 50, count = 0;
                    while(totalEnergy - (cost + bodycost) > 0 && count < 3){ //limit the amount of move parts
                        body.unshift(MOVE); //50
                        body.unshift(ATTACK); //80
                        body.unshift(TOUGH); //10
                        body.unshift(TOUGH); //10
                        cost += bodycost;
                        count++;
                    }
                    bodycost = 80 + 10 + 10;
                    while(totalEnergy - (cost + bodycost) > 0){
                        body.unshift(ATTACK); //80
                        body.unshift(TOUGH); //10
                        body.unshift(TOUGH); //10
                        cost += bodycost;
                    }
                    bodycost = 10;
                    while(totalEnergy - (cost + bodycost) > 0){
                        body.unshift(TOUGH); //10
                        cost += bodycost;
                    }
                }
                response = spawn.createCreep(body, null, memory);
                if (!(response < 0)){
                    console.log("Making a new " + build_role + " named "  + response);
                }else{
                    console.log(response);
                }
            }else{
                // console.log('no build role');
            }
        }

        // // Spawn.work(spawn);
        
        // // var build_role = Cache.min_creep_role();
        // // console.log("trying to build a " + build_role);
        
        // var weights = Cache.weighted_lengths();
        // var build_value, build_role;
        // for (var i in weights){
        //     var value = weights[i];
        //     if (build_value == undefined || value < build_value){
        //         build_value = value;
        //         build_role = i;
        //     }
        // }
        // // return min_index;
        
        // // console.log(build_value);
        // var build_value_cap = 3; //keeps the overall population down
        
        // var name;
        // if (spawn.energy > 50 && build_value < build_value_cap){ //keep a minimum of 50 energy floating for builders
        //     console.log(should_build)
        //     // if (build_role == 'harvester'){
        //     //     name = Harvester.make(spawn);
        //     // }
        //     // else if (build_role == 'builder'){
        //     //     name = Builder.make(spawn);
        //     // }
        //     // else if (build_role == 'guard'){
        //     //     name = Guard.make(spawn);
        //     // }
        //     if (!(name < 0)){
        //         console.log("Making a new " + build_role);
        //     }
        // }
    }
}