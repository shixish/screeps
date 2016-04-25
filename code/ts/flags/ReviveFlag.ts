/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
/// <reference path="BaseFlag.ts" />
"use strict";
class ReviveFlag extends BaseFlag {
    public flag_name = 'Revive';
    public flag: Flag;

    constructor(flag: Flag) {
        super(flag);
    }

    getMaxCreepCount() {
        let flag_creeps = {
            // 'Runner': 1,
            'RangeGuard': 1,
        };
        if (this.flag.room) {
            let room = this.flag.room;
            let sources = Inventory.room_sources(room);
            
            if (room.controller && (!room.controller.reservation && !room.controller.owner) || room.controller.ticksToDowngrade < 5000) {
                flag_creeps['Claim'] = 1;
            }
            flag_creeps['Runner'] = sources;
        }
        return flag_creeps;
    }
}
FlagTypes['Revive'] = ReviveFlag;