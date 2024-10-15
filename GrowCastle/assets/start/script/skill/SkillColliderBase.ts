import SkillConfig from "../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../role/RoleBase";
import RoleBaseData from "../role/RoleBaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillColliderBase extends cc.Component {

    private skillConfig: SkillConfig = null;
    private releaser: RoleBase = null;
    private targetGroupArr: string[] = [];
    private collider: cc.Collider = null;
    private triggerArr: RoleBase[] = [];
    private index: number = 0;

    init(releaser: RoleBase, skillConfig: SkillConfig, index: number) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        this.index = index;
        this.targetGroupArr = RoleBaseData.getEmitTarget(this.skillConfig.parameter[index][0]) as string[];
        this.collider = this.node.getComponent(cc.Collider);
        this.collider.enabled = false;
        this.triggerArr = [];
    }

    public setEnable(isEnable: boolean, delayTime: number = 0, cb: (triggerArr: RoleBase[]) => void = null) {
        this.collider.enabled = isEnable;
        if (delayTime > 0) {
            setTimeout(() => {
                this.collider.enabled = !isEnable;
                cb && cb(this.triggerArr);
            }, delayTime);
        }
    }

    reset() {
        this.collider.enabled = false;
        this.releaser = null;
        this.skillConfig = null;
    }

    onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {
        if (other && this.targetGroupArr.includes(other.node.group)) {
            let roleBase = other.node.getComponent(RoleBase);
            if (roleBase) {
                roleBase.addEffect(this.skillConfig.parameter[this.index], this.skillConfig.type, this.releaser);
                // console.warn("获得buff ", roleBase, this.skillConfig);
                this.triggerArr.push(roleBase);
            }
        }
    }

}
