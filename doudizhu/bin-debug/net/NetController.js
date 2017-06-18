var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var NetController = (function () {
    function NetController() {
        this.sequence = 1;
        /**用来存储对应sequence的回调函数，在得到服务器返回后执行*/
        this.callBackPool = {};
        this.dispatcher = new egret.EventDispatcher();
    }
    NetController.getInstance = function () {
        if (!this._instance) {
            this._instance = new NetController();
        }
        return this._instance;
    };
    NetController.prototype.connect = function () {
        if (!this.ws) {
            this.ws = new WS();
            this.ws.connect("192.168.0.101", 8181);
        }
    };
    /**读取数据*/
    NetController.prototype.readData = function (msg) {
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
    /**接收到数据时都事件监听*/
    NetController.prototype.addListener = function (command, obj) {
        this.dispatcher.addEventListener(command + '', function (e) { obj.onReciveMsg(e.data); }, this);
    };
    /**发送数据*/
    NetController.prototype.sendData = function (data, callback, thisObj) {
        if (callback === void 0) { callback = null; }
        data.seq = this.sequence++;
        this.ws.sendData(JSON.stringify(data));
        if (callback && thisObj) {
            this.callBackPool[data.seq] = { callback: callback, thisObj: thisObj };
        }
    };
    /**打印*/
    NetController.prototype.showState = function (s) {
        console.log(s);
    };
    return NetController;
}());
__reflect(NetController.prototype, "NetController");
/**基本的消息格式*/
var BaseMsg = (function () {
    function BaseMsg() {
    }
    return BaseMsg;
}());
__reflect(BaseMsg.prototype, "BaseMsg");
/**基本操作代码*/
var Commands = (function () {
    function Commands() {
    }
    return Commands;
}());
Commands.SYSTEM_MSG = 1;
Commands.REGISTER = 2;
Commands.LOGIN = 3;
Commands.MATCH_PLAYER = 4;
Commands.PLAY_GAME = 5;
Commands.ROOM_NOTIFY = 6;
__reflect(Commands.prototype, "Commands");
//# sourceMappingURL=NetController.js.map