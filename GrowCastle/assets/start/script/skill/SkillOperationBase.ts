import SkillConfig from "../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../role/RoleBase";
import SkillEffectBase from "./effect/SkillEffectBase";

const { ccclass, property } = cc._decorator;
//等待技能操作完成
@ccclass
export default class SkillOperationBase extends cc.Component {

    @property(SkillEffectBase)
    effectBase: SkillEffectBase = null;

    public releaser: RoleBase = null;
    public skillConfig: SkillConfig;
    /**技能释放完成回调 */
    public releaseCb: () => void = null;

    operation(releaser: RoleBase, skillConfig: SkillConfig, releaseCb: () => void = null) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        this.releaseCb = releaseCb;
        return Promise.resolve(null);
    }

    releaseFinish() {
        this.releaseCb && this.releaseCb();
        this.releaseCb = null;
    }

    fightUpdate(dt: number) {
        this.effectBase.fightUpdate(dt);
    }
}
