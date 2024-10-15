import SkillConfig from "../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../role/RoleBase";
import SkillOperationBase from "./SkillOperationBase";

const { ccclass, property } = cc._decorator;

//无需玩家操作
@ccclass
export default class SkillOperation1 extends SkillOperationBase {

    operation(releaser: RoleBase, skillConfig: SkillConfig, releaseCb: () => void = null) {
        releaseCb && releaseCb();
        return this.effectBase.init(releaser, skillConfig);
    }
}
