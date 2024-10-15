import SkillConfig from "../../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../../role/RoleBase";
import AnimCol from "../AnimCol";
import SkillEffectBase from "./SkillEffectBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect01 extends SkillEffectBase {

    @property(AnimCol)
    animCol: AnimCol = null;

    init(releaser: RoleBase, skillConfig: SkillConfig) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        this.node.stopAllActions();
        this.node.setPosition(0, 0);
        return new Promise((resolve, reject) => {
            this.colliderBaseArr.forEach((v, k) => {
                v.init(releaser, this.skillConfig, k)
                v.setEnable(true, 100, () => {
                    if (this.animCol) {
                        this.animCol.play().then(() => {
                            resolve(this);
                        })
                    } else {
                        resolve(this);
                    }
                });
            })
        })
    }
}
