import { AudioManager } from "../../../homepage/script/common/AudioManager";
import GamingData from "../../../homepage/script/common/GamingData";
import MyPool from "../../../homepage/script/common/MyPool";
import { SoundPath } from "../../../homepage/script/common/SoundPath";
import SkillConfig, { SkillConfigMgr } from "../../../homepage/script/config/SkillConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import EffectBase from "../EffectBase";
import { RoleBase } from "../role/RoleBase";
import SkillOperationBase from "./SkillOperationBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillBase extends EffectBase {

    @property(cc.Label)
    nameLab: cc.Label = null;

    @property(SkillOperationBase)
    operationBase: SkillOperationBase = null;

    @property(cc.Node)
    maskNode: cc.Node = null;

    private skillEffectArr: { name: string, isLoop: boolean }[] = [{ name: "skill_01", isLoop: false }, { name: "skill_02", isLoop: true },
    { name: "skill_05", isLoop: false }, { name: "skill_09", isLoop: false }, { name: "skill_10", isLoop: false }];

    private skillConfig: SkillConfig = null;

    init(skillId: number, releaser: RoleBase) {

        this.maskNode && (this.maskNode.active = true);
        return new Promise<EffectBase>((resolve, reject) => {
            this.skillConfig = DataManager.ins.get(SkillConfigMgr).getDataById(skillId);
            this.nameLab.string = this.skillConfig.name;
            this.operationBase.operation(releaser, this.skillConfig, () => {
                GamingData.resumeFightMul();
                this.maskNode && (this.maskNode.active = false);
                releaser.isOnSkillCd = true;
                let obj = this.skillEffectArr.find(v => v.name == this.skillConfig.icon);
                if (obj) {
                    AudioManager.ins.playEffect(SoundPath[this.skillConfig.icon + "_effect"], obj.isLoop);
                }
            }).then(() => {
                resolve && resolve(this);
                this.destroySelf();
            });
        })
    }

    fightUpdate(dt: number) {
        this.operationBase.fightUpdate(dt);
    }

    destroySelf() {
        AudioManager.ins.stopEffectByBundleData(SoundPath[this.skillConfig.icon + "_effect"]);
        MyPool.putObj(this.node);
    }
}
