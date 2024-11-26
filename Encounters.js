import * as netEvt from "./NetworkLineEvent.js";

"use strict";

const BOSS_NAME_PHASE = 'b';
const EFFECT_GAINED_PHASE = 'g';
const EFFECT_LOST_PHASE = 'l';
const ABILITY_PHASE = 'a';

/* ====ULTIMATES==== */
export const UCoB = ['UCoB',
                     '80037569',
                     [[BOSS_NAME_PHASE, "Twintania", "Gémellia", "ツインタニア", "双塔尼亚", "트윈타니아"],
                      [BOSS_NAME_PHASE, "Nael Deus Darnus", "ネール・デウス・ダーナス", "奈尔·神·达纳斯", "넬 데우스 다르누스"],
                      [BOSS_NAME_PHASE, "Bahamut Prime", "Primo-Bahamut", "バハムート・プライム", "至尊巴哈姆特", "바하무트 프라임"],
                      [BOSS_NAME_PHASE, "Twintania", "Gémellia", "ツインタニア", "双塔尼亚", "트윈타니아"],
                      [BOSS_NAME_PHASE, "Bahamut Prime", "Primo-Bahamut", "バハムート・プライム", "至尊巴哈姆特", "바하무트 프라임"]],
                     ["Twin", "Nael", "Trios", "Adds", "Golden"]];
export const UwU = ['UWU',
                    '80037573',
                    [[BOSS_NAME_PHASE, "Garuda", "ガルーダ", "迦楼罗", "가루다"],
                     [BOSS_NAME_PHASE, "Ifrit", "イフリート", "伊弗利特", "이프리트"],
                     [BOSS_NAME_PHASE, "Titan", "タイタン", "泰坦", "타이탄"],
                     [BOSS_NAME_PHASE, "The Ultima Weapon", "Ultima Arma", "アルテマウェポン", "究极神兵", "알테마 웨폰"]],
                    ["Garuda", "Ifrit", "Titan", "Ultima"]];
export const TEA = ['TEA',
                    '80037586',
                    [[BOSS_NAME_PHASE, "Living Liquid", "Liquide Vivant", "リビングリキッド", "有生命活水", "살아있는 액체"],
                     [BOSS_NAME_PHASE, "Cruise Chaser", "Croiseur-chasseur", "クルーズチェイサー", "巡航驱逐者", "순항추격기"],
                     [BOSS_NAME_PHASE, "Alexander Prime", "Primo-Alexander", "アレキサンダー・プライム", "至尊亚历山大", "알렉산더 프라임"],
                     [BOSS_NAME_PHASE, "Perfect Alexander", "Alexander parfait", "パーフェクト・アレキサンダー", "完美亚历山大", "완전체 알렉산더"]],
                    ["LL", "BJCC", "Prime", "Perfect"]];
export const DSR = ['DSR',
                    '8003759A',
                    [[BOSS_NAME_PHASE, "King Thordan", "Roi Thordan", "騎神トールダン", "骑神托尔丹", "기사신 토르당"],
                     [BOSS_NAME_PHASE, "Nidhogg", "ニーズヘッグ", "尼德霍格", "니드호그"],
                     [BOSS_NAME_PHASE, "Right Eye", "œil droit de Nidhogg", "邪竜の右眼", "邪龙的右眼", "사룡의 오른눈"],
                     [BOSS_NAME_PHASE, "Ser Charibert", "Sire Charibert", "聖騎士シャリベル", "圣骑士沙里贝尔", "성기사 샤리베르"],
                     [BOSS_NAME_PHASE, "King Thordan", "Roi Thordan", "騎神トールダン", "骑神托尔丹", "기사신 토르당"],
                     [BOSS_NAME_PHASE, "Hraesvelgr", "フレースヴェルグ", "赫拉斯瓦尔格", "흐레스벨그"],
                     [BOSS_NAME_PHASE, "Dragon-king Thordan", "Thordan le Dieu Dragon", "騎竜神トールダン", "龙威骑神托尔丹", "기룡신 토르당"]],
                    ["King Thordan", "Nidhogg", "Eyes", "Rewind!", "King Thordan II", "Dragons", "The Dragon King"]];
export const TOP = ['TOP',
                    '800375AC',
                    [[BOSS_NAME_PHASE, "Omega", "Oméga", "オメガ"],
                     [EFFECT_GAINED_PHASE, "Omega-M", "Oméga-M", "オメガM"], // The bosses are still named Omega in the log, but gain a M/F buff
                     [ABILITY_PHASE, "Colossal Blow", "Coup colossal"], // Happens somewhere during the transition, from an arm
                     [ABILITY_PHASE, "Wave Cannon", "Canon plasma"], // First cast after getting back up, still a few seconds late, might need another trigger
                     [BOSS_NAME_PHASE, "Omega-M", "Oméga-M", "オメガM"],
                     [BOSS_NAME_PHASE, "Alpha-Omega", "Alpha-Oméga", "アルファオメガ"]],
                    ["Omega", "M/F", "Reconfigured", "Blue Screen", "Dynamis", "Alpha"]];
export const FRU = ['FRU',
                    '800375BF',
                    [[BOSS_NAME_PHASE, "Fatebreaker"],
                     [BOSS_NAME_PHASE, "Usurper of Frost"]],
                    ["Fatebreaker", "Shiva"]];


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
        if (fightID === this.#encounter[1]) {
            this.#currentPull = [new Date(9999, 12, 31), 0, 0, false];
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
        if (this.#currentPull != null && (endTime > this.#currentPull[0])) {
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
        if (this.#currentPull != null && (endTime > this.#currentPull[0])) {
            this.#currentPull[3] = true;
            this.wipePull(endTime);
        }
    }

    /**
     * Processes an event
     * @param {netEvt.NetworkLineEvent} event 
     */
    processEvent(event) {
        if (this.#currentPull != null && this.#encounter[2].length > this.#currentPull[2] + 1) {
            switch (this.#encounter[2][this.#currentPull[2] + 1][0]) {
                case ABILITY_PHASE:
                    if (event.type === netEvt.EventType.ABILITY && !event.isSourcePlayer()) {
                        if (this.#encounter[2][this.#currentPull[2] + 1].some(s => s.toLowerCase() == event.name.toLowerCase())) {
                            ++this.#currentPull[2];
                        }
                    }
                    break;
                case EFFECT_GAINED_PHASE:
                    if (event.type === netEvt.EventType.EFFECT_GAINED && !event.isSourcePlayer() && !event.isTargetPlayer()) {
                        if (this.#encounter[2][this.#currentPull[2] + 1].some(s => s.toLowerCase() == event.name.toLowerCase())) {
                            ++this.#currentPull[2];
                        }
                    }
                    break
                case EFFECT_LOST_PHASE:
                    if (event.type === netEvt.EventType.EFFECT_LOST && !event.isSourcePlayer() && !event.isTargetPlayer()) {
                        if (this.#encounter[2][this.#currentPull[2] + 1].some(s => s.toLowerCase() == event.name.toLowerCase())) {
                            ++this.#currentPull[2];
                        }
                    }
                    break;
                case BOSS_NAME_PHASE:
                default:
                    if (event.type === netEvt.EventType.ABILITY && event.isSourcePlayer()) {
                        if (this.#encounter[2][this.#currentPull[2] + 1].some(s => s.toLowerCase() == event.target.toLowerCase())) {
                            ++this.#currentPull[2];
                        }
                    }
            }
        }
    }

    get result() {
        return this.#pulls;
    }
}
