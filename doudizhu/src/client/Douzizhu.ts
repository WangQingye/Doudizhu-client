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
        console.log(1);
        this.skinName = "resource/test.exml"
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
        console.log(this.playerName);
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
        console.log("tipTween");
    }

    private my_id:eui.Label;
    private left_id:eui.Label;
    private leftSeat:number;
    private right_id:eui.Label;
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
        this.refreshMyCard([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
    }

    /**扑克显示*/
    private my_poker:eui.Group;
    private right_poker:eui.Group;
    private left_poker:eui.Group;

    private refreshMyCard(arr:[number]):void
    {
        for(let i = 0; i < arr.length; i++)
        {
            let card = <Card>this.my_poker.getChildAt(i);
            card.index = arr[i];
        }        
    }

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