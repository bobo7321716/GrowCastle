import SkillConfig from "../../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../../role/RoleBase";
import SkillEffectBase from "./SkillEffectBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect10 extends SkillEffectBase {

    init(releaser: RoleBase, skillConfig: SkillConfig) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        this.node.stopAllActions();

        return new Promise((resolve, reject) => {
            let call = () => {
                this.colliderBaseArr.forEach((v, k) => {
                    v.init(releaser, this.skillConfig, k)
                    v.setEnable(true, 100, () => {
                        resolve(this);
                    });
                })
            }
            if (!this.effectAnim) {
                call();
            } else {
                this.effectAnim.play().then(call);
            }
        })
    }
}
