// TypeScript file
class CardUtils
{
    private static _instance:CardUtils
    public static getInstance(){
    if(!this._instance){
        this._instance = new CardUtils();
    }
    return this._instance;
	}
}