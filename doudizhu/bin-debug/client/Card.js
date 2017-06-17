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
                this.point = v / 4;
            }
            else {
                this.point = Math.floor(v / 4) + 1;
            }
        }
    );
    return Card;
}(eui.Image));
egret.registerClass(Card,'Card');
//# sourceMappingURL=Card.js.map