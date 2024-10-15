
export class WorldEventManager {

    /**
     * 添加全局事件监听
     * @param type 事件类型，string
     * @param listener 事件触发后的回调方法
     * @param target 指定回调方法中的this
     */
    public static addListener(type: string, listener: any, target: any): void {
        cc.systemEvent.on(type, listener, target, false);
    }

    /**
     * 移除全局事件监听
     * @param type 事件类型，string
     * @param listener 事件触发后的回调方法
     * @param target 指定回调方法中的this
     */
    public static removeListener(type: string, listener?: any, target?: any): void {
        cc.systemEvent.off(type, listener, target);
    }

    /**
     * 触发事件
     * @param type 事件类型，string
     * @param msg 需要传入的参数，传入后在回调listener中可以获取到参数
     */
    public static triggerEvent(type: string, msg: any = null): void {
        cc.systemEvent.emit(type, msg);
    }

}