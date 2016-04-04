/// <reference path="vars/Globals.ts" />
/// <reference path="utils/Inventory.ts" />
/// <reference path="vars/CreepInfo.ts" />
/// <reference path="vars/StructureInfo.ts" />
"use strict";

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
            console.log("Unknown creep role:", creep, creep.role);
        }
    }
}