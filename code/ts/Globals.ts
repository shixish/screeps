/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="../dts/require.d.ts" />

"use strict";
var _ = require('lodash');

let PartCosts = {};
    PartCosts[MOVE] = 50;
    PartCosts[WORK] = 100;
    PartCosts[CARRY] = 50;
    PartCosts[ATTACK] = 80;
    PartCosts[RANGED_ATTACK] = 150;
    PartCosts[HEAL] = 250;
    PartCosts[TOUGH] = 10;

PathFinder.use(true);

var Globals = {
    USERNAME: 'ShiXish',
    MIN_TICKS_TO_LIVE: 500,
    MAX_UNITS_METRIC: 3,
    // MAX_HITS_REPAIR: 1000000,
    MAX_COST: 3000,
    PART_COSTS: PartCosts,
}
