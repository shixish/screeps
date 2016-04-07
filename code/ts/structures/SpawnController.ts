/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
/// <reference path="../vars/CreepInfo.ts" />
"use strict";

class SpawnController {
    structure: Spawn;
    controller_level: number;

    constructor(structure_id) {
        this.structure = <Spawn>Game.getObjectById(structure_id);
        if (!this.structure) {
            console.log('Unable to find Spawn with ID', structure_id);
            throw "Invalid Object ID";
        }
        if (this.structure.isActive()) {//this can happen on the test realm especially.
            this.work();
        }
        // console.log(this.structure.isActive);
    }

    // max_creeps() {
    //     let sources = Inventory.room_sources(this.structure.room),
    //         minerals = Inventory.room_minerals(this.structure.room),
    //         spawns = Inventory.room_structure_count('spawn', this.structure.room),
    //         storage = Inventory.room_structure_count('storage', this.structure.room),
    //         towers = Inventory.room_structure_count('tower', this.structure.room),
    //         links = Inventory.room_structure_count('link', this.structure.room),
    //         extensions = Inventory.room_structure_count('extension', this.structure.room);

    //     let flagCreeps = {
    //         'guard': 0, 
    //         'ranger': 0, 
    //         'runner': 0
    //     };

    //     for (let name in flagCreeps) {
    //         // let obj = flagCreeps[c];
    //         let flag = Game.flags[`${this.structure.room.name}_${name}`];
    //         if (flag) {
    //             if (!flag.memory.creeps || flag.memory.creeps == "") {
    //                 flagCreeps[name] = 1;
    //             }else if (flag.memory.max_creeps > 0 && flag.memory.creeps.length < flag.memory.max_creeps){
    //                 flagCreeps[name] = flag.memory.max_creeps - flag.memory.creeps.length;
    //             }
    //         }
    //     }

    //     // console.log(flagCreeps['runner'])
    //     let values = {
    //         'builder': (this.controller_level < 8 ? 1 : 0) + (storage ? 1 : 0),
    //         'harvester': sources,
    //         'linker': links > 0 ? storage : 0,
    //         'courier': storage > 0 ? Math.ceil(towers / 2) : 0,
    //         'miner': 0, //storage > 0 ? minerals : 0,
    //         'guard': flagCreeps['guard'],
    //         'ranger': flagCreeps['ranger'],
    //         'runner': flagCreeps['runner'],
    //         'healer': 0,
    //     }

    //     // if (this.structure.name == "Spawn6")
    //     //     debug.log(this.structure.name, values, this.structure.room.energyAvailable, this.structure.room.energyCapacityAvailable);

    //     let attack_flag = Game.flags[`${this.structure.room.name}_attack`];
    //     if (attack_flag) {
    //         values.guard += 2;
    //         values.healer += 2;
    //         values.ranger += 2;
    //     }

        
    //     let under_attack_by = this.structure.room.memory.under_attack;
    //     if (this.structure.room.memory.under_attack > 0){
    //         values.courier += Math.floor(under_attack_by / 3);
    //         values.healer += Math.floor(under_attack_by / 2);
    //         values.guard += Math.ceil(under_attack_by / 4);
    //         values.ranger += Math.ceil(under_attack_by);
    //     }
    //     //Need to make these obsolete... ^
    //     return values;
    // }


