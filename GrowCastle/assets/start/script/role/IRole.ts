import { Global } from "../../../homepage/script/common/Global";
import { RoleBase } from "./RoleBase";

export default interface IRole extends cc.Component {

    /**初始化 */
    init(roleInfo: { roleType: Global.RoleType, roleId: number }, deathCb: (roleBase: RoleBase) => void);

    /**重置 */
    reset();

    /**受击 */
    hit(arg: { atk: number, atker: RoleBase });

    /**普攻 */
    atk(...arg);

    /**技能 */
    skill(...arg);

    /**播放动画 */
    // playAnim(animEnum: Global.RoleAnimEnum, isLoop: boolean, startCb: () => void, loopCb: () => void): Promise<any>;

    fightUpdate(dt: number);
}
