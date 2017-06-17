// TypeScript file
var Doudizhu = (function (_super) {
    __extends(Doudizhu, _super);
    function Doudizhu() {
        _super.call(this);
        console.log(1);
        this.skinName = "resource/test.exml";
        this.init();
    }
    var d = __define,c=Doudizhu,p=c.prototype;
    // public createChildren():void
    // {
    //     //this.init();
    // }
    Doudizhu.getInstance = function () {
        if (!this._instance) {
            this._instance = new Doudizhu();
        }
        return this._instance;
    };
    p.init = function () {
        this.start.addEventListener(egret.TouchEvent.TOUCH_TAP, this.matchPlayer, this);
        NetController.getInstance().connect();
    };
    /**开始匹配游戏*/
    p.matchPlayer = function () {
        this.start.enabled = false;
        this.tipTween();
        var data = new BaseMsg();
        data.command = Commands.MATCH_PLAYER;
        this.playerName = Math.floor(Math.random() * 100) + "";
        console.log(this.playerName);
        data.content = { "name": this.playerName };
        NetController.getInstance().sendData(data, this.onMatchPlayerBack, this);
    };
    p.tipTween = function () {
        this.start.visible = false;
        this.start_tip.visible = true;
        this.start_tip.rotation = 5;
        egret.Tween.get(this.start_tip, { loop: true })
            .to({ rotation: -5 }, 500, egret.Ease.backInOut)
            .to({ rotation: 5 }, 500, egret.Ease.backInOut);
        console.log("tipTween");
    };
    /**匹配完毕,分配座位,开始发牌*/
    p.onMatchPlayerBack = function (data) {
        console.log('匹配返回', data);
        if (data.code == 0) {
            console.log('匹配成功' + '玩家有：' + data.content.players);
            var players = data.content.players;
            this.start_tip.visible = false;
            for (var i = 0; i < players.length; i++) {
                if (this.playerName == players[i]) {
                    this.my_id.text = (i + 1) + '号位：' + players[i];
                    if (i == 2) {
                        this.right_id.text = '1号位：' + players[0];
                        this.left_id.text = '2号位：' + players[1];
                        this.leftSeat = 2;
                        this.rightSeat = 1;
                    }
                    else if (i == 0) {
                        this.right_id.text = '2号位：' + players[1];
                        this.left_id.text = '3号位：' + players[2];
                        this.leftSeat = 3;
                        this.rightSeat = 2;
                    }
                    else {
                        this.right_id.text = '3号位：' + players[2];
                        this.left_id.text = '1号位：' + players[0];
                        this.leftSeat = 1;
                        this.rightSeat = 3;
                    }
                }
            }
            this.my_id.visible = true;
            this.left_id.visible = true;
            this.right_id.visible = true;
        }
        this.refreshMyCard([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    };
    p.refreshMyCard = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            var card = this.my_poker.getChildAt(i);
            card.index = arr[i];
        }
    };
    /**移除他人的扑克牌，只需要知道几张，和几号位*/
    p.removeOtherCard = function (num, seat) {
        while (num) {
            if (seat == this.rightSeat) {
                this.right_poker.removeChildAt(this.right_poker.numChildren - 1);
            }
            else {
                this.left_poker.removeChildAt(this.right_poker.numChildren - 1);
            }
            num--;
        }
    };
    /**自己的牌需要根据序号来移除*/
    p.removeMyCard = function (point) {
        for (var i = 0; i < this.my_poker.numChildren; i++) {
            this.my_poker.getChildAt(i);
        }
    };
    return Doudizhu;
}(eui.Component));
egret.registerClass(Doudizhu,'Doudizhu');
//# sourceMappingURL=Douzizhu.js.map