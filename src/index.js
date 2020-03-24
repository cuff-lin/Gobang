/* 棋局类 */
class Gobang {
    constructor(optObj) {
        /* 配置项 */
        this.el = document.querySelector(optObj.el || '#gobang');/* 棋盘挂载元素 */
        this.sizeNum = optObj.sizeNum || 20;/* 棋子大小 */
        this.countNum = optObj.countNum || 15;/* 棋盘格子行列数量 */
        this.curRole = optObj.curRole || 1;/* 先下玩家角色 1-白 2-黑 默认白*/
        
        this.cellSizeNum = this.sizeNum + 7;/* 棋盘格子大小 */
        
        this.initFn();
        /* 监听新棋局动作 */
        this.el.addEventListener('click',this.playFn.bind(this),true);
    }
    /* 初始化当前棋局 */
    initFn(){
        this.historyArr = []; /* 快照历史 */
        this.curHisIndex = 0; /* 当前快照索引 */
        this.isEndBool = false; /* 当前棋局是否结束 */
        
        /* 初始化棋盘数据为空 */
        this.curCheckerArr = [];
        for(let x=0;x<=this.countNum;x++ ){
            this.curCheckerArr[x] = [];/* 创建行 */
            for(let y=0;y<=this.countNum;y++ ){
                this.curCheckerArr[x][y] = 0;/* 创建列并将棋盘坐标的棋子清空 0-空 1-白子 2-黑子 */
            }
        }
        /* 判断是重来还是第一次进入 */
        if(!this.checkerboardObj){
            this.checkerboardObj = this.createCheckerboardFn();
        }else {
            this.updateCheckerboardFn();
        }
    }
    /* 创建棋盘 */
    createCheckerboardFn(){
        let cellArr = Array.from({
            length:Math.pow(this.countNum,2)
        },()=>{
            return `<span class="cell" style="width:` + this.cellSizeNum + `px;height:` + this.cellSizeNum + `px;"></span>`;
        });
        let cellElStr = `<div class="cell-box">` + cellArr.join('') + `</div>`;
        this.el.style.width = this.cellSizeNum * this.countNum + 'px';
        this.el.style.height = this.cellSizeNum * this.countNum + 'px';
        this.el.innerHTML = cellElStr;
        this.el.className = 'gobang';
    }
    /* 更新棋盘 */
    updateCheckerboardFn(arr){
        this.curCheckerArr = [];
        for(let x=0;x<=this.countNum;x++ ){
            this.curCheckerArr[x] = [];/* 创建行 */
            for(let y=0;y<=this.countNum;y++ ){
                this.curCheckerArr[x][y] = 0;/* 创建列并将棋盘坐标的棋子清空 0-空 1-白子 2-黑子 */
            }
        }
    }
    /* 下棋 */
    playFn(e){
        /* 计算点击的坐标 */
        let x = Math.round(e.layerX / this.cellSizeNum);
        let y = Math.round(e.layerY / this.cellSizeNum);
        /* 判断点击位置是否存在棋子且当前局是否结束 */
        if(this.curCheckerArr[x][y] === 0 && !this.isEndBool){
            this.curCheckerArr[x][y] = this.curRole;
            this.createPieceFn(x,y);
            /* 下棋推到快照历史中 */
            this.historyArr.push({
                x,
                y,
                role:this.curRole
            })

            this.judgeFn();/* 判断输赢 */

            this.curHisIndex++;/* 快照版本索引 + 1 */
            this.curRole = this.curRole === 1 ? 2 : 1;/* 换角色 */

            /* 改变当前回合玩家 */
            let cellTipEl = document.getElementById('cell--tip');
            cellTipEl.className = newGameObj.curRole === 1 ? 'cell-tip--black' : 'cell-tip--white';
        }
    }
    /* 创建棋子 */
    createPieceFn(x,y){
        const pieceEl = document.createElement('div');
        pieceEl.className = this.curRole === 1 ? 'cell--black' : 'cell--white';
        pieceEl.style.width = this.sizeNum + 'px';
        pieceEl.style.height = this.sizeNum + 'px';
        pieceEl.style.left = (x * this.cellSizeNum - 0.5 * this.sizeNum) + 'px';
        pieceEl.style.top = (y * this.cellSizeNum - 0.5 * this.sizeNum)  + 'px';
        console.log(x,y);
        this.el.children[0].appendChild(pieceEl);
    }
    /* 判断输赢 */
    judgeFn(){
        
    }
}

