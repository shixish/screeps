/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="Globals.ts" />
/// <reference path="Inventory.ts" />
/// <reference path="BaseCreep.ts" />
/// <reference path="CourierCreep.ts" />
/// <reference path="HarvesterCreep.ts" />
/// <reference path="MinerCreep.ts" />
/// <reference path="BuilderCreep.ts" />
/// <reference path="GuardCreep.ts" />
/// <reference path="RangerCreep.ts" />
/// <reference path="RunnerCreep.ts" />
/// <reference path="LinkerCreep.ts" />
/// <reference path="TowerController.ts" />
/// <reference path="SpawnController.ts" />
/// <reference path="SourceController.ts" />
"use strict";

let structure_controllers = {
    'tower': TowerController,
    'spawn': SpawnController,
};

let creep_controllers = {
    'courier': CourierCreep,
    'harvester': HarvesterCreep,
    'miner': MinerCreep,
    'linker': LinkerCreep,
    'builder': BuilderCreep,
    'guard': GuardCreep,
    'ranger': RangerCreep,
    'runner': RunnerCreep,
};

function run_structure(type:string, structure: Structure) {
    if (structure_controllers[type]) {
        let fn = structure_controllers[type];
        // console.log(type, fn)
    }
}

declare var module: any;
(module).exports.loop = function () {
    Inventory.update();

    for (let r in Game.rooms){
        let room = <Room>Game.rooms[r];
        let memory = Memory.rooms[room.name];

        if (memory.structures) {
            for (let type in memory.structures) {
                if (structure_controllers[type]) {
                    let structures = memory.structures[type];
                    let StructureController = structure_controllers[type];
                    for (let id in structures) {
                        try {
                            let controller = new StructureController(id);
                        } catch (e) {
                            if (e === "Invalid Object ID") {
                                delete memory.structures[type][id];
                            }else{
                                console.log(e);
                            }
                        }
                    }
                }
            }
        }

        if (memory.source) {
            for (let t in memory.source) {
                try {
                    let source = new SourceController(t);
                } catch (e) {
                    // if (e === "Invalid Object ID") {
                    //     delete memory.source[t];
                    // } else {
                    //     console.log(e);
                    // }
                }
            }
        }
    }
    
    for(let c in Game.creeps) {
       // console.log(c);
        let creep = Game.creeps[c];
        // Cache.add(creep);

        
        // console.log(courier.work);
        // courier.work();
        if (creep_controllers[creep.memory.role]) {
            let CreepController = creep_controllers[creep.memory.role];
            let ctrl = new CreepController(creep);
            ctrl.work();
        }else {
            console.log("Unknown creep role:", creep);
        }
    }
}