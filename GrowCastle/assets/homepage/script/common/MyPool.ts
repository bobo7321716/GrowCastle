import { AbManager } from "./asssetsBundle/AbManager";
import AbRef from "./asssetsBundle/AbRef";

export default class MyPool {

    private static poolMap: Map<string, cc.NodePool> = new Map();

    public static getObj(pre: cc.Prefab): cc.Node {
        if (!pre) return null;
        let pool = this.poolMap.get(pre._uuid);
        if (pool) {
            let node = pool.get();
            if (node && cc.isValid(node)) {
                return node;
            } else {
                return cc.instantiate(pre);
            }
        } else {
            this.poolMap.set(pre._uuid, new cc.NodePool());
            return cc.instantiate(pre);
        }
    }

    public static putObj(node: cc.Node) {
        if (!node || !cc.isValid(node, true)) return;
        if (node._prefab) {
            let uuid = node._prefab.asset._uuid;
            let pool = this.poolMap.get(uuid);
            if (pool) {
                if (node._prefab.asset.refCount <= 1) {
                    node._prefab.asset.addRef();
                }
                node.removeFromParent(false);
                pool.put(node);
            } else {
                node.walk((cNode: cc.Node) => {
                    let abRef = cNode.getComponent(AbRef);
                    if (abRef) abRef.decRef();
                }, null)
                AbManager.decRef(uuid);
                node.removeFromParent(false);
                node.destroy();
            }
        } else {
            node.removeFromParent(false);
            node.destroy();
        }
    }
}
