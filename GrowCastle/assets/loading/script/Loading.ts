import "gameassistant3"
import WX from "./WX";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    protected start(): void {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            WX.shushu();
            //特殊情况下通过如下设置可禁用SDK中的HTTP请求（如4399）
            //GA.Info.forbidHttpRequest=true
            //SDK初始化
            GA.init({
                isPreview: false,//预览模式，预览时设置为true，屏蔽部分接口或直接返回成功，如激励视频
                platform: GA.Platform.WeChat,//运行平台
                engine: GA.EngineType.CocosCreator,//开发引擎
                appId: "wx6d99da422b03da8a",//appid 无APPID的情况可联系商务或对接人员确认，发布Android和iOS原生时，该值可为任意非空字符串
                channelKey: "krq_tsqkd",//渠道关键字，可联系商务或对接人员确认
                uuid: "client_version_uuid",//每一个版本生成一个UUID，该UUID会影响GA.Info.underCheck的值
                resolution: { width: 720, height: 1280 },//设计分辨率
                sharePath: "krq_tsqkd=001",//分享路径携带渠道
                debugLog: true,
            }).then(() => {
                console.log("GA init success.");

            })
                .catch((reason) => {
                    //GA初始化或then中报错
                    console.log("GA init failed. " + reason)
                })
        }

        cc.director.loadScene("HomePage");
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.triggerGC();
        }
    }
}
