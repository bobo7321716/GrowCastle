import { AudioManager } from "../../../homepage/script/common/AudioManager";
import MyToggle from "../../../homepage/script/common/MyToggle";
import { UiBase } from "../../../homepage/script/common/UiBase";
import BossPage from "./BossPage";
import TerritoryPage from "./TerritoryPage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TerritoryLvUI extends UiBase {

    @property(MyToggle)
    myToggle: MyToggle = null;

    @property(TerritoryPage)
    territoryPage: TerritoryPage = null;

    @property(BossPage)
    bossPage: BossPage = null;

    private curPage: number = 0;

    init(page: number): void {
        this.myToggle.emit(page);
        this.territoryPage.init();
        this.bossPage.init();
    }

    public onOpenFinish(): void {
        super.onOpenFinish();
        this.territoryPage.openAnim();
    }

    refresh(page: number) {
        this.curPage = page;
        this.territoryPage.node.active = page == 0;
        this.bossPage.node.active = page == 1;
    }

    changePage(btn, data: string) {
        this.refresh(Number(data));
        AudioManager.ins.playClickAudio();
    }
}
