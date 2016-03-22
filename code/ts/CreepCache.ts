/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
var Globals = require('Globals');

declare var module: any;
(module).exports = class CreepCache {
    private creep_cache = {};
    private creep_cache_length = {};

    add(creep: Creep) {
        var role = creep.memory.role,
            name = creep.name;

        // console.log('caching:', creep, role);
        if (role && name) {
            if (!this.creep_cache.hasOwnProperty(role)) {
                this.creep_cache[role] = {};
                this.creep_cache_length[role] = 0;
            }

            this.creep_cache[role][name] = creep;
            this.creep_cache_length[role] += 1;
        } else {
            console.log("unable to cache:", creep)
        }
    }

    get(role: string) {
        return this.creep_cache[role];
    }

    length(role: string) {
        return this.creep_cache_length[role] || 0;
    }

    weighted_lengths() {
        return {
            worker: (1 + this.length('worker')),
            guard: (1 + this.length('guard')) * 2
        };
    }

    should_build() {
        var weights = this.weighted_lengths();
        var build_value, build_role;
        for (var i in weights) {
            var value = weights[i];
            if (build_value == undefined || value < build_value) {
                build_value = value;
                build_role = i;
            }
        }
        if (build_value <= Globals.MAX_UNITS_METRIC)
            return build_role;
    }


    // min_creep_role(){
    //     var weights = this.weighted_lengths();
    //     var min_value, min_index;
    //     for (var i in weights){
    //         var value = weights[i];
    //         if (min_value == undefined || value < min_value){
    //             min_value = value;
    //             min_index = i;
    //         }
    //     }
    //     return min_index;
    // }
}