/*
 * @Author: XWL 2558913804@qq.com
 * @Date: 2024-04-28 13:58:27
 * @LastEditors: XWL 2558913804@qq.com
 * @LastEditTime: 2024-06-25 17:36:18
 * @FilePath: \tsqkd\assets\Scripts\GameConfig\BloodConfig copy.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class SignConfig implements BaseData {
    id?: number;
    /**奖励 */
    reward: { id: number, num: number }[];
}

export class SignConfigMgr extends BaseDataManager<SignConfig> {
    parse(datas: SignConfig[]): void {
        super.parse(datas);
        this._datas.forEach(data => {
            data.reward = Array.from(data.reward, el => {
                return {
                    id: el[0],
                    num: el[1],
                }
            });
        })
    }
}