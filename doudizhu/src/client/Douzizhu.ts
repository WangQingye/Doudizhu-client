// TypeScript file

class Doudizhu extends eui.Component
{
    private start:eui.Button;
    private start_tip:eui.Image;
    private playerName:string;
    private static _instance:Doudizhu;

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
        NetController.getInstance().addListener(Commands.ROOM_NOTIFY, this);
        NetController.getInstance().addListener(Commands.PLAY_GAME, this);
        NetController.getInstance().connect();
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
        console.warn('onReciveMsg');
        let command = data.command;
        switch (command)
        {
            case Commands.ROOM_NOTIFY:
                this.onReciveRoomNotify(data.content);
                break;
            case Commands.PLAY_GAME:
                this.onRecivePlayGame(data.content);
            /*留下其他*/
        }
    }

    /**房间消息*/
    private onReciveRoomNotify(content):void
    {
        //2是结算，1是游戏中, 0是第一次发牌
        let state = content.state;
        if(state == undefined) return;
        switch(state)
        {
            case 0 :
                let cards = content.cards;
                console.log('cards',cards);
                this.refreshMyCard(cards.sort(function(a,b){return b-a}));
                break;
        }
    }


    private rect_1:eui.Rect;
    private rect_2:eui.Rect;
    private rect_3:eui.Rect;
    private btn_yes:eui.Button;
    private btn_no:eui.Button;
    /**游戏进程消息*/
    private onRecivePlayGame(content):void
    {
        let seat = content.curPlayerIndex;
        this.showRect(seat);
        console.log('onRecivePlayGame', content);
    }

    private showRect(index:number):void
    {
        if(index == this.leftSeat)
        {
            this.rect_1.visible = true;
            this.rect_2.visible = false;
            this.rect_3.visible = false;            
            this.btn_no.visible = false;
            this.btn_yes.visible = false;
            
        }else if(index == this.mySeat)
        {
            this.rect_1.visible = false;
            this.rect_2.visible = true;
            this.rect_3.visible = false;
            this.btn_no.visible = true;
            this.btn_yes.visible = true;
        }else if(index == this.rightSeat)
        {
            this.rect_1.visible = false;
            this.rect_2.visible = false;
            this.rect_3.visible = true;
            this.btn_no.visible = false;
            this.btn_yes.visible = false;
        }
    }


    /**扑克显示*/
    private my_poker:eui.Group;
    private right_poker:eui.Group;
    private left_poker:eui.Group;
    /**准备出的牌，根据这个数组里的牌来判断是否可以出牌*/
    private onTouchPoker: Array<number>; 
    private refreshMyCard(arr:[number]):void
    {
        for(let i = 0; i < arr.length; i++)
        {
            let card = <Card>this.my_poker.getChildAt(i);
            card.index = arr[i];
        }
    }

    private onMyTurn:boolean = false; //是否该我出牌
    private cardArr:Array<Card> = [];//准备出的牌组（点起来的）
    private cardOnTouch(e:egret.TouchEvent):void
    {
        //if(!this.onMyTurn) return; //不该我出牌的时候点不动
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
    };

    /**移除他人的扑克牌，只需要知道几张，和几号位*/
    private removeOtherCard(num:number, seat:number):void
    {
        while(num)
        {
            if(seat == this.rightSeat)
            {
                this.right_poker.removeChildAt(this.right_poker.numChildren - 1);
            }else
            {
                this.left_poker.removeChildAt(this.right_poker.numChildren - 1);
            }
            num--;
        }
    }

    /**自己的牌需要根据序号来移除*/
    private removeMyCard(point:number):void
    {
        for(let i = 0; i < this.my_poker.numChildren; i++)
         {
             this.my_poker.getChildAt(i)
         }
    }



}