/*
 * @Author: XWL 2558913804@qq.com
 * @Date: 2024-05-18 14:21:31
 * @LastEditors: XWL 2558913804@qq.com
 * @LastEditTime: 2024-05-24 18:29:41
 * @FilePath: \tsqkd\assets\Scripts\Common\WxMenuAdaptation.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class WxMenuAdaptation extends cc.Component {

    @property(cc.Widget)
    widget: cc.Widget = null;

    protected onEnable(): void {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            const rect = wx.getMenuButtonBoundingClientRect();
            console.log("getMenuButtonBoundingClientRect = ", rect);
            let weight = this.node.getComponent(cc.Widget);
            weight.top = rect.bottom;
            weight.updateAlignment();

            wx.getSystemInfo({
                success(res) {
                    console.log(res.platform, "登录平台");
                    if (res.platform != "android") {
                        if (res.platform != "ios") {
                            console.log("PC端口登录，修改位置");
                            weight.top = 0;
                        }
                    }
                }
            })
        }
    }
}
