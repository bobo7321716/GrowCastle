/*
 * @Author: XWL 2558913804@qq.com
 * @Date: 2024-06-19 09:10:48
 * @LastEditors: XWL 2558913804@qq.com
 * @LastEditTime: 2024-06-19 15:41:08
 * @FilePath: \GrowCastle\assets\homepage\script\config\HeroattributeConfig.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import BaseDataManager, { BaseData, BaseRole } from "../manager/BaseData";


export default class HeroattributeConfig implements BaseRole {
    hp: number;
    mp: number;
    moveSpeed?: number;

    /**序号 */
    id: number;
    /**英雄ID */
    heroid: number;
    /**英雄名 */
    name: string;
    /**英雄等级 */
    level: number;
    /**攻击力 */
    atk: number;
    /**攻速 */
    atkSpeed: number;
    atkInterval: number;
    /**升级所需金币 */
    coin: number[];
    /**技能 */
    skill: number;
    bullet: number;
}

export class HeroattributeConfigMgr extends BaseDataManager<HeroattributeConfig> {

    getHeroattributeConfig(heroId: number, lv: number) {
        return this.datas.find(v => v.heroid == heroId && v.level == lv);
    }

    getAllConfig(heroid: number) {
        let arr: HeroattributeConfig[] = [];
        this.datas.forEach(v => {
            if (v.heroid == heroid) {
                arr.push(v);
            }
        })
        return arr;
    }
}