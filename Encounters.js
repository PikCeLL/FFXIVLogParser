import * as netEvt from "./NetworkLineEvent.js";

"use strict";

/* ====ULTIMATES==== */
export const TEA = ['TEA', '80037586', ["Living Liquid", "Cruise Chaser", "Alexander Prime", "Perfect Alexander"], ["LL", "BJCC", "Prime", "Perfect"]];
export const UCoB = ['UCoB', '80037569', ["Twintania", "Nael Deus Darnus", "Bahamut Prime", "Twintania", "Bahamut Prime"], ["Twin", "Nael", "Trios", "Adds", "Golden"]];
export const UwU = ['UwU', '80037573', ["Garuda", "Ifrit", "Titan", "The Ultima Weapon"], ["Garuda", "Ifrit", "Titan", "Ultima"]];
export const DSR = ['DSR', '8003759A', ["King Thordan", "Nidhogg", "Right Eye", "Ser Charibert", "King Thordan", "Hraesvelgr", "Dragon-king Thordan"], ["King Thordan", "Nidhogg", "Eyes", "Rewind!", "King Thordan II", "Dragons", "The Dragon King"]];


export class PhasedPullProcessor {
    // currentPull is an array containing, in this order : Start Time, Pull Duration, Phase # and Cleared Status
    #currentPull = null;
    #pulls = new Array();
    #encounter;

    constructor(encounter) {
        this.#encounter = encounter;
    }

    /**
     * Readies a new pull for processing
     * @param {String} fightID 
     */
    createNewPull(fightID) {
        if (fightID == this.#encounter[1]) {
            this.#currentPull = [new Date(1, 1, 1), 0, 0, false];
        } else {
            this.#currentPull = null;
        }
    }

    /**
     * Starts the pull
     * @param {Date} startTime 
     */
    startPull(startTime) {
        if (this.#currentPull != null) {
            this.#currentPull[0] = startTime;
        }
    }

    /**
     * Ends the pull as a wipe
     * @param {Date} endTime 
     */
    wipePull(endTime) {
        if (this.#currentPull != null) {
            this.#currentPull[1] = endTime - this.#currentPull[0];
            this.#pulls.push(this.#currentPull);
            this.#currentPull = null;
        }
    }

    /**
     * Ends the pull as a clear
     * @param {Date} endTime 
     */
    clearPull(endTime) {
        if (this.#currentPull != null) {
            this.#currentPull[3] = true;
            this.wipePull(endTime);
        }
    }

    /**
     * Processes an event
     * @param {netEvt.NetworkLineEvent} event 
     */
    processEvent(event) {
        if (this.#currentPull != null && event.type === netEvt.EventType.ABILITY) {
            if (this.#encounter[2].length > this.#currentPull[2] && this.#encounter[2][this.#currentPull[2] + 1] == event.target) {
                ++this.#currentPull[2];
            }
        }
    }

    get result() {
        return this.#pulls;
    }
}
