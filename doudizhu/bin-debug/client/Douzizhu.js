// TypeScript file
var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Doudizhu = (function (_super) {
    __extends(Doudizhu, _super);
    function Doudizhu() {
        var _this = _super.call(this) || this;
        _this.onMyTurn = false; //是否该我出牌
        _this.cardArr = []; //准备出的牌组（点起来的）
        _this.skinName = "resource/test.exml";
        _this.init();
        return _this;
    }
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
    Doudizhu.prototype.init = function () {
        this.start.addEventListener(egret.TouchEvent.TOUCH_TAP, this.matchPlayer, this);
        this.my_poker.addEventListener(egret.TouchEvent.TOUCH_TAP, this.cardOnTouch, this);
        NetController.getInstance().addListener(Commands.ROOM_NOTIFY, this);
        NetController.getInstance().addListener(Commands.PLAY_GAME, this);
        NetController.getInstance().connect();
    };
    /**开始匹配游戏*/
    Doudizhu.prototype.matchPlayer = function () {
        this.start.enabled = false;
        this.tipTween();
        var data = new BaseMsg();
        data.command = Commands.MATCH_PLAYER;
        this.playerName = Math.floor(Math.random() * 100) + "";
        data.content = { "name": this.playerName };
        NetController.getInstance().sendData(data, this.onMatchPlayerBack, this);
    };
    Doudizhu.prototype.tipTween = function () {
        this.start.visible = false;
        this.start_tip.visible = true;
        this.start_tip.rotation = 5;
        egret.Tween.get(this.start_tip, { loop: true })
            .to({ rotation: -5 }, 500, egret.Ease.backInOut)
            .to({ rotation: 5 }, 500, egret.Ease.backInOut);
    };
    /**匹配完毕,分配座位,开始发牌*/
    Doudizhu.prototype.onMatchPlayerBack = function (data) {
        console.log('匹配返回', data);
        if (data.code == 0) {
            console.log('匹配成功' + '玩家有：' + data.content.players);
            var players = data.content.players;
            this.start_tip.visible = false;
            for (var i = 0; i < players.length; i++) {
                if (this.playerName == players[i]) {
                    this.my_id.text = (i + 1) + '号位：' + players[i];
                    this.mySeat = i + 1;
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
    };
    /**收到服务器消息*/
    Doudizhu.prototype.onReciveMsg = function (data) {
        console.warn('onReciveMsg');
        var command = data.command;
        switch (command) {
            case Commands.ROOM_NOTIFY:
                this.onReciveRoomNotify(data.content);
                break;
            case Commands.PLAY_GAME:
                this.onRecivePlayGame(data.content);
        }
    };
    /**房间消息*/
    Doudizhu.prototype.onReciveRoomNotify = function (content) {
        //2是结算，1是游戏中, 0是第一次发牌
        var state = content.state;
        if (state == undefined)
            return;
        switch (state) {
            case 0:
                var cards = content.cards;
                console.log('cards', cards);
                this.refreshMyCard(cards.sort(function (a, b) { return b - a; }));
                break;
        }
    };
    /**游戏进程消息*/
    Doudizhu.prototype.onRecivePlayGame = function (content) {
        var seat = content.curPlayerIndex;
        this.showRect(seat);
        console.log('onRecivePlayGame', content);
    };
    Doudizhu.prototype.showRect = function (index) {
        if (index == this.leftSeat) {
            this.rect_1.visible = true;
            this.rect_2.visible = false;
            this.rect_3.visible = false;
            this.btn_no.visible = false;
            this.btn_yes.visible = false;
        }
        else if (index == this.mySeat) {
            this.rect_1.visible = false;
            this.rect_2.visible = true;
            this.rect_3.visible = false;
            this.btn_no.visible = true;
            this.btn_yes.visible = true;
        }
        else if (index == this.rightSeat) {
            this.rect_1.visible = false;
            this.rect_2.visible = false;
            this.rect_3.visible = true;
            this.btn_no.visible = false;
            this.btn_yes.visible = false;
        }
    };
    Doudizhu.prototype.refreshMyCard = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            var card = this.my_poker.getChildAt(i);
            card.index = arr[i];
        }
    };
    Doudizhu.prototype.cardOnTouch = function (e) {
        //if(!this.onMyTurn) return; //不该我出牌的时候点不动
        var card = e.target;
        if (card.onTouch) {
            card.onTouch = false;
            if (this.cardArr.indexOf(card) !== -1) {
                this.cardArr.splice(this.cardArr.indexOf(card), 1);
            }
        }
        else {
            card.onTouch = true;
            this.cardArr.push(card);
        }
    };
    ;
    /**移除他人的扑克牌，只需要知道几张，和几号位*/
    Doudizhu.prototype.removeOtherCard = function (num, seat) {
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
    Doudizhu.prototype.removeMyCard = function (point) {
        for (var i = 0; i < this.my_poker.numChildren; i++) {
            this.my_poker.getChildAt(i);
        }
    };
    return Doudizhu;
}(eui.Component));
__reflect(Doudizhu.prototype, "Doudizhu");
//# sourceMappingURL=Douzizhu.js.map