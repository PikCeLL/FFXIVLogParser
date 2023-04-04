import * as netEvt from "./NetworkLineEvent.js";

"use strict";

/* ====ULTIMATES==== */
export const UCoB = ['UCoB',
                     '80037569',
                     [["Twintania", "Gémellia", "ツインタニア", "双塔尼亚", "트윈타니아"],
                      ["Nael Deus Darnus", "ネール・デウス・ダーナス", "奈尔·神·达纳斯", "넬 데우스 다르누스"],
                      ["Bahamut Prime", "Primo-Bahamut", "バハムート・プライム", "至尊巴哈姆特", "바하무트 프라임"],
                      ["Twintania", "Gémellia", "ツインタニア", "双塔尼亚", "트윈타니아"],
                      ["Bahamut Prime", "Primo-Bahamut", "バハムート・プライム", "至尊巴哈姆特", "바하무트 프라임"]],
                     ["Twin", "Nael", "Trios", "Adds", "Golden"]];
export const UwU = ['UWU',
                    '80037573',
                    [["Garuda", "ガルーダ", "迦楼罗", "가루다"],
                     ["Ifrit", "イフリート", "伊弗利特", "이프리트"],
                     ["Titan", "タイタン", "泰坦", "타이탄"],
                     ["The Ultima Weapon", "Ultima Arma", "アルテマウェポン", "究极神兵", "알테마 웨폰"]],
                    ["Garuda", "Ifrit", "Titan", "Ultima"]];
export const TEA = ['TEA',
                    '80037586',
                    [["Living Liquid", "Liquide Vivant", "リビングリキッド", "有生命活水", "살아있는 액체"],
                     ["Cruise Chaser", "Croiseur-chasseur", "クルーズチェイサー", "巡航驱逐者", "순항추격기"],
                     ["Alexander Prime", "Primo-Alexander", "アレキサンダー・プライム", "至尊亚历山大", "알렉산더 프라임"],
                     ["Perfect Alexander", "Alexander parfait", "パーフェクト・アレキサンダー", "完美亚历山大", "완전체 알렉산더"]],
                    ["LL", "BJCC", "Prime", "Perfect"]];
export const DSR = ['DSR',
                    '8003759A',
                    [["King Thordan", "Roi Thordan", "騎神トールダン", "骑神托尔丹", "기사신 토르당"],
                     ["Nidhogg", "ニーズヘッグ", "尼德霍格", "니드호그"],
                     ["Right Eye", "œil droit de Nidhogg", "邪竜の右眼", "邪龙的右眼", "사룡의 오른눈"],
                     ["Ser Charibert", "Sire Charibert", "聖騎士シャリベル", "圣骑士沙里贝尔", "성기사 샤리베르"],
                     ["King Thordan", "Roi Thordan", "騎神トールダン", "骑神托尔丹", "기사신 토르당"],
                     ["Hraesvelgr", "フレースヴェルグ", "赫拉斯瓦尔格", "흐레스벨그"],
                     ["Dragon-king Thordan", "Thordan le Dieu Dragon", "騎竜神トールダン", "龙威骑神托尔丹", "기룡신 토르당"]],
                    ["King Thordan", "Nidhogg", "Eyes", "Rewind!", "King Thordan II", "Dragons", "The Dragon King"]];
export const TOP = ['TOP',
                    '800375AC',
                    [["Omega", "Oméga", "オメガ"],
                     ["Omega-M", "Oméga-M", "オメガM"],
                     ["Omega", "Oméga", "オメガ"],
                     ["Omega-M", "Oméga-M", "オメガM"],
                     ["Alpha Omega", "Alpha Oméga", "アルファオメガ"]],
                    ["Omega", "M/F", "Reconfigured + Blue Screen", "Dynamis", "Alpha"]];


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
        if (this.#currentPull != null && event.type === netEvt.EventType.ABILITY && event.isSourcePlayer()) {
            if (this.#encounter[2].length > this.#currentPull[2] + 1 && this.#encounter[2][this.#currentPull[2] + 1].some(s => s.toLowerCase() == event.target.toLowerCase())) {
                ++this.#currentPull[2];
            }
        }
    }

    get result() {
        return this.#pulls;
    }
}
