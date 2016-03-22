/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
var Globals = require('Globals'),
    Inventory = require('Inventory'),
    CourierCreep = require('CourierCreep');

declare var module: any;
(module).exports = class SourceController {
    source: Source;

    constructor(source_id) {
        this.source = <Source>Game.getObjectById(source_id);
        if (!this.source) {
            console.log('Unable to find Source with ID', source_id);
            throw "Invalid Object ID";
        }
        this.work();
    }

    work() {

    }
}