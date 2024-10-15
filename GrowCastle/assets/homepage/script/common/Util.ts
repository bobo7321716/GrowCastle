
export class Util {

    /**
 * 将字符串转换为一维数组
 * @param str 目标字符串
 * @param sep 分隔符 默认为","
 */
    static convertStrToArr<T = any>(str: string, sep = ",") {
        if (!str) return [];
        let arr = [];
        let subStrArr = str.split(sep);
        subStrArr.forEach(subStr => {
            if (Number(subStr) !== undefined) {
                arr.push(subStr);
            } else {
                arr.push(subStr);
            }
        })
        return arr as T[];
    }

    public static getWorldPosition(node: cc.Node): cc.Vec2 {
        if (!node) {
            return;
        }

        let parent = node.getParent();
        if (!parent) {
            return node.getPosition();
        }

        return parent.convertToWorldSpaceAR(node.getPosition());
    }

    public static getWorldSize(node: cc.Node): cc.Size {
        let size = node.getContentSize();
        size.height *= node.scale;
        size.width *= node.scale;
        let parent = node.getParent();
        while (parent) {
            size.height *= parent.scale;
            size.width *= parent.scale;
            parent = parent.getParent();
        }
        return size;
    }

    public static setWorldSize(node: cc.Node, size: cc.Size): void {
        node.setContentSize(size);
        size.height /= node.scale;
        size.width /= node.scale;
        let parent = node.getParent();
        while (parent) {
            node.width /= parent.scale;
            node.height /= parent.scale;
            parent = parent.getParent();
        }
    }

    public static getWorldScale(node: cc.Node): number {
        let scale = node.scale;
        let parent = node.getParent();
        while (parent) {
            scale *= parent.scale;
            parent = parent.getParent();
        }
        return scale;
    }

    public static setWorldPosition(node: cc.Node, worldPos: cc.Vec2): void {
        if (!node) {
            return;
        }

        if (!worldPos) {
            return;
        }

        let parent = node.getParent()
        if (!parent) {
            node.setPosition(worldPos)
            return;
        }

        let localPos = parent.convertToNodeSpaceAR(worldPos);
        node.setPosition(localPos);
    }

    public static getWorldRotation(node: cc.Node): number {
        let rot = node.rotation;
        let parent = node.getParent();
        while (parent) {
            rot += parent.rotation;
            parent = parent.getParent();
        }
        return rot;
    }

    public static getWorldRotationWithRot(parent: cc.Node, localRot: number): number {
        let rot = localRot;
        while (parent) {
            rot += parent.rotation;
            parent = parent.getParent();
        }
        return rot;
    }

    public static getLocalRotation(targetNode: cc.Node, worldRot: number): number {
        let rot = worldRot;
        let parent = targetNode.getParent();
        while (parent) {
            rot -= parent.rotation;
            parent = parent.getParent();
        }
        return rot;
    }

    public static setWorldRotation(node: cc.Node, worldRot: number): void {
        node.rotation = worldRot;
        let parent = node.getParent();
        while (parent) {
            node.rotation -= parent.rotation;
            parent = parent.getParent();
        }
    }

    public static distance(a: cc.Vec2, b: cc.Vec2): number {
        if (!a || !b) {
            return;
        }
        let vec = new cc.Vec2(a.x - b.x, a.y - b.y);
        return vec.mag();
    }

    public static vec(start: cc.Node, end: cc.Node): cc.Vec2 {
        if (!start || !end) {
            return;
        }
        let a = this.getWorldPosition(start);
        let b = this.getWorldPosition(end);
        return new cc.Vec2(b.x - a.x, b.y - a.y);
    }

    //角度转向量
    public static degreesToVectors(degree) {
        let radian = cc.misc.degreesToRadians(degree);
        let comVec = cc.v2(0, 1);
        let dirVec = comVec.rotate(-radian);
        return dirVec;
    }

    //向量转角度
    public static vectorsToDegress(dirVec: cc.Vec2) {
        let comVec = cc.v2(0, 1);
        let radian = dirVec.normalize().signAngle(comVec);
        let degree = cc.misc.radiansToDegrees(radian);
        return degree;
    }

    /**向量转弧度 */
    public static vectorToRadian(dirVec: cc.Vec2) {
        return dirVec.normalize().signAngle(cc.v2(0, 1));
    }

    //求两向量夹角
    public static getDegreeByVec(vec1: cc.Vec2, vec2: cc.Vec2): number {
        let radian = vec1.normalize().signAngle(vec2.normalize());
        let degree = cc.misc.radiansToDegrees(radian);
        if (degree < -90) {
            degree = -90 - (90 + degree);
        }
        if (degree > 90) {
            degree = 180 - degree;
        }
        return degree;
    }

    /**
     * 
     * @param a 起点
     * @param b 终点
     */
    public static vector(a: cc.Vec2, b: cc.Vec2): cc.Vec2 {
        if (!a || !b) {
            return cc.Vec2.UP;
        }
        let vector = new cc.Vec2();
        vector.x = b.x - a.x;
        vector.y = b.y - a.y;

        return vector;
    }

