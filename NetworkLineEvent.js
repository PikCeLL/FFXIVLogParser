"use strict";

// Resource : https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md

export const EventType = Object.freeze({
	START_CASTING: Symbol("startCast"),
	ABILITY: Symbol("ability"),
	DEATH: Symbol("death"),
    EFFECT_GAINED: Symbol("effectGain"),
    EFFECT_LOST: Symbol("effectLost"),
    INSTANCE: Symbol("instance"),
    UNREAD: Symbol("unread")
})

const RELEVENT_EVENTS = ['40000001', '40000005', '40000003', '40000010', '4000000F', '80000003'];

export class InstanceEventType {
    #id
    static INIT = new InstanceEventType('40000001');
    static WIPE = new InstanceEventType('40000005');
	static CLEAR = new InstanceEventType('40000003');
    static RESET = new InstanceEventType('40000010');
    static RESET_6_2 = new InstanceEventType('4000000F');
    static TIME_OUT = new InstanceEventType('80000003');
    static IRRELEVANT = new InstanceEventType(-1);

    constructor(id) {
        if (RELEVENT_EVENTS.includes(id)) {
            this.#id = id;
        } else {
            this.#id = -1;
        }
    }

    equals(eventType) {
        return this.#id == eventType.#id;
    }

    isReset() {
        return this.equals(InstanceEventType.RESET) || this.equals(InstanceEventType.RESET_6_2);
    }
}

const AbilityEventIndexes = Object.freeze({
	TIMESTAMP: 1,
	SOURCE_ID: 2,
	SOURCE: 3,
    ID:4,
    ABILITY: 5,
    TARGET_ID: 6,
    TARGET: 7,
    FLAGS: 8,
    DAMAGE: 9,
    TARGET_CURRENT_HP: 24,
    TARGET_MAX_HP: 25,
    TARGET_CURRENT_MP: 26,
    TAGET_MAX_MP: 27,
    TARGET_X: 30,
    TARGET_Y: 31,
    TARGET_Z: 32,
    TARGET_HEADING: 33,
    CURRENT_HP: 34,
    MAX_HP: 35,
    CURRENT_MP: 36,
    MAX_MP: 37,
    X: 40,
    Y: 41,
    Z: 42,
    HEADING: 43
})

const EffectGainedEventIndexes = Object.freeze({
	TIMESTAMP: 1,
	EFFECT_ID: 2,
	EFFECT: 3,
    DURATION:4,
    SOURCE_ID: 5,
    SOURCE: 6,
    TARGET_ID: 7,
    TARGET: 8,
    COUNT: 9,
    TARGET_HP: 10,
    HP: 11
})

const EffectLostEventIndexes = Object.freeze({
	TIMESTAMP: 1,
	EFFECT_ID: 2,
	EFFECT: 3,
    DURATION: 4,
    SOURCE_ID: 5,
    SOURCE: 6,
    TARGET_ID: 7,
    TARGET: 8,
    COUNT: 9
})

const StartCastingEventIndexes = Object.freeze({
	TIMESTAMP: 1,
	SOURCE_ID: 2,
	SOURCE: 3,
    ID:4,
    ABILITY: 5,
    TARGET_ID: 6,
    TARGET: 7,
    CAST_TIME: 8,
    X: 9,
    Y: 10,
    Z: 11,
    HEADING: 12
})

const DeathEventIndexes = Object.freeze({
	TIMESTAMP: 1,
	TARGET_ID: 2,
	TARGET: 3,
    SOURCE_ID: 4,
    SOURCE: 5
})

const InstanceEventIndexes = Object.freeze({
	TIMESTAMP: 1,
	INSTANCE: 2,
	COMMAND: 3,
    DATA0: 4,
    DATA1: 5,
    DATA2: 6,
    DATA3: 7
})

export class NetworkLineEvent {
    #type = EventType.UNREAD;
    #timestamp = new Date(9999, 12, 31);
    #source = '';
    #sourceId = '';
    #target = '';
    #targetId = '';
    #name = '';
    #instanceType = InstanceEventType.IRRELEVANT;

