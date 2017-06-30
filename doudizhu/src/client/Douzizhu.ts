// TypeScript file

class Doudizhu extends eui.Component
{
    private start:eui.Button;
    private start_tip:eui.Image;
    private playerName:string;
    private static _instance:Doudizhu;
    private cardUtils = CardUtils.getInstance();
    public constructor()
    {
        super();
        this.skinName = "resource/test.exml";
        this.init();
    }
    
    // public createChildren():void
    // {
    //     //this.init();
    // }
    public static getInstance(){
		if(!this._instance){
			this._instance = new Doudizhu();
		}
		return this._instance;
	}


    public init()
    {
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
    }

    /**开始匹配游戏*/
    private matchPlayer()
    {
        this.start.enabled = false;
        this.tipTween();

        var data = new BaseMsg();
        data.command = Commands.MATCH_PLAYER;
        this.playerName = Math.floor(Math.random() * 100) + "";
        data.content = { "name": this.playerName };
        NetController.getInstance().sendData(data, this.onMatchPlayerBack, this);
    }

    private tipTween():void
    {
        this.start.visible = false;
        this.start_tip.visible = true;
		this.start_tip.rotation = 5;
		egret.Tween.get(this.start_tip, {loop:true})
			.to({rotation:-5}, 500, egret.Ease.backInOut)
			.to({rotation:5}, 500, egret.Ease.backInOut)
    }

    private roomId:number /**所在的游戏房间*/
    private my_id:eui.Label;
    private left_id:eui.Label;
    private right_id:eui.Label;
    private mySeat:number;
    private leftSeat:number;
    private rightSeat:number;

