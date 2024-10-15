import MyToggleItem from "./MyToggleItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewToggleContainer extends cc.Component {
    @property([MyToggleItem])
    items: MyToggleItem[] = [];

    @property(cc.Boolean)
    isMultiple = false;

    /**自定义选择条件 */
    private customRule: (item: MyToggleItem) => boolean = null;

    get CurCheckedIdx() {
        return Array.from(this.items, (item, index) => item.checked ? index : -1).filter(el => el >= 0)
    }

    protected onLoad(): void {
        this.items.forEach(item => {
            item.onChecked = this.onCheck.bind(this);
        })
    }

    onCheck(item: MyToggleItem) {
        let index = this.items.indexOf(item);
        return this.checkByIndex(index);
    }

    checkByIndex(index: number, checkItem = false) {
        if (index < 0 || index >= this.items.length) return false;
        if (!this.isMultiple && this.items[index].checked) return false;
        if (this.customRule && !this.customRule(this.items[index])) return false;

        this.items.forEach((item, idx) => {
            if (!this.isMultiple) {
                item.checked = false
            }
            if (checkItem && index == idx) {
                item.checked = !item.checked;
                item.checkEvent?.emit([item.checkEvent.customEventData])
            }
        })
        return true;
    }

    setCustomRule(rule: (item: MyToggleItem) => boolean) {
        this.customRule = rule;
    }
}
