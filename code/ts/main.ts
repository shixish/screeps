/// <reference path="vars/Globals.ts" />
/// <reference path="utils/Inventory.ts" />
/// <reference path="vars/CreepInfo.ts" />
/// <reference path="vars/StructureInfo.ts" />
/// <reference path="utils/Debug.ts" />
"use strict";

function run_structure(type:string, structure: Structure) {
    if (structure_controllers[type]) {
        let fn = structure_controllers[type];
        // console.log(type, fn)
    }
}

declare var module: any;
(module).exports.loop = function () {
    var totalDiag = debug.diag('Total');
    Inventory.update();

    for (let r in Game.rooms){
        let room = <Room>Game.rooms[r];
        let memory = Memory.rooms[room.name];

        if (memory.structures) {
            for (let type in memory.structures) {
                if (structure_controllers[type]) {
                    let structures = memory.structures[type];
                    let StructureController = structure_controllers[type];
                    for (let s in structures) {
                        let id = structures[s];
                        let structureDiag = debug.diag(['structure.' + type, room.name + '.' + type]);
                        try {
                            let controller = new StructureController(id);
                        } catch (e) {
                            if (e === "Invalid Object ID") {
                                delete memory.structures[type][id];
                            }else{
                                console.log(e);
                            }
                        }
                        structureDiag.stop();
                    }
                }
            }
        }

        if (memory.source) {
            for (let t in memory.source) {
                let sourceDiag = debug.diag(room.name + '.source');
                try {
                    let source = new SourceController(t);
                } catch (e) {
                    // if (e === "Invalid Object ID") {
                    //     delete memory.source[t];
                    // } else {
                    //     console.log(e);
                    // }
                }
                sourceDiag.stop();
            }
        }
    }
    // diag.stop();
    
    
    for(let c in Game.creeps) {
        let creep = Game.creeps[c];
        var creepDiag = debug.diag('creeps.' + creep.memory.role);
        // Cache.add(creep);

        
        // console.log(courier.work);
        // courier.work();
        if (creep_controllers[creep.memory.role]) {
            let CreepController = creep_controllers[creep.memory.role];
            let ctrl = new CreepController(creep);
            ctrl.work();
        }else {
            console.log("Unknown creep role:", creep, creep.memory.role);
        }
        creepDiag.stop();
    }
    
    totalDiag.stop();
    
    // debug.printDiag();
}