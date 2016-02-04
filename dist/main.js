var _ = require('lodash'),
    // Harvester = require('harvester'),
    Guard = require('guard'),
    // Builder = require('builder'),
    Spawn = require('spawn');

var USERNAME = 'ShiXish',
    MIN_TICKS_TO_LIVE = 75,
    MAX_UNITS_METRIC = 3;
    
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
    if (this.carry.energy == this.carryCapacity || target.energy == 0){
        this.say('Harvested');
        this.retarget();
    }else{
        var action = this.harvest(target);
        if(action == ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }else if (action == ERR_BUSY){//The creep is still being spawned.
            //just wait
        }else if (action == ERR_NOT_ENOUGH_RESOURCES){//The creep is still being spawned.
            // console.log('Depleted an energy source.');
            this.retarget();
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
                console.log('storing error:', action);
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
                console.log('transferring error:', action);
                this.retarget();
            }
        }else{
            this.retarget();
        }
    }
}

Creep.prototype.energizing = function(target){//only works on storage tanks
    if (this.carry.energy == this.carryCapacity || target.energy == 0){//end condition:
        this.say('Energized');
        this.retarget();
    }else{
        if (target.store.energy > 0){
            var action = target.transferEnergy(this);
            // if (target.energy <= 5){
            //     this.retarget(this);
            // }
            if(action == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }else if (action != 0){
                console.log('energizing error:', action);
                this.retarget();
            }
        }else{
            this.retarget();
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
        }else if (action == ERR_BUSY){//The creep is still being spawned.
            //just wait
        // }else if (action == ERR_INVALID_TARGET){
        }else if (action != 0){
            console.log('building error:', action);
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
        }else if (action == ERR_BUSY){//The creep is still being spawned.
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
    }else if (action == ERR_BUSY){//The creep is still being spawned.
        //just wait
    }else if (action == ERR_INVALID_TARGET){
        this.retarget();
    }else if (action != 0){
        console.log('picking error:', action);
        this.retarget();
    }
}

Creep.prototype.renewing = function(target){
    // if (target.)
    // this.room.memory.highest_creep_cost
    // console.log(this.room.memory.highest_creep_cost);
    // console.log('Renewing creep');
    if (
        this.memory.cost && 
        this.room.memory.highest_creep_cost && 
        this.memory.cost > this.room.memory.highest_creep_cost - 50
    ){
        if (this.ticksToLive < 1000){
            var action = target.renewCreep(this);
            if(action == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }else if (action == ERR_BUSY){//The spawn is busy
                //just wait
            }else if (action != 0){
                console.log('renewing error:', action);
                this.retarget();
            }
        }else{
            this.retarget();
        }
    }else{
        this.moveTo(target);
    }
}

Creep.prototype.moving = function(target){
    this.moveTo(target);
    this.retarget();
}

Creep.prototype.tryTargeting = function(type){
    var target;
    switch (type){
        //Energy spending:
        case 'transferring':
            target = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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
            break;
        case 'storing':
            target = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: function(obj){
                    return (
                        obj.structureType == STRUCTURE_STORAGE && obj.store.energy < obj.storeCapacity
                    );
                }
            });
            break;
        case 'building':
            target = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                // filter: { owner: { username: 'Invader' } }
            });
            break;
        case 'upgrading':
            if (this.room.controller){
                target = this.room.controller;
            }
            break;

        //Energy gaining:
        case 'picking':
            target = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            break;
        case 'harvesting':
            target = this.pos.findClosestByPath(FIND_SOURCES, {
                maxOps: 500,
                // filter: { owner: { username: 'Invader' } }
                filter: function(obj){
                    return obj.energy > 0; //Sources can run out as well
                }
            });
            break;
        case 'energizing':
            target = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: function(obj){
                    return (
                        obj.structureType == STRUCTURE_STORAGE
                        && obj.store.energy > 0
                    );
                }
            });
            break;
        case 'renewing':
            // console.log('max creep cost:' + this.room.memory.highest_creep_cost);
            // if (this.ticksToLive < MIN_TICKS_TO_LIVE){
            //     console.log(this.memory.cost, this.room.memory.highest_creep_cost-50);
            // }
            if (
                this.ticksToLive < MIN_TICKS_TO_LIVE &&
                this.memory.cost && 
                this.room.memory.highest_creep_cost && 
                this.memory.cost >= this.room.memory.highest_creep_cost - 50
            ){
                target = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: function(obj){
                        return (
                            obj.structureType == STRUCTURE_SPAWN
                        );
                    }
                });
            }
            break;
        case 'moving':
            if (Game.flags.resting){
                target = Game.flags.resting;
            }
            break;
    }
    if (target){
        this.memory.target_id = target.id;
        this.memory.action_name = type;
    }
    return !!target;
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

    // spawn.memory.highest_creep_cost
    if (!this.tryTargeting('renewing')){
        if (this.canWork()){
            // console.log('worker!');
            if (this.carry.energy > 0){
                if (!this.tryTargeting('transferring')){
                    if (!this.tryTargeting('building')){
                        if (!this.tryTargeting('storing')){
                            if (!this.tryTargeting('upgrading')){
                                console.log('Creep is unable to spend energy!?');
                            }
                        }
                        // var coin = Math.round(Math.random()*2);
                        // // console.log(coin);
                        // if (coin){ //Can either store the energy, or go upgrade with it.
                        //     if (!this.tryTargeting('storing')){
                        //         if (!this.tryTargeting('upgrading')){
                        //             console.log('Creep is unable to spend energy!?');
                        //         }
                        //     }
                        // }else{
                        //     if (!this.tryTargeting('upgrading')){
                        //         console.log('Creep is unable to spend energy!?');
                        //     }
                        // }
                    }
                }
            }else{
                if (!this.tryTargeting('picking')){
                    if (!this.tryTargeting('harvesting')){
                        if (!this.tryTargeting('energizing')){
                            // console.log('Creep is unable to find an energy source!');
                            this.tryTargeting('moving');
                        }
                    }
                }
            }
        }else if (this.canFight()){
            // console.log('fighter');
        }
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

    //(Game.time%200 == 0)
    var auto_retarget = Math.round(Math.random()*100) == 0;//Periodically force a retarget to hopefully unstuck things.
    // if (auto_retarget) console.log('unstucking');
    if (this.ticksToLive < MIN_TICKS_TO_LIVE && action_name != 'renewing'){
        this.retarget();
    }else if (!target || !action_function || auto_retarget){
        this.retarget();
    }

    if (target && action_function){ 
        // action_function(target);
        action_function.apply(this, [target]);
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
        if (build_value <= MAX_UNITS_METRIC)
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

var PartCosts = {};
PartCosts[MOVE] = 50;
PartCosts[WORK] = 100;
PartCosts[CARRY] = 50;
PartCosts[ATTACK] = 80;
PartCosts[RANGED_ATTACK] = 150;
PartCosts[HEAL] = 250;
PartCosts[TOUGH] = 10;

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
            Memory.creeps[c].cost
            console.log('Deleting creep ' + c + " from memory. Cost(" + Memory.creeps[c].cost + ")");
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

        for (var t in towers){
            var tower = towers[t];
            var target;
            // console.log(tower.id);

            // var action = tower.repair(repair_target);
            // console.log(repair_target, action);
            if (tower.energy > 0){
                // target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                //     filter: function(obj){
                //         return obj.memory.action_name == 'building'
                //     }
                // });
                // if (target){
                //     var transferring = Math.min(target.carryCapacity - target.carry.energy, tower.energy);
                //     console.log(target.carryCapacity - target.carry.energy, tower.energy, transferring);
                //     if (transferring > 0){
                //         var action = tower.transferEnergy(target, transferring);
                //         console.log(target, action, transferring);
                //     }
                // }

                target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target){
                    var action = tower.attack(target);
                }else{
                    target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                        filter: function(obj){
                            return obj.hits < obj.hitsMax
                        }
                    });
                    if (target){
                        var action = tower.heal(target);
                    }else{
                        target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: function(obj){
                                // if (obj.structureType == STRUCTURE_ROAD){
                                //     console.log(obj.hits, obj.hitsMax, obj.hitsMax*3/4);
                                // }
                                return (
                                    (obj.structureType == STRUCTURE_ROAD ||
                                        (obj.owner && obj.owner.username == USERNAME))// ||  obj.structureType == STRUCTURE_WALL)
                                    && obj.hits < obj.hitsMax && obj.hits < 50000
                                );
                            }
                        });
                        if (target){
                            var action = tower.repair(target);
                        }
                    }
                }
                
            }
        }
    }
    
    for(var c in Game.creeps) {
       // console.log(c);
        var creep = Game.creeps[c];
        Cache.add(creep); 

        if(creep.memory.role == 'guard') {
            Guard.work(creep);
        }else{
            creep.work();
        }
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
                
                var memory = {
                        role: build_role
                    },
                    body = [MOVE],
                    cost = 50;

                function fillBody(bodyParts){
                    var costOfSet = 0, numOfParts = 0;
                    for (var b in bodyParts){
                        costOfSet += PartCosts[bodyParts[b]];
                        numOfParts++;
                    }
                    while(totalEnergy - (cost + costOfSet) > 0 && body.length+numOfParts <= 50){
                        for (var b in bodyParts){
                            body.unshift(bodyParts[b]);
                        }
                        cost += costOfSet;
                    }
                }
                if (build_role == 'worker'){
                    // var partCost = 100 + 50 + 50, parts = 3;
                    // body = fillBody(body, [WORK, CARRY, MOVE], 100 + 50 + 50);
                    // while(totalEnergy - (cost + partCost) >= 0){ //limit the amount of move parts
                    //     body.unshift(MOVE); //50
                    //     body.unshift(CARRY); //50
                    //     body.unshift(WORK); //100
                    //     cost += partCost;
                    // }
                    // partCost = 100 + 50; parts = 2;
                    // while(totalEnergy - (cost + partCost) >= 0){
                    //     body.unshift(CARRY); //50
                    //     body.unshift(WORK); //100
                    //     cost += partCost;
                    // }
                    // partCost = 50; parts = 1;
                    // while(totalEnergy - (cost + partCost) >= 0){
                    //     body.unshift(CARRY); //50
                    //     cost += partCost;
                    // }
                    fillBody([MOVE, CARRY, WORK]);
                    fillBody([CARRY, WORK]);
                    fillBody([CARRY]);
                }else if (build_role == 'guard'){
                    // var partCost = 80 + 10 + 10 + 50, parts = 4;
                    // while(totalEnergy - (cost + partCost) >= 0){ //limit the amount of move parts
                    //     body.unshift(MOVE); //50
                    //     body.unshift(ATTACK); //80
                    //     body.unshift(TOUGH); //10
                    //     body.unshift(TOUGH); //10
                    //     cost += partCost;
                    // }
                    // partCost = 80 + 10 + 10;
                    // while(totalEnergy - (cost + partCost) >= 0){
                    //     body.unshift(ATTACK); //80
                    //     body.unshift(TOUGH); //10
                    //     body.unshift(TOUGH); //10
                    //     cost += partCost;
                    // }
                    // partCost = 10;
                    // while(totalEnergy - (cost + partCost) >= 0){
                    //     body.unshift(TOUGH); //10
                    //     cost += partCost;
                    // }
                    fillBody([MOVE, ATTACK, TOUGH, TOUGH]);
                    fillBody([ATTACK, TOUGH, TOUGH]);
                    fillBody([TOUGH]);
                }
                spawn.room.memory.highest_creep_cost = Math.max(cost, spawn.room.memory.highest_creep_cost);
                memory['cost'] = cost;
                response = spawn.createCreep(body, null, memory);
                if (!(response < 0)){
                    console.log("Making a new " + build_role + " named "  + response + " that costs " + cost);
                }else if (response == ERR_BUSY){
                    //just wait
                }else{
                    console.log("Create creep response:", response);
                }
            }else{
                // console.log('no build role');
            }
        }
    }
}