    public static readonly xMin = 0;
    public static readonly yMin = 0;
    public static readonly xMax = 3120;
    public static readonly yMax = 3120;

    // public static clampPosition(position: cc.Vec2, radius: number): cc.Vec2 {
    //     let x = cc.misc.clampf(position.x, this.xMin + radius, this.xMax - radius);
    //     let y = cc.misc.clampf(position.y, this.yMin + radius, this.yMax - radius);
    //     return cc.v2(x, y);
    // }

    public static caculateRadius(c: number, minRadius: number, maxRadius: number): number {
        let r = c / (2 * Math.PI);
        return cc.misc.clampf(r, minRadius, maxRadius);
    }

    /**
     * 取得开始值和结束值之间的插值
     * @param num 0-1 表示从开始值到结束值之间的比例
     * @param startValue 开始值
     * @param endValue 结束值
     */
    public static lerp(num: number, startValue: number | cc.Vec2 | cc.Color, endValue: number | cc.Vec2 | cc.Color): number | cc.Vec2 | cc.Color {
        num = cc.misc.clampf(num, 0, 1);
        if (typeof startValue == "number" && typeof endValue == "number") {
            let result = startValue + (endValue - startValue) * num;
            return result;
        }
        else if ((startValue instanceof cc.Vec2 || startValue instanceof cc.Vec3) && (endValue instanceof cc.Vec2 || endValue instanceof cc.Vec3)) {
            let start = startValue as cc.Vec2;
            let end = endValue as cc.Vec2;
            let x = this.lerp(num, start.x, end.x) as number;
            let y = this.lerp(num, start.y, end.y) as number;
            let result = cc.v2(x, y);
            return result;
        }
        else if (startValue instanceof cc.Color && endValue instanceof cc.Color) {
            let start = startValue as cc.Color;
            let end = endValue as cc.Color;
            let r = this.lerp(num, start.getR(), end.getR()) as number;
            let g = this.lerp(num, start.getG(), end.getG()) as number;
            let b = this.lerp(num, start.getB(), end.getB()) as number;
            let a = this.lerp(num, start.getA(), end.getA()) as number;
            let result = cc.color(r, g, b, a);
            return result;
        }
    }

    public static getRandomInt(min: number, max: number): number {
        if (min > max) {
            let temp = min;
            min = max;
            max = temp;
        }
        return Math.floor(Math.random() * (max - min) + min);
    }

    public static getRandomFloat(min: number, max: number): number {
        if (min > max) {
            let temp = min;
            min = max;
            max = temp;
        }
        return Math.random() * (max - min) + min;
    }

    /**
     * 超长字符用’...‘替代
     * @param str 
     * @param maxLen 
     */
    static subString(str: string, maxLen: number = 10, suffix = '...') {
        let len = this.getLength(str);

        let l = 0, i = 0;
        let a = str.split("");
        for (i = 0; i < a.length; i++) {
            if (a[i].charCodeAt(0) < 299) {
                l++;
                if (l > maxLen) {
                    l = l - 1;
                    break;
                }
            } else {
                l += 2;
                if (l > maxLen) {
                    l = l - 2;
                    break;
                }
            }
        }
        return str.substr(0, i) + (len > maxLen ? suffix : '');
    }

