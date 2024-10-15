import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import { BundleName } from "../../homepage/script/common/BundleName";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MosterPrefab extends cc.Component {

    @property(sp.Skeleton)
    Boss: sp.Skeleton = null;




}
