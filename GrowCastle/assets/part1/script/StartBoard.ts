/*
 * @Author: XWL 2558913804@qq.com
 * @Date: 2024-06-14 14:03:12
 * @LastEditors: XWL 2558913804@qq.com
 * @LastEditTime: 2024-06-18 14:32:47
 * @FilePath: \GrowCastle\assets\part1\script\StartBoard.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { BundleName } from "../../homepage/script/common/BundleName";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import { UiPath } from "../../homepage/script/common/UiPath";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StartBoard extends UiBase {

    init() {
        console.log("StartBoard")
    }

    testClick() {
        UIManager.ins.openView(UiPath.Test)
        PlayerData.ins.isPlayAudio = !PlayerData.ins.isPlayAudio;
        PlayerData.ins.saveData();
    }


}
