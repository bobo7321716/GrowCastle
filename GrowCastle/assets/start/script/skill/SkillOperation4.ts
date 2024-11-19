import { Util } from "../../../homepage/script/common/Util";
import SkillConfig from "../../../homepage/script/config/SkillConfig";
import FightManager from "../FightManager";
import { RoleBase } from "../role/RoleBase";
import SkillEffectBase from "./effect/SkillEffectBase";
import SkillOperationBase from "./SkillOperationBase";

const { ccclass, property } = cc._decorator;

//无需玩家操作,新赵云技能
@ccclass
export default class SkillOperation4 extends SkillOperationBase {

    @property(SkillEffectBase)
    private effectArr: SkillEffectBase[] = [];

    private resolve: (value: unknown) => void = null;

    operation(releaser: RoleBase, skillConfig: SkillConfig, releaseCb: () => void = null) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        releaseCb && releaseCb();
        // return new Promise((resolve, reject) => {
        //     this.resolve = resolve;
        // })
        this.effectArr.forEach(v => {
            v.node.active = false;
            v.node.setPosition(0, 0);
            v.node.angle = 0;
        })
        let wPos = this.releaser.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let lPos = this.node.parent.convertToNodeSpaceAR(wPos);
        this.node.setPosition(lPos);
        return this.createEffect().then(this.resolve);
    }

    createEffect() {
        return new Promise((resolve, reject) => {
            let skill = this.skillConfig.parameter.find(v => v[0] == 111);
            if (!skill) return resolve(null);
            let index = 0;
            this.schedule(() => {
                if (index < this.effectArr.length) {
                    let tarObj = FightManager.ins.getAtkTarget(this.releaser);
                    if (tarObj) {
                        this.effectArr[index].node.setPosition(0, 0);
                        this.effectArr[index].node.angle = 0;
                        this.effectArr[index].node.active = true;
                        let size = tarObj.target.node.getContentSize();
                        let randomPos = cc.v2(Util.getRandomFloat(-size.width / 2, size.width / 2), Util.getRandomFloat(-size.height / 2, size.height / 2));
                        let eWorldPos = tarObj.target.node.convertToWorldSpaceAR(randomPos);
                        let sWorldPos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
                        let collider = tarObj.target.node.getComponent(cc.BoxCollider);
                        if (collider) {
                            let aabb = collider.world.aabb;
                            eWorldPos = Util.getRandomPosInRect(aabb);
                        }
                        let dir = eWorldPos.sub(sWorldPos).normalize();
                        this.effectArr[index].init(this.releaser, this.skillConfig, dir);
                    }
                }
                index++;
                if (index == skill[3]) {
                    this.releaseFinish();
                    resolve(null);
                }
            }, 0.2, skill[3]);
        })
    }

    fightUpdate(dt: number) {
        this.effectArr.forEach(v => {
            v.fightUpdate(dt);
        })
    }
}
