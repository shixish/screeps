/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class MoveAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Move';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        console.log('invalid creep movement command...');
        return false;
    }

}
CreepActions['Move'] = MoveAction;