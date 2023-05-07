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

class DefaultPullProcessor {
    #currentPull = null;
    #pulls = new Array();

    /**
     * Readies a new pull for processing
     * @param {String} fightID 
     */
    createNewPull(fightID) {
        this.#currentPull = new Pull(fightID);
    }

    /**
     * Starts the pull
     * @param {Date} startTime 
     */
    startPull(startTime) {
        this.#currentPull.start = startTime;
    }

    /**
     * Ends the pull as a wipe
     * @param {Date} endTime 
     */
    wipePull(endTime) {
        this.#currentPull.end = endTime;
        this.#pulls.push(this.#currentPull);
        this.#currentPull = null;
    }

    /**
     * Ends the pull as a clear
     * @param {Date} endTime 
     */
    clearPull(endTime) {
        this.#currentPull.setCleared();
        this.wipePull(endTime);
    }

    /**
     * Processes an event
     * @param {netEvt.NetworkLineEvent} event 
     */
    processEvent(event) {
        this.#currentPull.addEvent(event);
    }

    get result() {
        return this.#pulls;
    }
}

/**
 * Returns whatever the pull processor provides after parsing a log. The default is a list of {Pull} objects containing every event
 * @param {String} log
 * @param pullProcessor 
 */
export function readLog(log, pullProcessor = new DefaultPullProcessor()) {

    var isPullAboutToStart = false;
    var startTime = false;

    var fileContentArray = log.split(/\r\n|\n/);
    for(var line = 0; line < fileContentArray.length-1; line++){
        const event = new netEvt.NetworkLineEvent(fileContentArray[line]);
        if (event.type === netEvt.EventType.INSTANCE) {
            if (event.instanceType.isReset() || event.instanceType.equals(netEvt.InstanceEventType.INIT)) {
                isPullAboutToStart = true;
                startTime = false;
                pullProcessor.createNewPull(event.name);
            } else if (startTime !== false && event.instanceType.equals(netEvt.InstanceEventType.WIPE) || event.instanceType.equals(netEvt.InstanceEventType.TIME_OUT)) {
                if (startTime < event.timestamp) {
                    startTime = false;
                    pullProcessor.wipePull(event.timestamp);
                }
            } else if (startTime !== false && event.instanceType.equals(netEvt.InstanceEventType.CLEAR)) {
                if (startTime < event.timestamp) {
                    startTime = false;
                    pullProcessor.clearPull(event.timestamp);
                }
            }
        } else if (event.type === netEvt.EventType.ABILITY && isPullAboutToStart && event.isSourcePlayer() && !event.isAoE() && !event.isTargetPlayer()) {
            isPullAboutToStart = false;
            startTime = event.timestamp;
               pullProcessor.startPull(event.timestamp);
        }
        if (startTime !== false && event.timestamp >= startTime && event.type != netEvt.EventType.UNREAD) {
            pullProcessor.processEvent(event);
        }
    }
    return pullProcessor.result;
}
