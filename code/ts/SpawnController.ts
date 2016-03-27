/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="Inventory.ts" />
"use strict";
var _ = require('lodash'),
    Globals = require('Globals'),
    Inventory = require('Inventory'),
    CourierCreep = require('CourierCreep'),
    HarvesterCreep = require('HarvesterCreep'),
    MinerCreep = require('MinerCreep'),
    BuilderCreep = require('BuilderCreep'),
    GuardCreep = require('GuardCreep'),
    RunnerCreep = require('RunnerCreep'),
    LinkerCreep = require('LinkerCreep');

declare var module: any;
(module).exports = class SpawnController {
    structure: Spawn;

    creep_creators = {
        'harvester': HarvesterCreep.create,
        'linker': LinkerCreep.create,
        'courier': CourierCreep.create,
        'miner': MinerCreep.create,
        'builder': BuilderCreep.create,
        'guard': GuardCreep.create,
        'runner': RunnerCreep.create
    }
    max_creeps() {
        let spawns = Inventory.room_count('spawn', this.structure.room),
            storage = Inventory.room_count('storage', this.structure.room),
            towers = Inventory.room_count('tower', this.structure.room);

        return {
            'harvester': Inventory.room_count('source', this.structure.room),
            'linker': storage,
            'courier': storage > 0 ? spawns + towers : 0,
            'miner': storage > 0 ? Inventory.room_count('mineral', this.structure.room) : 0,
            'builder': spawns,
            'guard': (towers < 1) ? 1 : 0,
            'runner': Game.flags[this.structure.room.name+'_runner'] ? 1 : 0, 
        }
    }

    constructor(structure_id) {
        this.structure = <Spawn>Game.getObjectById(structure_id);
        if (!this.structure) {
            console.log('Unable to find Spawn with ID', structure_id);
            throw "Invalid Object ID";
        }
        this.work();
    }

    work() {
        //These get set by the Inventory process
        let room = this.structure.room;
        let repairable = this.structure.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: function(obj: Creep) {
                return obj.ticksToLive < 1400
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
            // console.log('renewing ', lowest_creep);
            let action = this.structure.renewCreep(lowest_creep);
            if (action == ERR_NOT_IN_RANGE) {
                //it's ok
            } else if (action == ERR_FULL) {
                //no problem
            } else if (action == ERR_BUSY) {//The spawn is busy
                //just wait
            } else if (action == ERR_INVALID_TARGET) {
                //ok i guess
            } else if (action != 0) {
                console.log('renewing error:', action);
            }
        } else if (room.energyAvailable == room.energyCapacityAvailable || room.energyAvailable >= Globals.MAX_COST) {
            let max_creeps = this.max_creeps();
            let min_role = null, min_count = null;
            for (let role in max_creeps) {
                let count = Inventory.room_count_creeps(role, room);
                if (count < max_creeps[role] && (min_count == null || count < min_count)) {
                    min_count = count;
                    min_role = role;
                }
            }

            if (min_role) {
                this.create_creep(min_role, room);
            }
        }
    }

    create_creep(role: string, room: Room) {
        // if (this.structure.room.name == 'W18S29')
        //     console.log(this.structure.room.name, role, totalEnergy);
        if (role && this.creep_creators[role]) {
            let fn = this.creep_creators[role];
            let creep_body = fn(room.energyCapacityAvailable);
            let creep_memory = {
                role: role
            };
            let response = this.structure.createCreep(creep_body, null, creep_memory);
            if (!(response < 0)) {
                let name = response;
                console.log("Making a new " + creep_memory.role + " named " + name + " in room " + room.name);
                Inventory.invCreep(creep_memory.role, name, room);
                return response;//new creep name
            } else if (response == ERR_BUSY) {
                //just wait
            } else {
                console.log("Create creep response:", response);
            }
        } else {
            console.log('Unable to create ${role} creep');
        }
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