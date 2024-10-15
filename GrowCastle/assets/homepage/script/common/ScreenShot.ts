
const { ccclass, property } = cc._decorator;

@ccclass
export default class ScreenShot extends cc.Component {

    @property(cc.Camera)
    camera: cc.Camera = null;

    public shotNode: cc.Node = null;
    public shotTexture2D: cc.Texture2D = null;

    public shot() {
        return new Promise((resolve, reject) => {
            let texture = new cc.RenderTexture();
            texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height, cc["gfx"].RB_FMT_D24S8);//RB_FMT_D24S8 RB_FMT_S8
            this.camera.targetTexture = texture;
            this.camera.enabled = true;
            this.scheduleOnce(() => {
                let data = texture.readPixels();
                let picData = this.filpYImage(data, texture.width, texture.height);
                let shotTexture2D = new cc.Texture2D();
                shotTexture2D.initWithData(picData, 32, texture.width, texture.height);
                this.camera.enabled = false;
                resolve(shotTexture2D);
            }, 0)
        })
    }

    filpYImage(data, width, height) {
        // create the data array
        let picData = new Uint8Array(width * height * 4);
        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let srow = height - 1 - row;
            let start = srow * width * 4;
            let reStart = row * width * 4;
            // save the piexls data
            for (let i = 0; i < rowBytes; i++) {

                // 透明度修正
                if (i % 4 == 3) {
                    data[start + i] = Math.round(Math.sqrt(data[start + i] / 255) * 255)
                    if (data[start + i] > 220) {
                        data[start + i] = 255;
                    }
                }

                picData[reStart + i] = data[start + i];
            }
        }
        return picData;
    }

    public shot2() {
        return new Promise((resolve, reject) => {
            let texture = new cc.RenderTexture();

            texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height, cc["gfx"].RB_FMT_D24S8);
            this.camera.targetTexture = texture;
            this.camera.enabled = true;
            this.scheduleOnce(() => {
                this.camera.enabled = false;
                resolve(texture);
            }, 0)
        })
    }
}
