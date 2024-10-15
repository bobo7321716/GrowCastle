import { Global } from "../../homepage/script/common/Global";
import { ArcherBase } from "./role/ArcherBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArcherPos extends cc.Component {

    @property(ArcherBase)
    archerBase: ArcherBase = null;

    @property
    order: number = 0;

    private id: number = null;
    private index: number = null;

    init(id: number, index: number) {
        return new Promise((resolve, reject) => {
            this.id = id;
            this.index = index;
            if (id > 0) {
                this.archerBase.init({ roleType: Global.RoleType.Archer, roleId: id }, null).then(resolve);
            } else {
                this.archerBase.reset();
                resolve(null);
            }
        })
    }
}
