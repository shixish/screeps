/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseFlag.ts" />
"use strict";
class HarvestFlag extends BaseFlag {
    public flag_name = 'Harvest';

    constructor() {
        super();
    }

    getMaxCreepCount() {
        let flag_creeps = {
            'Harvester': 0,
            'Courier': 0,
            'Linker': 0,
            'Guard': 0,
            'Healer': 0,
            'Ranger': 0,
            'Builder': 0,
            'Miner': 0,
            'Runner': 0,
        }

        // if (!target_room) { // || target_room.controller [claim timer is low]
        //     flag_creeps['Claim'] = 1;
        // } else {
        //     flag_creeps['Harvester'] = Inventory.room_sources(target_room);
        //     flag_creeps['Builder'] = target_room.memory.constructing > 0 ? 1 : 0;
        //     // flag_creeps['Courier'] = Inventory.room_sources(target_room) * 4;
        // }
        return flag_creeps;
    }
}
FlagTypes['Harvest'] = HarvestFlag;