    static getLength(str: string) {
        let n_str = new String(str);
        let bytesCount = 0;
        for (let i = 0, n = n_str.length; i < n; i++) {
            let c = n_str.charCodeAt(i);
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                bytesCount += 1;
            } else {
                bytesCount += 2;
            }
        }
        return bytesCount;
    }

    /**
     * 分隔符分割字符串
     * @param str 
     * @param sep 
     * @param len 
     */
    static formatString(str: string | number, sep: string = ',', len: number = 3) {
        str = str.toString();
        let strLen = str.length;
        let newStr = str;
        for (let i = strLen - len; i > 0; i -= len) {
            let left = str.substring(0, i);
            let right = str.substring(i);
            newStr = left + sep + right;
            strLen = str.length;
            str = newStr;
        }
        return newStr
    }

    /**字符串分割为数组 */
    static stringToArray(str, sep = ';'): Array<any> {
        if (!str) return [];
        let new_list = [];
        let list = str.replace(' ', '').split(sep);
        list.forEach(key => {
            if (key != null && key !== undefined && key != '') {
                if (!isNaN(Number(key))) {
                    key = Number(key);
                }
                new_list.push(key);
            }
        });
        return new_list;
    }

    /**删除字符串左右空格 */
    static trim(str: string) {
        if (typeof str !== 'string') return str;
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    /**
     * 转换秒数时间为标准样式
     */
    public static convertTimeToStandStyle(second: number): string {
        let sec = second % 60;
        second -= sec;
        let min = second / 60;
        let minN = min % 60;
        min -= minN;
        let hour = min / 60;

        return (hour > 0 ? (hour + ":") : "") +
            (minN > 0 ? (minN >= 10 ? minN : "0" + minN) : "00") + ":" +
            (sec > 0 ? (sec >= 10 ? sec : "0" + sec) : "00");
    }

    /**将秒转为 [时，分,秒] */
    public static convertTimeToStandStyle2(second: number): number[] {
        let hour = second >= 3600 ? Math.floor(second / 3600) : 0;
        second -= hour * 3600;
        let min = second >= 60 ? Math.floor(second / 60) : 0;
        second -= min * 60;
        let sec = second;
        return [hour, min, sec];
    }


    public static formatData(time: string | number = null) {
        if (!time) time = Date.now();
        const date = new Date(time)
        const y = date.getFullYear()
        let m: string | number = date.getMonth() + 1
        m = m < 10 ? `0${String(m)}` : m
        let d: string | number = date.getDate()
        d = d < 10 ? `0${String(d)}` : d
        let h: string | number = date.getHours()
        h = h < 10 ? `0${String(h)}` : h
        let minute: string | number = date.getMinutes()
        minute = minute < 10 ? `0${String(minute)}` : minute
        let second: string | number = date.getSeconds()
        second = second < 10 ? `0${String(second)}` : second
        // return `${String(y)}-${String(m)}-${String(d)}   ${String(h)}:${String(
        //     minute
        // )}:${String(second)}`
        return `${String(y)}/${String(m)}/${String(d)} ${String(h)}:${String(
            minute
        )}`
    }


    /**检查数组中是否有相同vec */
    public static checkSameVec(vecArr: cc.Vec2[], vec: cc.Vec2) {
        if (vecArr.length <= 0) {
            return false;
        }
        for (let i = 0; i < vecArr.length; i++) {
            if (vecArr[i].x == vec.x && vecArr[i].y == vec.y) {
                return true;
            }
        }
        return false;
    }

    /**从数组中随机取值 */
    public static getRandomValue<T>(arr: T[]) {
        let index = Math.floor(Math.random() * arr.length);
        return { value: arr[index], key: index };
    }

    /**copy数组 */
    public static copyArr<T>(arr: T[]): T[] {
        if (arr.length <= 0) {
            return [];
        }
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
            newArr.push(arr[i]);
        }
        return newArr;
    }

    /**随机打乱数组顺序 */
    public static randomArrOrder(arr) {
        let i = arr.length;
        while (i) {
            let j = Math.floor(Math.random() * i--);
            [arr[j], arr[i]] = [arr[i], arr[j]];
        }
        return arr;
    }

    /**获取两数组的不同值 */
    public static getArrDifference(arr1, arr2): any[] {
        return arr1.concat(arr2).filter(function (v, i, arr) {
            return arr.indexOf(v) === arr.lastIndexOf(v);
        });
    }

    /**获取两数组相同值 */
    public static getArrSame(arr1, arr2) {
        return arr1.filter(item => {
            let idList = arr2.map(val => val.name)
            return idList.indexOf(item.name) != -1
        })
    }

    /**限制取值范围 */
    public static clampValue(val: number, min: number, max: number) {
        if (min == max) {
            return min;
        }
        if (min > max) {
            let temp = min;
            min = max;
            max = temp;
        }
        return val < min ? min : val > max ? max : val;
    }

    /**检查vec数组中是否有值与vec相等 不考虑顺序 */
    public static checkSameVecNoOrder(vecArr: cc.Vec2[], vec: cc.Vec2) {
        if (vecArr.length <= 0) {
            return false;
        }
        for (let i = 0; i < vecArr.length; i++) {
            if ((vecArr[i].x == vec.x && vecArr[i].y == vec.y) || (vecArr[i].x == vec.y && vecArr[i].y == vec.x)) {
                return true;
            }
        }
        return false;
    }

    /**检查两个向量是否相等 */
    public static checkVecIsSame(vec1: cc.Vec2, vec2: cc.Vec2) {
        return vec1.x == vec2.x && vec1.y == vec2.y;
    }

    /**
     * !#en Test line and line
     * !#zh 测试线段与线段是否相交
     * @method lineLine
     * @param {Vec2} a1 - The start point of the first line
     * @param {Vec2} a2 - The end point of the first line
     * @param {Vec2} b1 - The start point of the second line
     * @param {Vec2} b2 - The end point of the second line
     * @return {boolean}
     */
    public static checkLineIntersect(a1: cc.Vec2, a2: cc.Vec2, b1: cc.Vec2, b2: cc.Vec2) {

        var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
        var u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

        if (u_b !== 0) {
            var ua = ua_t / u_b;
            var ub = ub_t / u_b;

            if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                return true;
            }
        }

        return false;
    }

    /**将字符串数组转为number数组 */
    public static changeStrArrToNumArr(strArr: string[]): number[] {
        let numArr = [];
        for (let i = 0; i < strArr.length; i++) {
            numArr.push(Number(strArr[i]));
        }
        return numArr;
    }

    /**获取一个num数组中的最大值 */
    public static getMaxNumInNumArr(arr: number[]): number {
        return arr.sort().reverse()[0];
    }

    /**克隆一个字符串 */
    public static copyStr(str: string): string {
        let newStr = "";
        for (let i = 0; i < str.length; i++) {
            newStr += str[i];
        }
        return newStr;
    }

    /**
 * 遍历执行//遍历某个节点的所有子节点包括自己，并可执行设置的操作
 * @param tarNode 遍历的根结点
 * @param execute 每个节点执行的操作
 */
    public static TraversalExecute(tarNode: cc.Node, execute: (selfNode: cc.Node) => void): void {
        execute(tarNode);
        tarNode.children.forEach((value) => {
            this.TraversalExecute(value, execute);
        });
    }

    /**检查当前值是否在目标值允许误差范围内 */
    public static checkValueRandom(value: number, tarVal: number, error: number) {
        return value >= tarVal - error && value <= tarVal + error;
    }

    /**判断两个多边形碰撞器是否相交 */
    public static polygonPolygonTest(polygon1: cc.PolygonCollider, polygon2: cc.PolygonCollider) {
        if (!polygon1 || !polygon2) {
            return false;
        }
        if (!polygon1.node.active || !polygon2.node.active) {
            return false;
        }
        let points1: cc.Vec2[] = [];
        for (let i = 0; i < polygon1.points.length; i++) {
            let pos = polygon1.node.convertToWorldSpaceAR(polygon1.points[i]);
            points1.push(pos);
        }
        let points2: cc.Vec2[] = [];
        for (let i = 0; i < polygon2.points.length; i++) {
            let pos = polygon2.node.convertToWorldSpaceAR(polygon2.points[i]);
            points2.push(pos);
        }
        return cc.Intersection.polygonPolygon(points1, points2);
    }

    /**判断两个多边形碰撞器是否有接触 部分相交返回true，完全包含，完全无接触返回false
     */
    public static linePolygonTest(polygon1: cc.PolygonCollider, polygon2: cc.PolygonCollider) {
        if (!polygon1 || !polygon2) {
            return false;
        }
        if (!polygon1.node.active || !polygon2.node.active) {
            return false;
        }
        for (let i = 0; i < polygon2.points.length; i++) {
            let vec = polygon2.points[i];
            let a1 = polygon2.node.convertToWorldSpaceAR(vec);
            a1 = polygon1.node.convertToNodeSpaceAR(a1);
            let a2 = null;
            if (i < polygon2.points.length - 1) {
                a2 = polygon2.node.convertToWorldSpaceAR(polygon2.points[i + 1]);
            } else {
                a2 = polygon2.node.convertToWorldSpaceAR(polygon2.points[0]);
            }
            a2 = polygon1.node.convertToNodeSpaceAR(a2);
            let isCollider = cc.Intersection.linePolygon(a1, a2, polygon1.points);
            if (isCollider) {
                return true;
            }
        }
        return false;
    }

    /**测试一个世界坐标系的点是否在多边形碰撞器内 */
    static polygonHitTest(polyCol: cc.PolygonCollider, touchPos: cc.Vec2) {
        touchPos = polyCol.node.convertToNodeSpaceAR(touchPos);
        return cc.Intersection.pointInPolygon(touchPos, polyCol.points);
    }

    /**判断两个线段是否相交，如果相交 返回两个线段的交点
     * @param {Vec2} a - The start point of the first line
     * @param {Vec2} b - The end point of the first line
     * @param {Vec2} c - The start point of the second line
     * @param {Vec2} d - The end point of the second line
     * @return {boolean}
     */
    static segmentsIntr(a: cc.Vec2, b: cc.Vec2, c: cc.Vec2, d: cc.Vec2) {

        /** 1 解线性方程组, 求线段交点. **/
        // 如果分母为0 则平行或共线, 不相交  
        var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator == 0) {
            return false;
        }

        // 线段所在直线的交点坐标 (x , y)      
        var x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
            + (b.y - a.y) * (d.x - c.x) * a.x
            - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
        var y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
            + (b.x - a.x) * (d.y - c.y) * a.y
            - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;

        /** 2 判断交点是否在两条线段上 **/
        if (
            // 交点在线段1上  
            (x - a.x) * (x - b.x) <= 0 && (y - a.y) * (y - b.y) <= 0
            // 且交点也在线段2上  
            && (x - c.x) * (x - d.x) <= 0 && (y - c.y) * (y - d.y) <= 0
        ) {
            // 返回交点p  
            return cc.v2(x, y);
        }
        //否则不相交  
        return false;
    }

    /**屏幕适配，返回界面缩放比例 */
    public static sceneAdaptation() {
        let frameSize = cc.view.getVisibleSize();
        let canvasSize = cc.view.getDesignResolutionSize();
        console.log("frameSize = ", frameSize);
        console.log("canvasSize = ", canvasSize);
        console.log(cc.view.getCanvasSize())
        let aspectRatio = frameSize.width / frameSize.height;
        console.log("aspectRatio = ", aspectRatio)
        let adapScale = 1;
        let canvasAr = canvasSize.width / canvasSize.height;
        if (canvasAr < 1) {
            let scale = canvasSize.height / frameSize.height;
            adapScale = canvasSize.width / (frameSize.width * scale);
            adapScale = adapScale > 1 ? 1 : adapScale;
            // if (aspectRatio > 0.5625) {
            //     adapScale *= (aspectRatio / 0.5625);
            // }
            console.log("竖屏 ", adapScale);
        } else {
            canvasAr = canvasSize.height / canvasSize.width;
            let scale = canvasSize.width / frameSize.width;
            adapScale = canvasSize.height / (frameSize.height * scale);
            console.log("横屏 ", adapScale);
        }
        return adapScale;
    }

    /**
* 从数组中删除一个元素
* @param array 数组
* @param element 需要删除的元素
*/
    public static deleteElement<T>(array: T[], element: T): T[] {
        let index = array.indexOf(element);
        if (index >= 0) {
            array.splice(index, 1);
            // console.log("移除TimeManager 监听成功 ", element)
        }
        return array;
    }

    /**
* 从数组中删除一组元素
* @param array 数组
* @param element 需要删除的元素组
*/
    public static deleteElements<T>(array: T[], deleteArray: T[]): T[] {
        if (array == null || deleteArray == null) {
            return;
        }
        deleteArray.forEach((value) => {
            this.deleteElement(array, value);
        });
        return array;
    }

    public static deleteElementByRule<T>(array: T[], targetOrder: (a: T) => boolean): T[] {
        return Util.deleteElement<T>(array, Util.find<T>(array, targetOrder));
    }

    public static deleteElementsByRule<T>(array: T[], targetOrder: (a: T) => boolean): T[] {
        return Util.deleteElements<T>(array, array.filter(a => targetOrder(a)));
    }

    /**
    * 寻找数组中的第一个符合条件的元素
    * @param array 
    * @param preciate 
    */
    public static find<T>(array: T[], preciate: (a: T) => boolean): T {
        if (array == null || array.length == 0) {
            return null;
        }
        if (preciate == null) {
            return array[0];
        }
        let result = null;
        for (let i = 0; i < array.length; i++) {
            if (preciate(array[i])) {
                result = array[i];
                break;
            }
        }
        return result;
    }

    /**获取一组随机数 */
    public static getRandomNum(numLength: number): number {
        let num = "";
        for (let i = 0; i < numLength; i++) {
            num += this.getRandomInt(0, 9);
        }
        return Number(num);
    }

    /**
     * 是否是以后的天数
     * @param lastTime 上次时间
     * @param curTime 当前时间
     */
    public static isNextDay(lastTime: number, curTime: number): boolean {
        if (lastTime > curTime) {
            return false
        }
        else if (curTime - lastTime >= 24 * 60 * 60 * 1000) {
            return true;
        } else {
            let lastDate = new Date(lastTime);
            let curDate = new Date(curTime);
            return lastDate.getDay() != curDate.getDay();
        }
    }

    /**
     * 是否是以后的周
     * @param lastTime 上次时间
     * @param curTime 当前时间
     */
    public static isNextWeek(lastTime: number, curTime: number): boolean {
        if (lastTime > curTime) {
            return false
        }
        else if (curTime - lastTime >= 24 * 60 * 60 * 1000 * 7) {
            return true;
        } else {
            let lastDate = new Date(lastTime);
            let curDate = new Date(curTime);
            return curDate.getDay() < lastDate.getDay() || (curDate.getDay() == lastDate.getDay() && curTime - lastTime > 24 * 60 * 60 * 1000);
        }
    }

    public static getAllEnumNums(enumType: any): number[] {
        let objs: number[] = [];
        for (let de in enumType) {
            if (!isNaN(parseInt(de))) {
                objs.push(parseInt(de));
            }
        }
        return objs;
    }

    /**获取枚举的value数组 */
    public static getAllEnumValues(enumType: any): any[] {
        let objs: any[] = [];
        for (const key in enumType) {
            objs.push(enumType[key]);
        }
        return objs;
    }

    public static getAllEnumKeys(enumType: any): any[] {
        let objs: any[] = [];
        for (const key in enumType) {
            if (isNaN(Number(key))) {
                objs.push(key);
            }
        }
        return objs;
    }

    /**获取一个随机枚举 */
    public static getRandomEnum<T>(enumType: T) {
        let strs: string[] = [];
        for (const key in enumType) {
            strs.push(key);
        }
        this.randomArrOrder(strs);
        return enumType[strs[0]];
    }

    /**根据权重随机取值 */
    public static getRandomEleInWeight<T>(objs: [T, number][]): T {
        if (objs == null || objs.length == 0) {
            return null;
        }
        let allWeight = 0;
        let curWeight = 0;
        let objsProb: [T, number, number][] = [];
        objs.forEach((value) => {
            allWeight += value[1];
            objsProb.push([value[0], curWeight, curWeight + value[1]]);
            curWeight += value[1];
        });
        let rand = Math.random() * allWeight;
        for (let i = 0; i < objsProb.length; i++) {
            if (rand > objsProb[i][1] && rand <= objsProb[i][2]) {
                return objsProb[i][0];
            }
        }
        return null;
    }

    /**获取矩形范围内随机一点 */
    static getRandomPosInRect(rect: cc.Rect) {
        return cc.v2(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height);
    }

    /**添加一个子节点并添加脚本 */
    public static addComponentNode(paNode: cc.Node, className: string) {
        let node = new cc.Node(className);
        node.parent = paNode;
        let classSrc = node.addComponent(className);
        return classSrc;
    }

    /**根据对象的value获取key */
    public static getObjKeyByValue<T, U extends T[keyof T]>(
        record: T,
        value: U
    ): keyof T | undefined {
        return (Object.keys(record) as Array<keyof T>).find(k => {
            return record[k] === value
        }
        );
    }

    /**屏幕震动效果 */
    public static shakeAnim(node: cc.Node, loopTimes: number = 1): Promise<any> {
        return new Promise((resolve, reject) => {
            node.stopAllActions();
            cc.tween(node)
                .to(0.02, { position: cc.v3(5, 7) })
                .to(0.02, { position: cc.v3(-6, 7) })
                .to(0.02, { position: cc.v3(-13, 3) })
                .to(0.02, { position: cc.v3(3, -6) })
                .to(0.02, { position: cc.v3(-5, 5) })
                .to(0.02, { position: cc.v3(2, -8) })
                .to(0.02, { position: cc.v3(-8, 10) })
                .to(0.02, { position: cc.v3(3, 10) })
                .to(0.02, { position: cc.v3(0, 0) })
                .union()
                .repeat(loopTimes)
                .call(() => {
                    resolve(null);
                })
                .start()
        })
    }

    /**将富文本替换成可使用打字机效果显示的文本数组2 */
    public static richTextTypewrite(str: string) {
        let charArr = str.replace(/<.+?\/?>/g, '').split('');
        let tempStrArr = [str];

        for (let i = charArr.length; i > 1; i--) {
            let curStr = tempStrArr[charArr.length - i];
            let lastIdx = curStr.lastIndexOf(charArr[i - 1]);
            let prevStr = curStr.slice(0, lastIdx);
            let nextStr = curStr.slice(lastIdx + 1, curStr.length);
            tempStrArr.push(prevStr + nextStr);
        }
        tempStrArr = tempStrArr.reverse();
        // console.log(tempStrArr)
        return tempStrArr;
    }


    /**将富文本替换成可使用打字机效果显示的文本数组 性能较差*/
    public static replaceRichText(str: string) {
        const regex = /<.+?\/?>/g; // 匹配尖括号标签
        const matchArr = str.match(regex);
        const specialChar = "│";
        const replaceStr = str.replace(regex, specialChar); // 标签数组
        const textArr: string[] = replaceStr.split(specialChar); // 文字数组
        const strArr: string[] = []; // 存放处理过的文字数组
        let paraNum = 0; // 待替换参数个数
        for (let text of textArr) {
            // 非空字符替换成类似 $[0-n] 参数
            if (text !== "") {
                text = `$[${paraNum}]`;
                paraNum += 1;
            }
            strArr.push(text);
        }
        let templetStr: string = strArr.join(specialChar); // 数组转成待替换字符串
        for (let index = 0; index < textArr.length; index++) {
            // 转换代替换字符串之后, 删除文字数组多余空字符
            if (textArr[index] === "") {
                textArr.splice(index, 1);
                index = index - 1;
            }
        }
        while (templetStr.search(specialChar) !== -1) {
            // 数组转成的字符串原本 '特殊字符' 位置都是富文本标签的位置, 替换回标签
            if (matchArr[0]) {
                templetStr = templetStr.replace(specialChar, matchArr[0].toString());
                matchArr.splice(0, 1);
            } else {
                templetStr = templetStr.replace(specialChar, "");// 空字符串替换,防止死循环
                console.warn("matchArr not enough");
            }
        }
        const lastStrArr: string[] = []; // 转换后富文本数组
        const arrayParm: string[] = new Array(paraNum).fill(""); // 替换参数数组
        for (let i = 0; i < textArr.length; i++) {
            for (const text of textArr[i]) {
                arrayParm[i] = arrayParm[i] + text;
                let replaceStr1 = templetStr;
                for (let index = 0; index < paraNum; index++) {
                    replaceStr1 = replaceStr1.replace(`$[${index}]`, arrayParm[index]);
                }
                lastStrArr.push(replaceStr1);
            }
        }
        return lastStrArr;
    }

    /**
     * 格式化时间戳
     * @param date Date
     * @param fmt 格式，默认 yyyy/MM/dd hh:mm:ss
     * 
     * 【可用标志：y-年 | M-月 | d-日 | h-小时 | m-分 | s-秒 | q-季度 | S-毫秒】
     * 
     * @returns String
     */
    public static dateFormat(date: Date, fmt = 'yyyy/MM/dd hh:mm:ss') {
        let o = {
            "M+": date.getMonth() + 1,                 //月份   
            "d+": date.getDate(),                    //日   
            "h+": date.getHours(),                   //小时   
            "m+": date.getMinutes(),                 //分   
            "s+": date.getSeconds(),                 //秒   
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
            "S": date.getMilliseconds()             //毫秒   
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    /**
     * 获取某一位的值
     * @param flag 
     * @param position 
     * @returns 
     */
    public static getBitValue(flag: number, position: number) {
        return ((1 << (position - 1)) & flag) > 0 ? 1 : 0;
    }

    /**
   * 1为真0为假
   * @param flag
   * @param position
   */
    public static checkBitValue(flag: number, position: number) {
        return this.getBitValue(flag, position) == 1 ? true : false;
    }

    /**
     * 设置富文本数字字体大小
     * @param richText 原富文本
     * @param num_size 数字字体大小
     * @returns 新文本
     */
    public static setRichTextNumberSize(richText: string, num_size: number) {
        let reg = new RegExp("^(<.*?>)[0-9]+", "g");
        let results = richText.match(reg);
        if (!results || results.length <= 0) return richText;
        results.forEach(res => richText.replace(res, `<size=${num_size}>${res}</size>`));
        return richText;
    }

    /**
    * 格式化时间到分
    * @param time 时间(单位：秒)
    * @returns (分:秒)
    */
    static formatTimeToMin(time: number, withZH = false) {
        let min = Math.floor(time / 60);
        let sec = Math.ceil(time % 60);
        return withZH ? `${this.keepIntUnits(min, 2)}分${this.keepIntUnits(sec, 2)}秒` : `${this.keepIntUnits(min, 2)}:${this.keepIntUnits(sec, 2)}`;
    }

    /** 
     * 格式化时间 
     * @param time 秒 
     * @param fmt 显示格式 
     * @param fix 后缀 
     * @returns  
     */
    static formatTime(time: number, fmt: string = "dhms", fix: Object = { d: "d", h: "h", m: "m", s: "s" }) {
        let day = this.keepIntUnits(Math.floor(time / (24 * 3600)), 2);
        let hour = this.keepIntUnits(Math.floor(time / 3600) % 24, 2);
        let min = this.keepIntUnits(Math.floor(time / 60) % 60, 2);
        let sec = this.keepIntUnits(Math.floor(time % 60), 2);
        let obj = { d: day, h: hour, m: min, s: sec };
        let str = "";
        for (let i = 0; i < fmt.length; i++) {
            let fixs = fix && fix[fmt[i]];
            str += obj[fmt[i]] + fixs;
            if (fixs == "" && i < fmt.length - 1) {
                str += ":";
            }
        }
        return str;
    }

    /**
    * 设置整形数字固定位数（不足的部分用0充填，超出设定长度或者不为整形则直接返回字符串形式）
    * @param int 要调整位数的数字
    * @param units 要调整的位数
    * @returns 调整后的字符串
    */
    static keepIntUnits(int: number, units: number) {
        if (!Number.isInteger(int) || int.toString().length >= units) return int.toString();
        let intStr = int.toString();
        let str: string[] = [];
        for (let i = 0; i < units; i++) {
            if (i < intStr.length) {
                str.push(intStr.charAt(i));
            } else {
                str.unshift("0");
            }
        }
        return str.join("");
    }

    /**获取节点相对自身的矩形范围 */
    static getSelfRect(node: cc.Node) {
        return cc.rect(-node.width * node.anchorX, -node.height * node.anchorY, node.width, node.height);
    }

    /**
     * 等比分割矩形
     * @param rect 原矩形
     * @param row 行数
     * @param col 列数
     * @returns 切割后的矩形
     */
    static splitRect(rect: cc.Rect, row: number, col: number) {
        let splitRects: cc.Rect[] = [];
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                splitRects.push(cc.rect(rect.x + j * rect.width / col, rect.y + i * rect.height / row, rect.width / col, rect.height / row));
            }
        }
        return splitRects;
    }

    static formatCountPerKilo(count: number, fractionDigits: number = 1, kiloLimit = 10000, milloneLimit = 100000000) {
        fractionDigits = Math.max(fractionDigits, 0);
        if (count >= milloneLimit) {
            return (Math.floor(count /= Math.pow(10, 8 - fractionDigits)) / Math.pow(10, fractionDigits)) + "亿";
        } else if (count >= kiloLimit) {
            return (Math.floor(count /= Math.pow(10, 4 - fractionDigits)) / Math.pow(10, fractionDigits)) + "万";
        } else {
            return count + "";
        }
    }

    static sum(arr: number[]) {
        let res = 0;
        arr.forEach(num => res += num);
        return res;
    }

    static isValid(value) {
        return value != null && cc.isValid(value, true);
    }

    static convertStrToNumber(str: string) {
        let value = 0;
        if (str.includes("万")) {
            str = str.replace("万", "");
            value = Number(str) * 10000;
        } else if (str.includes("亿")) {
            str = str.replace("亿", "");
            value = Number(str) * 100000000;
        } else {
            value = Number(str);
        }
        return value || 0
    }

    /**按顺序执行一个promise任务组 */
    static asyncSequentializer<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
        let sequence = Promise.resolve();
        const results: T[] = [];

        tasks.forEach((task) => {
            sequence = sequence.then(task).then((result) => results.push(result));
        });

        return sequence.then(() => results);
    }

    /**
     * 将一个值随机分成几份
     * @param total 值
     * @param parts 要分的份数
     * @param maxOffsetPer 最大差值百分比
     * @param isInt 是否整型
     * @returns 
     */
    static splitIntoRandomShares(total: number, parts: number, maxOffsetPer: number = 0.2, isInt: boolean = true): number[] {
        const shares = [];
        let partNum = total / parts;
        if (isInt) {
            if (!this.isInteger(partNum)) {
                partNum = Math.ceil(partNum);
            }
        }
        let maxOffset = partNum * maxOffsetPer / 2;
        if (isInt) maxOffset = Math.floor(maxOffset);
        let max = partNum + maxOffset;
        let min = partNum - maxOffset;

        for (let i = 0; i < parts - 1; i++) {
            let randomShare = isInt ? this.getRandomInt(min, max) : this.getRandomFloat(min, max);
            shares.push(randomShare);
            total -= randomShare;
        }

        shares.push(total);

        shares.sort(() => Math.random() - 0.5);

        return shares;
    }

    /**动态构建枚举 */
    static createEnum(enumObj: { [key: string]: number }): any {
        return Object.keys(enumObj).reduce((prev, key) => {
            prev[key] = enumObj[key];
            return prev;
        }, {});
    }

    /**
     * 获得贝塞尔曲线的途径点坐标数组
     * @param posArr 三阶贝塞尔的四个点,数组对应为 0起点,1起点控制点,2终点控制点,3终点
     * @param interval 间隔 每次迭代步长,这个值越小越精细,但是效率越低
     * @returns 
     */
    static getBezierPointArr(posArr: cc.Vec2[], interval: number = 300): cc.Vec2[] {
        let allBezierPos = []
        let gap = 1 / interval;
        for (let i = 0; i <= 1; i += gap) {
            let pos = this._caculateBezierP(posArr, i)
            allBezierPos.push(pos)
        }
        return allBezierPos;
    }

    /**
     * 计算三阶贝塞尔在 t时刻 的位置
     * @param p 三阶贝塞尔的四个点,数组对应为 0起点,1起点控制点,2终点控制点,3终点
     * @param t 传入0-1的值,一个时间的迭代过程
     * @returns 
     */
    static _caculateBezierP(p: cc.Vec2[], t: number): cc.Vec2 {
        // 三阶贝塞尔运算
        let bezierP: cc.Vec2 = cc.v2()
        bezierP.x = Math.floor(Math.pow(1 - t, 3) * p[0].x + 3 * t * Math.pow(1 - t, 2) * p[1].x + 3 * Math.pow(t, 2) * (1 - t) * p[2].x + Math.pow(t, 3) * p[3].x);
        bezierP.y = Math.floor(Math.pow(1 - t, 3) * p[0].y + 3 * t * Math.pow(1 - t, 2) * p[1].y + 3 * Math.pow(t, 2) * (1 - t) * p[2].y + Math.pow(t, 3) * p[3].y);
        return bezierP;
    }

    /**
     * 获得以每万为单位的数值字符串
     * @param value 原数值
     * @param decimal 小数位
     * @returns 
     */
    static getFormatValueStr(value: number, decimal: number = 1) {
        if (value >= Math.pow(10, 16)) {//京
            return Math.floor(value / Math.pow(10, 16 - decimal)) / Math.pow(10, decimal) + "京";
        } else if (value >= Math.pow(10, 12)) {//兆
            return Math.floor(value / Math.pow(10, 12 - decimal)) / Math.pow(10, decimal) + "兆";
        } else if (value >= Math.pow(10, 8)) {//亿
            return Math.floor(value / Math.pow(10, 8 - decimal)) / Math.pow(10, decimal) + "亿";
        } else if (value >= Math.pow(10, 4)) {//万
            return Math.floor(value / Math.pow(10, 4 - decimal)) / Math.pow(10, decimal) + "万";
        } else {
            return value.toString();
        }
    }

    /**判断值是否为整型 */
    static isInteger(value: any): value is number {
        return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    }
}