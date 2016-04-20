/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseFlag.ts" />
"use strict";
class AttackFlag extends BaseFlag {
    public flag_name = 'Attack';
    public flag: Flag;

    constructor(flag: Flag) {
        super(flag);
    }

    getMaxCreepCount() {
        let flag_creeps = {
            'Guard': 0,
            'Healer': 0,
            'Ranger': 2,
            'Runner': 0,
        }
        return flag_creeps;
    }
}
FlagTypes['Attack'] = AttackFlag;