    work() {
        //These get set by the Inventory process
        let room = this.structure.room;
        let repairable = this.structure.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: function(obj: Creep) {
                return !obj.memory.obsolete && obj.ticksToLive < 1400
            }
        });
        // if (room.name == 'W18S29') {
        //     let max_creeps = this.max_creeps();
        //     console.log(this.structure.room.name);
        //     for (let i in max_creeps) {
        //         console.log(i, max_creeps[i]);
        //     }
        // }
        if (repairable.length) {
            let lowest_creep = _.min(repairable, function(obj) {
                return obj.ticksToLive;
            });
            let highest_creep = _.max(repairable, function(obj) {
                return obj.ticksToLive;
            });
            let target_creep = lowest_creep < 10 ? lowest_creep : highest_creep;

            // console.log('renewing ', lowest_creep);
            let action = this.structure.renewCreep(target_creep);
            if (action == ERR_NOT_IN_RANGE) {
                //it's ok
            } else if (action == ERR_FULL) {
                //no problem
            } else if (action == ERR_BUSY) {//The spawn is busy
                //just wait
            } else if (action == ERR_NOT_ENOUGH_ENERGY) {
                let creep_total = 0;
                //Get total number of creeps in this room.
                for (let l in room.memory.creep_roles) {
                    creep_total += Object.keys(room.memory.creep_roles[l]).length;
                }
                
                //if all of the creeps are trying to renew themselves and nobody is actually working, just make them all live out their last breaths.
                // console.log(repairable.length, creep_total);
                if (repairable.length == creep_total){
                    for (let r in repairable){
                        (<Creep>repairable[r]).memory.obsolete = true;
                    }
                    console.log(`Room ${room.name} is on it's last breaths.`);
                }
            } else if (action == ERR_INVALID_TARGET) {
                //ok i guess
            } else if (action != 0) {
                console.log('renewing error:', action);
            }
        //notice: energyAvailable can be more than energyCapacityAvailable if the controller gets downgraded (test realm).
        } else {
            // console.log(room.memory['spawn_queue']);
            let queue = room.memory['spawn_queue'];
            if (queue.length) { 
                let name = this.create_creep(queue[0], room);
                console.log(name);
                if (name != undefined && name < 0) queue.shift(); //creep was created...
            }

            // if (room.energyAvailable >= room.energyCapacityAvailable || room.energyAvailable >= Globals.MAX_COST || !room.memory.creep_roles) {
                // let max_creeps = this.max_creeps();
                // let min_role = null, min_count = null;
                // // console.log(Object.keys(max_creeps));

                // for (let role in max_creeps) {
                //     let count = Inventory.room_creep_count(role, room);
                //     if (count < max_creeps[role] && (min_count == null || count < min_count)) {
                //         min_count = count;
                //         min_role = role;
                //     }
                // }

                // if (min_role) {
                //     var response = this.create_creep(min_role, room);
                //     if (response !== false) {

                //     }
                // }
            // }
        }

        // console.log('working', room.energyAvailable, room.energyCapacityAvailable);
    }

    create_creep(role: string, room: Room) {
        // if (this.structure.room.name == 'W18S29')
        //     console.log(this.structure.room.name, role, totalEnergy);
        // if (role) {
        // if (role == "guard") {
        //     console.log('trying to build a ', role);
        // }
        if (role && creep_controllers[role]) {
            let ctrl = creep_controllers[role];
            let tier = ctrl.produce_new(room);
            // if (role == "guard") {
            //     console.log(tier, ctrl);
            // }
            if (tier) {
                let memory = tier.memory ? tier.memory : {};
                memory.role = role;
                memory.cost = tier.cost;

                if (_.indexOf(tier.body, CLAIM) !== -1) {
                    memory.obsolete = true; //can't repair claim creeps.
                }
                let response: any = this.structure.createCreep(tier.body, null, memory);
                if (!(response < 0)) {
                    let name: string = response;
                    console.log("Making a new " + role + " named " + name + " in room " + room.name);
                    Inventory.invNewCreep(role, name, room);
                    return response;//new creep name
                } else if (response == ERR_BUSY) {
                    //just wait
                } else if (response == ERR_NOT_ENOUGH_ENERGY) {
                    //the base was likely attacked...
                    // console.log(this.structure.room.name, 'is dead.');
                } else {
                    console.log(this.structure.room.name, this.structure, "create creep error:", response);
                }
            } else {
                console.log(`No creep tier found for ${role} in room ${room}`)
            }
        } else {
            console.log(`Spawn detected invalid creep role ${role}!`);
        }
        return false;


        // let fn = this.creep_creators[role];
        // let creep_body = fn(room.energyCapacityAvailable);
        // let creep_memory = {
        //     role: role
        // };
        // if (_.indexOf(creep_body, CLAIM) !== -1) {
        //     creep_memory['obsolete'] = true; //can't repair claim creeps.
        // }
        // //TODO:: USE : creep.getActiveBodyparts
        // let response:any = this.structure.createCreep(creep_body, null, creep_memory);
        // if (!(response < 0)) {
        //     let name:string = response;
        //     console.log("Making a new " + creep_memory.role + " named " + name + " in room " + room.name);
        //     Inventory.invNewCreep(creep_memory.role, name, room);
        //     return response;//new creep name
        // } else if (response == ERR_BUSY) {
        //     //just wait
        // } else {
        //     console.log(this.structure.room.name, this.structure, "create creep error:", response);
        // }
    // } else {
    //     console.log(`Unable to create ${role} creep`);
    // }
    }

    // create_creep(creep_body: string[], creep_memory) {
    //     var response = this.structure.createCreep(creep_body, null, creep_memory);
    //     if (!(response < 0)) {
    //         var name = response;
    //         console.log("Making a new " + creep_memory.role + " named " + name);
    //         Inventory.invNewCreep(creep_memory.role, name);
    //         return response;//new creep name
    //     } else if (response == ERR_BUSY) {
    //         //just wait
    //     } else {
    //         console.log("Create creep response:", response);
    //     }
    // }
}