    /**匹配完毕,分配座位,开始发牌*/
    private onMatchPlayerBack(data:BaseMsg){
        console.log('匹配返回', data)
        if(data.code == 0)
        {
            console.log('匹配成功' + '玩家有：' + data.content.players);
            let players = data.content.players;
            this.roomId = data.content.roomId;
            this.start_tip.visible = false;
            for( let i = 0; i < players.length; i++)
            {
                if(this.playerName == players[i])
                {
                    this.my_id.text = (i+1) + '号位：' + players[i];
                    this.mySeat = i + 1;
                    if(i == 2)
                    {
                        this.right_id.text = '1号位：' + players[0];
                        this.left_id.text = '2号位：' + players[1];
                        this.leftSeat = 2;
                        this.rightSeat = 1;
                    }else if(i == 0)
                    {
                        this.right_id.text = '2号位：' + players[1];
                        this.left_id.text = '3号位：' + players[2];
                        this.leftSeat = 3;
                        this.rightSeat = 2;
                    }else
                    {
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
            // this.p2_id.text = 
            // this.p3_id.text = 
            // this.p3_id.text = 
        }
    }

    /**收到服务器消息*/
    private onReciveMsg(data:BaseMsg)
    {
        let command = data.command;
        console.warn('onReciveMsg', command);
        switch (command)
        {
            case Commands.ROOM_NOTIFY:
                //this.onReciveRoomNotify(data.content);
                break;
            case Commands.PLAY_GAME:
            case Commands.PLAYER_WANTDIZHU:
                this.onRecivePlayGame(data.content);
                break;
            /*留下其他*/
        }
    }

    /**房间消息*/
    private onRecivePlayGame(content):void
    {
        //0是第一次发牌, 1是游戏中, 2是结算分数, 3是抢地主
        let state = content.state;
        console.warn('state', state);
        if(state == undefined) return;
        switch(state)
        {
            case 0 :
                this.my_cards = content.cards.sort(function(a,b){return b-a});
                this.refreshMyCard(this.my_cards);
                break;
            case 1 :
                this.onGamePlay(content);
                break;
            case 2 :
                this.onGameOver(content);
                break;
            case 3 :
                this.onWantDizhu(content);
                break;
        }
    }


    private score0:eui.Button;
    private score1:eui.Button;
    private score2:eui.Button;
    private score3:eui.Button;
    private dizhu:number;
    private onWantDizhu(content):void
    {
        let seat = content.curPlayerIndex;
        let nowScore = content.nowScore;
        let dizhu = content.dizhu;
        this.dizhu = dizhu;
        let dizhuCards = content.dizhuCards;
        if(dizhu) //地主已经有了
        {
            //展示一下地主,还有多的牌
            this.showDizhu(dizhu, dizhuCards);
        }else
        {
            this.showRect(seat);
            if(seat == this.mySeat)
            {
                for(let i = 1; i < 4; i++)
                {
                    if(i > nowScore)
                    {
                        this['score' + i].visible = true;
                    }
                    this.score0.visible = true;//不抢的按钮肯定要一直亮啊，还不准人家不抢么。。
                }
                this.btn_yes.visible = false;
            }
        }
    }

    /**游戏进程消息*/
    private onGamePlay(content):void
    {
        let seat = content.curPlayerIndex;
        this.showRect(seat);
        let lastSeat = seat - 1 < 1  ? 3 : seat - 1;
        let cardType = content.curCard.type;
        this.onMyTurn = seat == this.mySeat ? true : false;
        if(cardType == CARD_TYPE.NO_CARDS)
        {
            //说明要开始新一轮出牌
            this.removeAllShowCards();
            if(this.onMyTurn) this.btn_no.visible = false;
        }
        if(cardType == CARD_TYPE.PASS_CARDS)
        {
            //等于-2说明上家是过牌
            this.showCards(lastSeat, true);
        }else
        {
            //不是过牌才记录新牌
            this.curCards = content.curCard;
            this.showCards(lastSeat);
        }
        console.log('onRecivePlayGame', content);
    }

    private dizhu_label:eui.Label;
    private score_panel:eui.Group;
    private onGameOver(content):void
    {
        this.score_panel.visible = true;
        let scores = content.scores;
        for(let index in scores)
        {
            this['player'+ index + '_score'].text = scores[index];
        }
        this.dizhu_label.y = this['player' + this.dizhu].y;
    }

    private rect_1:eui.Label;
    private rect_2:eui.Label;
    private rect_3:eui.Label;
    private btn_yes:eui.Button;
    private btn_no:eui.Button;
    private showRect(index:number):void
    {
        if(index == this.leftSeat)
        {
            this.rect_1.visible = true;
            this.rect_2.visible = false;
            this.rect_3.visible = false;
            this.btn_no.visible = false;
            this.btn_yes.visible = false;
            this['left_poker1'].visible = false;
            this['left_pass'].visible = false;
        }else if(index == this.mySeat)
        {
            this.rect_1.visible = false;
            this.rect_2.visible = true;
            this.rect_3.visible = false;
            this.btn_no.visible = true;
            this.btn_yes.visible = true;
            this.btn_yes.enabled = false; //初始的时候不能出，选择了合适的牌才能出
            this['my_poker1'].visible = false;
            this['my_pass'].visible = false;
        }else if(index == this.rightSeat)
        {
            this.rect_1.visible = false;
            this.rect_2.visible = false;
            this.rect_3.visible = true;
            this.btn_no.visible = false;
            this.btn_yes.visible = false;
            this['right_poker1'].visible = false;
            this['right_pass'].visible = false;
        }
    }

    private dizhu_card:eui.Group;
    private dizhu_pic:eui.Image;
    /**展示地主*/
    private showDizhu(dizhu:number, dizhuCards:Array<number>):void
    {
        this.dizhu_pic.visible = true;
        this.dizhu_card.visible = true;
        for(let i = 0; i < dizhuCards.length; i++)
        {
            let card = <Card>this.dizhu_card.getChildAt(i);
            card.index = dizhuCards[i];
        }
        switch(dizhu)
        {
            case this.mySeat:
                this.dizhu_pic.x = 411;
                this.dizhu_pic.y = 605;
                this.my_cards = this.my_cards.concat(dizhuCards).sort(function(a,b){return b-a});
                this.refreshMyCard(this.my_cards);
                this.removeMyCard([]); //排一下位置
                break;
            case this.leftSeat:
                this.dizhu_pic.x = 2;
                this.dizhu_pic.y = 489;
                for(let i = 0; i < 3; i++)
                {
                    let card = this.getCard();
                    card.source = "bg_poker_png";
                    this.left_poker.addChild(card);
                }
                break;
            case this.rightSeat:
                this.dizhu_pic.x = 996;
                this.dizhu_pic.y = 489;
                for(let i = 0; i < 3; i++)
                {
                    let card = this.getCard();
                    card.source = "bg_poker_png";
                    this.right_poker.addChild(card);
                }
                break;
        }
    }

/**=========================扑克显示=============================*/
    private my_poker:eui.Group;
    private my_cards:Array<number>;
    private right_poker:eui.Group;
    private left_poker:eui.Group;
    /**准备出的牌，根据这个数组里的牌来判断是否可以出牌*/
    private onTouchPoker: Array<number>;
    /**初始界面*/
    private initCards():void
    {
        for(let i = 0; i < 17; i++)
        {
            let card = this.getCard();
            card.source = 'bg_poker_png';
            this.left_poker.addChild(card);
            let card1 = this.getCard();
            card1.source = 'bg_poker_png';
            this.right_poker.addChild(card1);
        }
    }
    private refreshMyCard(arr:Array<number>):void
    {
        if(arr.length == 20)
        {
            for(let i = 0; i < 3; i++)
            {
                let card = this.getCard();
                this.my_poker.addChild(card);
            }
        }
        for(let i = 0; i < arr.length; i++)
        {
            let card = <Card>this.my_poker.getChildAt(i);
            card.index = arr[i];
        }

    }
    /**移除他人的扑克牌，只需要知道几张，和几号位*/
    private removeOtherCard(num:number, seat:number):void
    {
        let parent = seat == this.rightSeat ? this.right_poker : this.left_poker;

        while(num)
        {
            this.CardPool.push(<Card>parent.getChildAt(parent.numChildren - 1));
            parent.removeChildAt(parent.numChildren - 1);
            num--;
        }
    }
    /**自己的牌需要根据序号来移除*/
    private removeMyCard(cards:Array<Card>):void
    {
        for(let i = 0; i < this.cardArr.length; i++)
        {
            for(let j= 0; j< this.my_poker.numChildren; j++)
            {
                let card = <Card>this.my_poker.getChildAt(j);
                if(card.index == this.cardArr[i].index)
                {
                    this.CardPool.push(card);
                    this.my_poker.removeChildAt(j);
                }
            }
        }
        /**删除卡牌后再调整一下位置*/
        for(let k= 0; k< this.my_poker.numChildren; k++)
        {
            let card = <Card>this.my_poker.getChildAt(k);
            card.x = 35*k;
        }
    }
    private CardPool:Array<Card> = [];
    /**卡牌对象池*/
    private getCard():Card
    {
        if(this.CardPool.length < 1)
        {
            return new Card();
        }else
        {
            return this.CardPool.pop();
        }
    };

    /**显示出的牌（包括过）*/
    private showCards(index:number, showPass:boolean = false)
    {
        console.warn(index, showPass);
        let parent;
        switch(index)
        {
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
        let group = <eui.Group>this[parent+'_poker1'];
        group.removeChildren();
        if(showPass)
        {
            this[parent+'_pass'].visible = true;
            this[parent+'_poker1'].visible = false;
            return;
        }else
        {
            this[parent+'_pass'].visible = false;
            this[parent+'_poker1'].visible = true;
        }
        let card;
        for(let i = 0; i < this.curCards.cards.length; i++)
        {
            card = <Card>this.getCard();
            card.index = this.curCards.cards[i];
            card.source =  card.index + "_jpg";
            console.warn(card.index);
            group.addChild(card);
        }
        if(index != this.mySeat)
        {
            this.removeOtherCard(this.curCards.cards.length, index);
        }
    }

    /**清楚桌子上展示的牌（每次新出牌次）*/
    private removeAllShowCards():void
    {
        let groups = [this['my_poker1'],this['left_poker1'],this['right_poker1']];
        this['my_pass'].visible = false;
        this['left_pass'].visible = false;
        this['right_pass'].visible = false;
        for(let i = 0; i < groups.length; i++)
        {
            for(let j= 0; j< groups[i].numChildren; j++)
            {
                this.CardPool.push(<Card>groups[i].getChildAt(j));                
            }
            groups[i].removeChildren();
        }
    }


/**=========================出牌逻辑=============================*/
    private onMyTurn:boolean = false; //是否该我出牌
    private cardArr:Array<Card> = [];//准备出的牌组（点起来的）
    private curCards:CUR_CARDS
    /**点击扑克*/
    private cardOnTouch(e:egret.TouchEvent):void
    {
        console.warn(this.curCards);
        if(!this.onMyTurn) return; //不该我出牌的时候点不动
        let card = <Card>e.target;
        if(card.onTouch)
        {
            card.onTouch = false;
            if(this.cardArr.indexOf(card) !== -1)
            {
                this.cardArr.splice(this.cardArr.indexOf(card), 1);
            }
        }else
        {
            card.onTouch = true;
            this.cardArr.push(card);
        }
        if(this.cardUtils.canPlay(this.curCards, this.cardArr))
        {
            this.btn_yes.enabled = true;
        }else
        {
            this.btn_yes.enabled = false;
        }
    };

    /**点击出牌按钮*/
    private playCard():void
    {
        let type = CardUtils.getInstance().calcCardType(this.cardArr);
        let header = CardUtils.getInstance().calcHeadPoker(type, this.cardArr);
        var data = new BaseMsg();
        data.command = Commands.PLAYER_PLAYCARD;
        data.content = { roomId:this.roomId, index:this.mySeat, curCards:{type:type, header:header, cards:this.cardUtils.transCardsToIndex(this.cardArr)}};
        NetController.getInstance().sendData(data, this.onPlayCardBack, this);
    }
    /**获得出牌的返回消息*/
    private onPlayCardBack(data:BaseMsg):void
    {
        console.log('获得出牌返回')
        if(data.code == 0)
        {
            console.log('出牌成功');
            this.removeMyCard(this.cardArr);
            this.cardArr = [];
        }
    }

    /**点击过*/
    private playNo():void
    {        
        var data = new BaseMsg();
        data.command = Commands.PLAYER_PLAYCARD;
        data.content = { roomId:this.roomId, index:this.mySeat, curCards:{ type:CARD_TYPE.PASS_CARDS, cards:[]}};
        NetController.getInstance().sendData(data, this.onPlayCardBack, this);
    }

    /**抢地主*/
    private wantDizhu(e:egret.TouchEvent):void
    {
        let score = parseInt(e.target.name);
        var data = new BaseMsg();
        data.command = Commands.PLAYER_WANTDIZHU;
        data.content = { roomId:this.roomId, index:this.mySeat, score:score};
        NetController.getInstance().sendData(data, this.onWantDizhuBack, this);
    }

    private onWantDizhuBack(data:BaseMsg):void
    {
        console.log('获得抢地主返回')
        if(data.code == 0)
        {
            console.log('抢地主成功');
            this.score0.visible = false;
            this.score1.visible = false;
            this.score2.visible = false;
            this.score3.visible = false;
        }
    }

/**=========================抢地主逻辑=============================*/

}