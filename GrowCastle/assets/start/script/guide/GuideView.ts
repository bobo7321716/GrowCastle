

import GamingData from "../../../homepage/script/common/GamingData";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiBase } from "../../../homepage/script/common/UiBase";
import { UiPath } from "../../../homepage/script/common/UiPath";
import GuideConfig from "../../../homepage/script/config/GuideConfig";
import GuideManager from "../../../homepage/script/manager/GuideManager";
import GuideTarget from "./GuideTarget";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideView extends UiBase {

    @property(cc.Node)
    maskNode: cc.Node = null;

    @property(cc.Button)
    guideBtn: cc.Button = null;

    @property(cc.Node)
    tipNode: cc.Node = null;

    @property(cc.Label)
    tipLab: cc.Label = null;

    @property(cc.Node)
    guideNode: cc.Node = null;

    @property(cc.Node)
    blockNode: cc.Node = null;

    showGuide(config: GuideConfig) {
        if (!config) return;
        this.guideNode.active = true;
        this.blockNode.active = false;
        this.tipNode.active = config.tips != null;
        this.tipLab.string = config.tips;
        let guideTag = config.group + "_" + config.step;
        let targetNode: cc.Node = null;
        UIManager.ins.node.walk(null, (child: cc.Node) => {
            let guideTargets = child.getComponents(GuideTarget);
            if (guideTargets.length > 0) {
                guideTargets.forEach(v => {
                    if (v.flag == guideTag && !targetNode) {
                        targetNode = child;
                    }
                })
            }
        })
        if (targetNode) {
            let wPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            let lPos = this.node.convertToNodeSpaceAR(wPos);
            this.maskNode.setPosition(lPos);
            this.guideBtn.node.setPosition(lPos);
            let size = targetNode.getContentSize();
            this.maskNode.setContentSize(size);
            this.guideBtn.node.setContentSize(size);
            this.tipNode.y = lPos.y += config.yOffset;

            let btn = targetNode.getComponent(cc.Button);
            if (btn) {
                this.guideBtn.node.active = true;
                let events = btn.clickEvents;
                let finishEvent = events.find(v => v.handler == "guideClick" && v.target == this.node);
                if (!finishEvent) {
                    let handler = new cc.Component.EventHandler();
                    handler.target = this.node;
                    handler.component = "GuideView";
                    handler.handler = "guideClick";
                    // events.push(handler);
                    events.unshift(handler);
                    this.guideBtn.clickEvents = events;
                }
            } else {
                this.guideBtn.node.active = false;
                targetNode.once(cc.Node.EventType.TOUCH_START, () => {
                    GuideManager.ins.nextStep();
                }, this);
            }
        }
    }

    showBlock() {
        this.guideNode.active = false;
        this.blockNode.active = true;
    }

    guideClick() {
        GamingData.fightSpeedMul = 1;
        GuideManager.ins.nextStep();
    }

    nextGroup() {
        GamingData.fightSpeedMul = 1;
        GuideManager.ins.jumpGuide();
    }
}
