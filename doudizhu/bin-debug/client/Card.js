/**
 * 总数54张，资源名 1-54
 * 扑克牌序号排序是从3点到大小王:对应顺序如下
 * 3 4 5 6 7 8 9 10 J  Q  K  A  2  KING
 * 3 4 5 6 7 8 9 10 11 12 13 14 15 16
 * 举例：四张3点1，2，3，4
 * 同点数排序规则 红黑梅方（斗地主可能用不上）
 * 需要提供一个将序号转为点数的方法，用来对比是否是同点数
*/
var Card = (function (_super) {
    __extends(Card, _super);
    function Card() {
        _super.apply(this, arguments);
    }
    var d = __define,c=Card,p=c.prototype;
    d(p, "index"
        ,function () {
            return this._index;
        }
        ,function (v) {
            this._index = v;
            this.source = v + "_jpg";
            if (v % 4 == 0) {
                this.point = v / 4 + 2;
            }
            else {
                this.point = Math.floor(v / 4) + 3;
            }
        }
    );
    d(p, "onTouch"
        ,function () {
            return this._onTouch;
        }
        ,function (v) {
            this._onTouch = v;
            if (v) {
                this.y -= 20;
            }
            else {
                this.y += 20;
            }
        }
    );
    return Card;
}(eui.Image));
egret.registerClass(Card,'Card');
//# sourceMappingURL=Card.js.map