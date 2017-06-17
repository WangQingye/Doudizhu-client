var NetController = (function () {
    function NetController() {
        this.sequence = 1;
        /**用来存储对应sequence的回调函数，在得到服务器返回后执行*/
        this.callBackPool = {};
        this.dispatcher = new egret.EventDispatcher();
    }
    var d = __define,c=NetController,p=c.prototype;
    NetController.getInstance = function () {
        if (!this._instance) {
            this._instance = new NetController();
        }
        return this._instance;
    };
    p.connect = function () {
        if (!this.ws) {
            this.ws = new WS();
            this.ws.connect("192.168.0.103", 8181);
        }
    };
    /**读取数据*/
    p.readData = function (msg) {
        var seq = msg.seq;
        if (seq) {
            console.log('来自服务器的返回消息 ：' + msg);
            var callBack = this.callBackPool[seq];
            if (callBack) {
                callBack.callback.call(callBack.thisObj, msg);
                this.callBackPool[seq] = null;
            }
            delete this.callBackPool[seq];
        }
        else {
            console.log('来自服务器的主动消息 ：' + msg);
            this.dispatcher.dispatchEventWith(msg.command + '', false, msg);
        }
    };
    /**发送数据*/
    p.sendData = function (data, callback, thisObj) {
        if (callback === void 0) { callback = null; }
        data.seq = this.sequence++;
        this.ws.sendData(JSON.stringify(data));
        if (callback && thisObj) {
            this.callBackPool[data.seq] = { callback: callback, thisObj: thisObj };
        }
    };
    /**打印*/
    p.showState = function (s) {
        console.log(s);
    };
    return NetController;
}());
egret.registerClass(NetController,'NetController');
/**基本的消息格式*/
var BaseMsg = (function () {
    function BaseMsg() {
    }
    var d = __define,c=BaseMsg,p=c.prototype;
    return BaseMsg;
}());
egret.registerClass(BaseMsg,'BaseMsg');
/**基本操作代码*/
var Commands = (function () {
    function Commands() {
    }
    var d = __define,c=Commands,p=c.prototype;
    Commands.SYSTEM_MSG = 1;
    Commands.REGISTER = 2;
    Commands.LOGIN = 3;
    Commands.MATCH_PLAYER = 4;
    Commands.PLAY_GAME = 5;
    return Commands;
}());
egret.registerClass(Commands,'Commands');
//# sourceMappingURL=NetController.js.map