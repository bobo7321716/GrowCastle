import { BundleName } from "./BundleName";
import GamingData from "./GamingData";
import { Global } from "./Global";
import { AbManager } from "./asssetsBundle/AbManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpineAnimCol extends cc.Component {

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    private curRoleType: Global.RoleType = null;
    private curRoleId: number = null;
    private curAnimEnum: Global.RoleAnimEnum = null;

    playAnim(animEnum: Global.RoleAnimEnum, roleType: Global.RoleType, id: number, roleTimeScale: number = 1, isLoop: boolean = false, atkEventCb: () => void = null, completeCb: () => void = null) {
        // console.warn("animEnum = ", animEnum) 
        let animCall = () => {
            if (roleType == Global.RoleType.Archer || roleType == Global.RoleType.Enemy) {
                this.spine.setCompleteListener(() => {
                    atkEventCb && atkEventCb();
                    completeCb && completeCb();
                })
            } else {
                this.spine.setEventListener((event) => {
                    if (event.animation.name == animEnum) {
                        atkEventCb && atkEventCb();
                    }
                })
                this.spine.setCompleteListener(() => {
                    completeCb && completeCb();
                })
            }
            this.spine.timeScale = GamingData.fightSpeedMul * roleTimeScale;
            this.spine.loop = isLoop;
            this.spine.animation = animEnum;
        }
        return new Promise((resolve, reject) => {
            if (!animEnum) return reject();
            if (roleType == this.curRoleType && id == this.curRoleId) {
                animCall();
                resolve(null);
                return;
            }
            if (this.spine.skeletonData) AbManager.decRef(this.spine.skeletonData._uuid);
            this.spine.skeletonData = null;
            this.curRoleType = roleType;
            this.curRoleId = id;
            this.curAnimEnum = animEnum;
            let url = "anim/" + roleType + "/" + id + "/" + id;
            AbManager.loadBundleRes(BundleName.Assets, url, sp.SkeletonData).then((sp: sp.SkeletonData) => {
                this.spine.skeletonData = sp;
                animCall();
                resolve(null);
            })
        })
    }

    reset() {
        // this.spine.clearTracks(); 
        this.spine.skeletonData = null;
        this.curRoleId = null;
        this.curRoleType = null;
        this.curAnimEnum = null;
    }
} 
