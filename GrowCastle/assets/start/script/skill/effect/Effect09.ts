import { Util } from "../../../../homepage/script/common/Util";
import SkillConfig from "../../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../../role/RoleBase";
import AnimCol from "../AnimCol";
import SkillEffectBase from "./SkillEffectBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect09 extends SkillEffectBase {

    @property(AnimCol)
    animCol: AnimCol[] = [];

    init(releaser: RoleBase, skillConfig: SkillConfig) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        this.node.stopAllActions();
        this.node.setPosition(0, 0);
        this.animCol.forEach(v => {
            v.node.active = false;
        })

        return new Promise((resolve, reject) => {
            this.colliderBaseArr.forEach((v, k) => {
                v.init(releaser, this.skillConfig, k);
                v.setEnable(true, 100, (triggerArr: RoleBase[]) => {
                    if (triggerArr.length > 0) {
                        triggerArr = Util.randomArrOrder(triggerArr);
                        triggerArr.forEach((v, k) => {
                            if (k < this.animCol.length) {
                                this.animCol[k].node.active = true;
                                let wPos = v.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
                                let lPos = this.animCol[k].node.parent.convertToNodeSpaceAR(wPos);
                                this.animCol[k].node.setPosition(lPos);
                                this.animCol[k].play();
                                if (k == 0) {
                                    this.animCol[k].play().then(() => {
                                        resolve(this);
                                    });
                                }
                            }
                        })
                    } else {
                        resolve(this);
                    }
                });
            })
        })
    }
}
