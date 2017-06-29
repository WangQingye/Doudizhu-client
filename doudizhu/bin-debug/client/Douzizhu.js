// TypeScript file
var Doudizhu = (function (_super) {
    __extends(Doudizhu, _super);
    function Doudizhu() {
        _super.call(this);
        this.cardUtils = CardUtils.getInstance();
        this.CardPool = [];
        /**=========================出牌逻辑=============================*/
        this.onMyTurn = false; //是否该我出牌
        this.cardArr = []; //准备出的牌组（点起来的）
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
        this.my_poker.addEventListener(egret.TouchEvent.TOUCH_TAP, this.cardOnTouch, this);
        this.btn_yes.addEventListener(egret.TouchEvent.TOUCH_TAP, this.playCard, this);
        this.btn_no.addEventListener(egret.TouchEvent.TOUCH_TAP, this.playNo, this);
        this.score0.addEventListener(egret.TouchEvent.TOUCH_TAP, this.wantDizhu, this);
        this.score1.addEventListener(egret.TouchEvent.TOUCH_TAP, this.wantDizhu, this);
        this.score2.addEventListener(egret.TouchEvent.TOUCH_TAP, this.wantDizhu, this);
        this.score3.addEventListener(egret.TouchEvent.TOUCH_TAP, this.wantDizhu, this);
        NetController.getInstance().addListener(Commands.ROOM_NOTIFY, this);
        NetController.getInstance().addListener(Commands.PLAY_GAME, this);
        NetController.getInstance().addListener(Commands.PLAYER_WANTDIZHU, this);
        NetController.getInstance().connect();
        this.initCards();
    };
    /**开始匹配游戏*/
    p.matchPlayer = function () {
        this.start.enabled = false;
        this.tipTween();
        var data = new BaseMsg();
        data.command = Commands.MATCH_PLAYER;
        this.playerName = Math.floor(Math.random() * 100) + "";
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
    };
    /**匹配完毕,分配座位,开始发牌*/
    p.onMatchPlayerBack = function (data) {
        console.log('匹配返回', data);
        if (data.code == 0) {
            console.log('匹配成功' + '玩家有：' + data.content.players);
            var players = data.content.players;
            this.roomId = data.content.roomId;
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
    p.onReciveMsg = function (data) {
        var command = data.command;
        console.warn('onReciveMsg', command);
        switch (command) {
            case Commands.ROOM_NOTIFY:
                //this.onReciveRoomNotify(data.content);
                break;
            case Commands.PLAY_GAME:
            case Commands.PLAYER_WANTDIZHU:
                this.onRecivePlayGame(data.content);
                break;
        }
    };
    /**房间消息*/
    p.onRecivePlayGame = function (content) {
        //0是第一次发牌, 1是游戏中, 2是结算分数, 3是抢地主
        var state = content.state;
        console.warn('state', state);
        if (state == undefined)
            return;
        switch (state) {
            case 0:
                var cards = content.cards;
                this.refreshMyCard(cards.sort(function (a, b) { return b - a; }));
                break;
            case 1:
                this.onGamePlay(content);
                break;
            case 2:
                this.onGameOver(content);
                break;
            case 3:
                this.onWantDizhu(content);
                break;
        }
    };
    p.onWantDizhu = function (content) {
        var seat = content.curPlayerIndex;
        var nowScore = content.nowScore;
        var dizhu = content.dizhu;
        if (dizhu) {
        }
        else {
            this.showRect(seat);
            if (seat == this.mySeat) {
                for (var i = 1; i < 4; i++) {
                    if (i > nowScore) {
                        this['score' + i].visible = true;
                    }
                    this.score0.visible = true; //不抢的按钮肯定要一直亮啊，还不准人家不抢么。。
                }
                this.btn_yes.visible = false;
            }
        }
    };
    /**游戏进程消息*/
    p.onGamePlay = function (content) {
        var seat = content.curPlayerIndex;
        this.showRect(seat);
        var lastSeat = seat - 1 < 1 ? 3 : seat - 1;
        var cardType = content.curCard.type;
        this.onMyTurn = seat == this.mySeat ? true : false;
        if (cardType == CARD_TYPE.NO_CARDS) {
            //说明要开始新一轮出牌
            this.removeAllShowCards();
            if (this.onMyTurn)
                this.btn_no.visible = false;
        }
        if (cardType == CARD_TYPE.PASS_CARDS) {
            //等于-2说明上家是过牌
            this.showCards(lastSeat, true);
        }
        else {
            //不是过牌才记录新牌
            this.curCards = content.curCard;
            this.showCards(lastSeat);
        }
        console.log('onRecivePlayGame', content);
    };
    p.onGameOver = function (content) {
    };
    p.showRect = function (index) {
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
            this.btn_yes.enabled = false; //初始的时候不能出，选择了合适的牌才能出
        }
        else if (index == this.rightSeat) {
            this.rect_1.visible = false;
            this.rect_2.visible = false;
            this.rect_3.visible = true;
            this.btn_no.visible = false;
            this.btn_yes.visible = false;
        }
    };
    /**初始界面*/
    p.initCards = function () {
        for (var i = 0; i < 17; i++) {
            var card = this.getCard();
            card.source = 'bg_poker_png';
            this.left_poker.addChild(card);
            var card1 = this.getCard();
            card1.source = 'bg_poker_png';
            this.right_poker.addChild(card1);
        }
    };
    p.refreshMyCard = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            var card = this.my_poker.getChildAt(i);
            card.index = arr[i];
        }
    };
    /**移除他人的扑克牌，只需要知道几张，和几号位*/
    p.removeOtherCard = function (num, seat) {
        var parent = seat == this.rightSeat ? this.right_poker : this.left_poker;
        while (num) {
            this.CardPool.push(parent.getChildAt(parent.numChildren - 1));
            parent.removeChildAt(parent.numChildren - 1);
            num--;
        }
    };
    /**自己的牌需要根据序号来移除*/
    p.removeMyCard = function (cards) {
        for (var i = 0; i < this.cardArr.length; i++) {
            for (var j = 0; j < this.my_poker.numChildren; j++) {
                var card = this.my_poker.getChildAt(j);
                if (card.index == this.cardArr[i].index) {
                    this.CardPool.push(card);
                    this.my_poker.removeChildAt(j);
                }
            }
        }
        /**删除卡牌后再调整一下位置*/
        for (var k = 0; k < this.my_poker.numChildren; k++) {
            var card = this.my_poker.getChildAt(k);
            card.x = 35 * k;
        }
    };
    /**卡牌对象池*/
    p.getCard = function () {
        if (this.CardPool.length < 1) {
            return new Card();
        }
        else {
            return this.CardPool.pop();
        }
    };
    ;
    /**显示出的牌（包括过）*/
    p.showCards = function (index, showPass) {
        if (showPass === void 0) { showPass = false; }
        console.warn(index, showPass);
        var parent;
        switch (index) {
            case this.leftSeat:
                parent = 'left';
                break;
            case this.rightSeat:
                parent = 'right';
                break;
            case this.mySeat:
                parent = 'my';
                break;
        }
        var group = this[parent + '_poker1'];
        group.removeChildren();
        if (showPass) {
            this[parent + '_pass'].visible = true;
            return;
        }
        else {
            this[parent + '_pass'].visible = false;
        }
        var card;
        for (var i = 0; i < this.curCards.cards.length; i++) {
            card = this.getCard();
            card.index = this.curCards.cards[i];
            card.source = card.index + "_jpg";
            console.warn(card.index);
            group.addChild(card);
        }
        if (index != this.mySeat) {
            this.removeOtherCard(this.curCards.cards.length, index);
        }
    };
    /**清楚桌子上展示的牌（每次新出牌次）*/
    p.removeAllShowCards = function () {
        var groups = [this['my_poker1'], this['left_poker1'], this['right_poker1']];
        this['my_pass'].visible = false;
        this['left_pass'].visible = false;
        this['right_pass'].visible = false;
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i].numChildren; j++) {
                this.CardPool.push(groups[i].getChildAt(j));
            }
            groups[i].removeChildren();
        }
    };
    /**点击扑克*/
    p.cardOnTouch = function (e) {
        console.warn(this.curCards);
        if (!this.onMyTurn)
            return; //不该我出牌的时候点不动
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
        if (this.cardUtils.canPlay(this.curCards, this.cardArr)) {
            this.btn_yes.enabled = true;
        }
        else {
            this.btn_yes.enabled = false;
        }
    };
    ;
    /**点击出牌按钮*/
    p.playCard = function () {
        var type = CardUtils.getInstance().calcCardType(this.cardArr);
        var header = CardUtils.getInstance().calcHeadPoker(type, this.cardArr);
        var data = new BaseMsg();
        data.command = Commands.PLAYER_PLAYCARD;
        data.content = { roomId: this.roomId, index: this.mySeat, curCards: { type: type, header: header, cards: this.cardUtils.transCardsToIndex(this.cardArr) } };
        NetController.getInstance().sendData(data, this.onPlayCardBack, this);
    };
    /**获得出牌的返回消息*/
    p.onPlayCardBack = function (data) {
        console.log('获得出牌返回');
        if (data.code == 0) {
            console.log('出牌成功');
            this.removeMyCard(this.cardArr);
            this.cardArr = [];
        }
    };
    /**点击过*/
    p.playNo = function () {
        var data = new BaseMsg();
        data.command = Commands.PLAYER_PLAYCARD;
        data.content = { roomId: this.roomId, index: this.mySeat, curCards: { type: CARD_TYPE.PASS_CARDS, cards: [] } };
        NetController.getInstance().sendData(data, this.onPlayCardBack, this);
    };
    /**抢地主*/
    p.wantDizhu = function (e) {
        var score = parseInt(e.target.name);
        var data = new BaseMsg();
        data.command = Commands.PLAYER_WANTDIZHU;
        data.content = { roomId: this.roomId, index: this.mySeat, score: score };
        NetController.getInstance().sendData(data, this.onWantDizhuBack, this);
    };
    p.onWantDizhuBack = function (data) {
        console.log('获得抢地主返回');
        if (data.code == 0) {
            console.log('抢地主成功');
            this.score0.visible = false;
            this.score1.visible = false;
            this.score2.visible = false;
            this.score3.visible = false;
        }
    };
    return Doudizhu;
}(eui.Component));
egret.registerClass(Doudizhu,'Doudizhu');
//# sourceMappingURL=Douzizhu.js.map