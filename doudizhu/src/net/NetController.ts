class NetController
{
    private static _instance:NetController;
    private ws:WS;
    private sequence:number = 1;
    private dispatcher:egret.EventDispatcher;
    /**用来存储对应sequence的回调函数，在得到服务器返回后执行*/
    private callBackPool = {};

    public constructor(){
        this.dispatcher = new egret.EventDispatcher();
    }

    public static getInstance(){
		if(!this._instance){
			this._instance = new NetController();
		}
		return this._instance;
	}

    public connect():void
    {
        if(!this.ws)
        {
            this.ws = new WS();
            this.ws.connect("192.168.0.101", 8181);
        }
    }

    /**读取数据*/
    public readData(msg:BaseMsg):void
    {
        let seq = msg.seq;
        if(seq)
        {
            console.log('来自服务器的返回消息 ：' + msg);
            let callBack = this.callBackPool[seq];
            if(callBack)
            {
                callBack.callback.call(callBack.thisObj, msg);
                this.callBackPool[seq] = null;
            }
            delete this.callBackPool[seq];
        }else //没有seq说明是服务器主动发送的
        {
            console.log('来自服务器的主动消息 ：' + msg);
            this.dispatcher.dispatchEventWith(msg.command+'', false, msg);
        }
    }

    /**接收到数据时都事件监听*/
    public addListener(command, obj)
    {
        this.dispatcher.addEventListener(command+'', (e:egret.Event)=>{obj.onReciveMsg(e.data)}, this);
    }

    /**发送数据*/
    public sendData(data:BaseMsg, callback:Function = null, thisObj)
    {
        data.seq = this.sequence++;
        this.ws.sendData(JSON.stringify(data));

        if(callback && thisObj)
        {
            this.callBackPool[data.seq] = {callback:callback, thisObj:thisObj};
        }
    }

    /**打印*/
    public showState(s:string):void
    {
        console.log(s);
    }    
}

/**基本的消息格式*/
class BaseMsg {	
	public command: number;
	public code: number;
	public seq: number;
	public content: any;
}

/**基本操作代码*/
class Commands {
	public static SYSTEM_MSG = 1;
    public static REGISTER = 2;
    public static LOGIN = 3;
    public static MATCH_PLAYER = 4;
    public static PLAY_GAME = 5;
    public static ROOM_NOTIFY = 6;
    public static PLAYER_PLAYCARD = 7;
    public static PLAYER_WANTDIZHU = 8;
}