    constructor(line) {
        // We reduce the load as much as possible by first deciding if the line is worth reading or not
        switch (line.slice(0, 3)) {
            case '21|':
            case '22|': {
                // Ability
                this.#type = EventType.ABILITY;
                const splitLine = line.split('|');
                this.#source = splitLine[AbilityEventIndexes.SOURCE];
                this.#sourceId = splitLine[AbilityEventIndexes.SOURCE_ID];
                this.#target = splitLine[AbilityEventIndexes.TARGET];
                this.#targetId = splitLine[AbilityEventIndexes.TARGET_ID];
                this.#name = splitLine[AbilityEventIndexes.ABILITY];
                this.#timestamp = new Date(splitLine[AbilityEventIndexes.TIMESTAMP]);
            }
            break;
            case '26|': {
                // Effect Gained
                this.#type = EventType.EFFECT_GAINED;
                const splitLine = line.split('|');
                this.#source = splitLine[EffectGainedEventIndexes.SOURCE];
                this.#sourceId = splitLine[EffectGainedEventIndexes.SOURCE_ID];
                this.#target = splitLine[EffectGainedEventIndexes.TARGET];
                this.#targetId = splitLine[EffectGainedEventIndexes.TARGET_ID];
                this.#name = splitLine[EffectGainedEventIndexes.EFFECT];
                this.#timestamp = new Date(splitLine[EffectGainedEventIndexes.TIMESTAMP]);
            }
            break;
            case '30|': {
                // Effect Lost
                this.#type = EventType.EFFECT_LOST;
                const splitLine = line.split('|');
                this.#source = splitLine[EffectLostEventIndexes.SOURCE];
                this.#sourceId = splitLine[EffectLostEventIndexes.SOURCE_ID];
                this.#target = splitLine[EffectLostEventIndexes.TARGET];
                this.#targetId = splitLine[EffectLostEventIndexes.TARGET_ID];
                this.#name = splitLine[EffectLostEventIndexes.EFFECT];
                this.#timestamp = new Date(splitLine[EffectLostEventIndexes.TIMESTAMP]);
            }
            break;
            case '20|': {
                // Start Cast
                this.#type = EventType.START_CASTING;
                const splitLine = line.split('|');
                this.#source = splitLine[StartCastingEventIndexes.SOURCE];
                this.#sourceId = splitLine[StartCastingEventIndexes.SOURCE_ID];
                this.#target = splitLine[StartCastingEventIndexes.TARGET];
                this.#targetId = splitLine[StartCastingEventIndexes.TARGET_ID];
                this.#name = splitLine[StartCastingEventIndexes.ABILITY];
                this.#timestamp = new Date(splitLine[StartCastingEventIndexes.TIMESTAMP]);
            }
            break;
            case '25|': {
                // Death
                this.#type = EventType.DEATH;
                const splitLine = line.split('|');
                this.#source = splitLine[DeathEventIndexes.SOURCE];
                this.#sourceId = splitLine[DeathEventIndexes.SOURCE_ID];
                this.#target = splitLine[DeathEventIndexes.TARGET];
                this.#targetId = splitLine[DeathEventIndexes.TARGET_ID];
                this.#timestamp = new Date(splitLine[DeathEventIndexes.TIMESTAMP]);
            }
            break;
            case '33|': {
                // Instance
                const splitLine = line.split('|');
                this.#instanceType = new InstanceEventType(splitLine[InstanceEventIndexes.COMMAND]);
                if (this.#instanceType != InstanceEventType.IRRELEVANT) {
                    this.#type = EventType.INSTANCE;
                    this.#name = splitLine[InstanceEventIndexes.INSTANCE];
                    this.#timestamp = new Date(splitLine[InstanceEventIndexes.TIMESTAMP]);
                }
            }
            break;
        }
    }

    get type() {
        return this.#type;
    }

    get timestamp() {
        return this.#timestamp;
    }

    get source() {
        return this.#source;
    }

    get target() {
        return this.#target;
    }

    get name() {
        return this.#name;
    }

    get instanceType() {
        return this.#instanceType;
    }

    isSourcePlayer() {
        return this.#sourceId.startsWith('10');
    }

    isTargetPlayer() {
        return this.#targetId.startsWith('10');
    }

    isAoE() {
        return this.#targetId == "E0000000";
    }

    toString() {
        return "SOURCE = " + this.#source + "\n" +
            "SOURCEID = " + this.#sourceId + "\n" +
            "TARGET = " + this.#target + "\n" +
            "TARGETID = " + this.#targetId + "\n" +
            "NAME = " + this.#name + "\n" + 
            "TIMESTAMP = " + this.#timestamp + "\n"
    }
}