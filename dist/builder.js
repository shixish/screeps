// var energy = require('energy');
module.exports = {
//     get_energy: function(creep){
//         var spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS, {
//             // filter: { owner: { username: 'Invader' } }
//         });
//         var transfer = spawn.transferEnergy(creep);
//         // console.log(transfer);
// 		if(transfer == ERR_NOT_IN_RANGE) {
// 			creep.moveTo(spawn);
// 		}
//     },
    build: function(creep, target){
        var action = creep.build(target);
        if (creep.carry.energy == 0){//end condition:
            creep.say('Built');
            this.retarget(creep);
            this.work(creep);
        }else{
            if(action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }else if (action == ERR_BUSY){//The creep is still being spawned.
                //just wait
            // }else if (action == ERR_INVALID_TARGET){
            }else if (action != 0){
                console.log('build error:', action);
                this.retarget(creep);
            }
        }
        
    },
    upgrade: function(creep, target){
        if (creep.carry.energy == 0){//end condition:
            creep.say('Upgraded');
            this.retarget(creep);
            this.work(creep);
        }else{
            var action = creep.upgradeController(target);
            if(action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }else if (action != 0){
                console.log('upgrading error:', action);
                this.retarget(creep);
            }
        }
    },
    move: function(creep, target){
        creep.moveTo(target);
        this.retarget(creep);
    },
    restock: function(creep, target){
        if (creep.carry.energy == creep.carryCapacity || target.energy == 0){//end condition:
            creep.say('Restocked');
            this.retarget(creep);
            this.work(creep);
        }else{
            //Otherwise the builders will bleed the system dry and run out of harvesters...
            if (target.energy > target.energyCapacity*.75){ //mostly full, then go for it.
                var action = target.transferEnergy(creep);
                // if (target.energy <= 5){
                //     this.retarget(creep);
                // }
                if(action == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }else if (action != 0){
                    console.log('restocking error:', action);
                    this.retarget(creep);
                }
            }
        }
    },
    retarget: function(creep){
        // console.log('INFO: Builder ' + creep.name + ' retargeting');
        this.retarget_count++;
        if (this.retarget_count > 3){
            console.log('CRITICAL: builder unable to find a new target');
            return;
        }
        creep.memory.target_id = null;
        creep.memory.action_name = null;
        if(creep.carry.energy < creep.carryCapacity) {
            var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: function(obj){
                    return (
                        obj.structureType == STRUCTURE_SPAWN
                        || (obj.structureType == STRUCTURE_EXTENSION)
                    ) && obj.energy > 0;
                }
            });
            if (target){
                creep.memory.target_id = target.id;
                creep.memory.action_name = 'restock';
            }else{
                if (Game.flags.resting){
                    creep.memory.target_id = Game.flags.resting.id;
                    creep.memory.action_name = 'move';
                }
                console.log('unable to find a new restock target');
            }
		}
		else {
		    var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                // filter: { owner: { username: 'Invader' } }
            });
            // console.log(target);
            if (!target){
                if(creep.room.controller) {
                    creep.memory.target_id = creep.room.controller.id;
                    creep.memory.action_name = 'upgrade';
                }
            }else{
                if (target){
                    creep.memory.target_id = target.id;
                    creep.memory.action_name = 'build';
                }else{
                    if (Game.flags.resting){
                        creep.memory.target_id = Game.flags.resting.id;
                        creep.memory.action_name = 'move';
                    }
                    console.log('unable to find a new build target');
                }
            }
		}
// 		this.work(creep);
    },
    work: function(creep){
        this.retarget_count = 0;
        // this.retarget(creep);
        var target = Game.getObjectById(creep.memory.target_id),
            action_name = creep.memory.action_name,
            action_function = this[action_name];
        
        // creep.say(action_name);
        if (target && action_function){
            // action_function(creep, target);
            action_function.apply(this, [creep, target])
        }else{
            // console.log('unknown harvester action:', action_name);
            this.retarget(creep);
        }
        
        // creep.say('builder');
        // console.log(creep);
//         if(creep.carry.energy == 0) {
//             this.get_energy(creep);
// 		}
// 		else {
//             var construction_sites = creep.room.find(FIND_CONSTRUCTION_SITES);
//             // console.log(construction_sites.length);
//             if (!construction_sites.length){
//                 if(creep.room.controller) {
//                     if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
//                         creep.moveTo(creep.room.controller);    
//                     }
//                 }
                
//             }else{
//                 var site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
//                     // filter: { owner: { username: 'Invader' } }
//                 });
//                 var action = creep.build(site);
//                 if(action == ERR_NOT_IN_RANGE) {
//                     creep.moveTo(site);
//                 }else if (action == ERR_BUSY){//The creep is still being spawned.
//                     //just wait
//                 }else if (action != 0){
//                     console.log('build error:', action);
//                 }
//             }
//             // var structuresNeedsRepair = Game.rooms.sim.find(FIND_MY_STRUCTURES, {
//             //     filter: function(i) {
//             //         return i.needsRepair();
//             //     }
//             // });
// 		}
    },
    make: function(spawn){
        var memory = {
                role: "builder"
            },
            body = [WORK, WORK, CARRY, CARRY, MOVE];
        //simple:
        // body = [WORK, CARRY, CARRY, MOVE];
        return spawn.createCreep(body, null, memory);
    }
};