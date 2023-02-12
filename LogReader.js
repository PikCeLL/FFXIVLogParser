import * as netEvt from "./NetworkLineEvent.js";

"use strict";

export class Pull {
    #timeStart = new Date(9999, 12, 31);
    #timeEnd = new Date(1, 1, 1);
    #isCleared = false;
    #id;
    #eventList = new Array(0);
   
    constructor(id) {
        this.#id = id;
    }

    addEvent(event) {
        this.#eventList.push(event);
    }

    setCleared() {
        this.#isCleared = true;
    }

    /**
     * @param {Date} timeStart
     */
    set start(timeStart) {
        this.#timeStart = timeStart;
    }

    /**
     * @param {Date} timeEnd
     */
    set end(timeEnd) {
        this.#timeEnd = timeEnd;
    }

    get id() {
        return this.#id;
    }

    get start() {
        return this.#timeStart;
    }

    get end() {
        return this.#timeEnd;
    }

    get isCleared() {
        return this.#isCleared;
    }

    get events() {
        return this.#eventList;
    }

    get duration() {
        return this.#timeEnd - this.#timeStart;
    }
}

/**
 * Returns an arry of Pulls that may contain individual events. Pulls are ordered as found in the file (should be chronological if file is untempered).
 * @param {File} file
 * @param {boolean} recordEvents
 */
export function readFile(file, recordEvents = false) {
    console.log(`Reading ${file.name}`);

    const pulls = new Array();
    var currentPull = null;
    var isPullAboutToStart = false;

    const reader = new FileReader();
    reader.onload = function(progressEvent){
        var fileContentArray = this.result.split(/\r\n|\n/);
        for(var line = 0; line < fileContentArray.length-1; line++){
            const event = new netEvt.NetworkLineEvent(fileContentArray[line]);
            if (event.type === netEvt.EventType.INSTANCE) {
                if (event.instanceType.isReset() || event.instanceType.equals(netEvt.InstanceEventType.INIT)) {
                    isPullAboutToStart = true;
                    currentPull = new Pull(event.name);
                } else if (currentPull !== null && event.instanceType.equals(netEvt.InstanceEventType.WIPE) || event.instanceType.equals(netEvt.InstanceEventType.TIME_OUT)) {
                    if (currentPull.start < event.timestamp) {
                        currentPull.end = event.timestamp;
                        pulls.push(currentPull);
                        currentPull = null;
                    }
                } else if (currentPull !== null && event.instanceType.equals(netEvt.InstanceEventType.CLEAR)) {
                    if (currentPull.start < event.timestamp) {
                        currentPull.end = event.timestamp;
                        currentPull.setCleared();
                        pulls.push(currentPull);
                        currentPull = null;
                    }
                }
            } else if (currentPull !== null && event.type === netEvt.EventType.ABILITY) {
                if (isPullAboutToStart && event.isSourcePlayer() && !event.isAoE() && !event.isTargetPlayer()) {
                    isPullAboutToStart = false;
                    currentPull.start = event.timestamp;
                }
            }
            if (recordEvents && currentPull !== null && event.timestamp >= currentPull.start && event.type != netEvt.EventType.UNREAD) {
                currentPull.addEvent(event);
            }
        }
    };
    reader.readAsText(file);
    return pulls;
}
