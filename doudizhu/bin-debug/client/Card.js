var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * 总数54张，资源名 1-54
 * 扑克牌序号排序是从3点到大小王
 * 举例：四张3点1，2，3，4
 * 同点数排序规则 红黑梅方（斗地主可能用不上）
 * 需要提供一个将序号转为点数的方法，用来对比是否是同点数
*/
var Card = (function (_super) {
    __extends(Card, _super);
    function Card() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Card.prototype, "index", {
        get: function () {
            return this._index;
        },
        set: function (v) {
            this._index = v;
            this.source = v + "_jpg";
            if (v % 4 == 0) {
                this.point = v / 4;
            }
            else {
                this.point = Math.floor(v / 4) + 1;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "onTouch", {
        get: function () {
            return this._onTouch;
        },
        set: function (v) {
            this._onTouch = v;
            if (v) {
                this.y -= 20;
            }
            else {
                this.y += 20;
            }
        },
        enumerable: true,
        configurable: true
    });
    return Card;
}(eui.Image));
__reflect(Card.prototype, "Card");
//# sourceMappingURL=Card.js.map