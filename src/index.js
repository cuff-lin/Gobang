// Class
class Gobang {
    constructor(options) {
        this.options = options
        this.gobang = document.getElementById(options.canvas || 'gobang')
        this.chessboard = this.gobang.children[0]
        this.chessmans = this.gobang.children[1]

        // 棋盘样式
        this.gobangStyle = Object.assign({
            padding: 30,
            count: 15
        }, options.gobangStyle || {})

        // 棋盘元素
        this.lattice = {
            width: (this.gobang.clientWidth - this.gobangStyle.padding * 2) / this.gobangStyle.count,
            height: (this.gobang.clientHeight - this.gobangStyle.padding * 2) / this.gobangStyle.count
        }
        // 初始化
        this.resetAndInit()
    }
    // 初始化
    resetAndInit() {
        const {options} = this
        // 角色 => 1黑旗子 2白旗
        this.role = options.role || this.role || 1
        // 是否已分出胜负
        this.win = false
        // 走棋记录
        this.history = []
        // 当前步
        this.currentStep = 0
        // 清空棋子和事件
        this.chessmans.onclick = null
        this.chessmans.innerHTML = ''
        // 初始化
        this.drawChessboard()
        this.listenDownChessman()
        this.initChessboardMatrix()
    }
    // 棋盘矩阵
    initChessboardMatrix() {
        const checkerboard = []
        for(let x = 0; x < this.gobangStyle.count + 1; x++) {
            checkerboard[x] = []
            for(let y = 0; y < this.gobangStyle.count + 1; y++) {
                checkerboard[x][y] = 0
            }
        }
        this.checkerboard = checkerboard
    }
    // 刻画棋盘
    drawChessboard() {
        const {
            gobangStyle,
            gobang
        } = this
        // 棋盘网格
        const lattices = Array.from({
            length: gobangStyle.count * gobangStyle.count
        }, () => `<span class="lattice"></span>`).join('')
        this.chessboard.className = `chessboard lattice-${gobangStyle.count}`
        this.chessboard.innerHTML = lattices
        this.gobang.style.border = `${gobangStyle.padding}px solid #ddd`
    }
    // 刻画棋子
    drawChessman(x, y, isBlack) {
        const {
            gobangStyle,
            lattice,
            gobang
        } = this
        const newChessman = document.createElement('div')
        newChessman.setAttribute('id', `x${x}-y${y}-r${isBlack ? 1 : 2}`)
        newChessman.className = isBlack ? 'chessman black' : 'chessman white'
        newChessman.style.width = lattice.width * 0.6
        newChessman.style.height = lattice.height * 0.6
        newChessman.style.left = (x * lattice.width) - lattice.width * 0.3
        newChessman.style.top = (y * lattice.height) - lattice.height * 0.3
        this.chessmans.appendChild(newChessman)
        // 每次落子结束都要判断输赢
        setTimeout(() => {
            this.checkReferee(x, y, isBlack ? 1 : 2)
        }, 0)
    }
    // 落子
    listenDownChessman(isBlack = false) {
        this.chessmans.onclick = event => {
            // 如果点击的是棋子则中断
            if(event.target.className.includes('chessman ')) {
                return false
            }
            let {
                offsetX: x,
                offsetY: y
            } = event
            x = Math.round(x / this.lattice.width)
            y = Math.round(y / this.lattice.height)
            // 空的棋位才可落子
            if(this.checkerboard[x][y] !== undefined &&
                Object.is(this.checkerboard[x][y], 0)) {

                // 落子后，更新矩阵，切换角色，并记录
                this.checkerboard[x][y] = this.role
                this.drawChessman(x, y, Object.is(this.role, 1))

                // 落子完毕后，有可能是悔棋之后落子的，这种情况下就该重置历史记录
                this.history.length = this.currentStep
                this.history.push({
                    x,
                    y,
                    role: this.role
                })
                // 保存坐标，角色，快照
                this.currentStep++
                this.role = Object.is(this.role, 1) ? 2 : 1
            }
        }
    }
    // 判断输赢
    checkReferee(x, y, role) {
        if((x == undefined) || (y == undefined) || (role == undefined)) return

        // 连杀分数
        let countContinuous = 0

        // 所在矩阵数据
        const XContinuous = this.checkerboard.map(x => x[y])
        const YContinuous = this.checkerboard[x]
        const S1Continuous = []
        const S2Continuous = []
        this.checkerboard.forEach((_y, i) => {
            // 左斜线
            const S1Item = _y[y - (x - i)]
//					alert(S1Item)
            if(S1Item !== undefined) {
                S1Continuous.push(S1Item)
            }

            // 右斜线
            const S2Item = _y[y + (x - i)]
            if(S2Item !== undefined) {
                S2Continuous.push(S2Item)
            }
        })

        // 当前落棋点所在的X轴/Y轴/交叉斜轴，只要有能连起来的5个子的角色即有胜者
        ;
        [XContinuous, YContinuous, S1Continuous, S2Continuous].forEach(axis => {
            if(axis.some((x, i) => axis[i] !== 0 &&
                    axis[i - 2] === axis[i - 1] &&
                    axis[i - 1] === axis[i] &&
                    axis[i] === axis[i + 1] &&
                    axis[i + 1] === axis[i + 2])) {
                countContinuous++
            }
        })

        // 如果赢了，则解绑事件
        if(countContinuous) {
            this.chessmans.onclick = null
            this.win = true
            alert((role == 1 ? '黑' : '白') + '子胜')
        }
    }
    // 悔棋
    regretChess() {

        // 找到最后一次的记录，回滚UI，更新矩阵
        if(this.history.length && !this.win) {
            const prev = this.history[this.currentStep - 1]
            if(prev) {
                const {
                    x,
                    y,
                    role
                } = prev
                const targetChessman = document.getElementById(`x${x}-y${y}-r${role}`)
                targetChessman.parentNode.removeChild(targetChessman)
                this.checkerboard[prev.x][prev.y] = 0
                this.currentStep--
                this.role = Object.is(this.role, 1) ? 2 : 1
            }
        }
    }
    // 撤销悔棋
    revokedRegretChess() {
        const next = this.history[this.currentStep]
        if(next) {
            this.drawChessman(next.x, next.y, next.role === 1)
            this.checkerboard[next.x][next.y] = next.role
            this.currentStep++
            this.role = Object.is(this.role, 1) ? 2 : 1
        }
    }
}
// 实例化游戏
const gobangGame = new Gobang({
    role: 2,
    canvas: 'game',
    gobangStyle: {
        padding: 30,
        count: 16
    }
})
