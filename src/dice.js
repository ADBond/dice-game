// TODO: split this beast up into sensible chunks

'use strict';

const e = React.createElement;

// utilities
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

function Die(props) {
    return (
        <button className={"die die-" + props.data.hold} onClick={() => props.onClick()}>
            {props.data.value}
        </button>
    );
}

function RollButton(props) {
    return (
        <button className={"action-buttons " + props.className} id="roll-button" onClick={() => props.onClick()}>
            Roll again!
        </button>
    );
}

function NewGameButton(props) {
    return (
        <button className="action-buttons" id="new-game-button" onClick={() => props.onClick()}>
            New game
        </button>
    );
}

function ScoreRow(props) {
    return (
        <tr id={"score-row-" + props.data.scoreName}>
            <td>{props.data.scoreName}</td>
            <td className="score-value" onClick={() => props.onClick()}>{props.data.value}</td>
        </tr>
    )
}

class ScoreType {

    constructor() {
        if (this.constructor === ScoreType) {
            throw new Error("Can't instantiate abstract ScoreType class");
        }
    }

    getScore(diceValues) {
        throw new Error("Must override getScore method");
    }

    // TODO: not sure if this class is the best place for all these utilities
    static getCounts(diceValues) {
        let counts = Array(6).fill(0);
        diceValues.forEach((die) => counts[die - 1]++);
        return counts;
    }

    static getCountVals(diceValues) {
        let counts = ScoreType.getCounts(diceValues);
        let countVals = [...new Set(counts)];
        countVals.sort();
        return countVals;
    }

    static diceSum(diceValues) {
        return diceValues.reduce((x, y) => x + y);
    }

    // how often does the most often number appear?
    static mostNumerous(diceValues) {
        let counts = ScoreType.getCountVals(diceValues);
        return counts.reduce(
            (x, y) => Math.max(x, y)
        );
    }
}

class NumberScore extends ScoreType {
    number = ""

    constructor(number) {
        super();
        this.number = number;
        this.getScore = this.getScoreGeneric(number);
    }

    get scoreName() {
        return {
            1: "Aces",
            2: "Twos",
            3: "Threes",
            4: "Fours",
            5: "Fives",
            6: "Sixes"
        }[this.number]
    }

    getScoreGeneric(number) {
        let func = function (diceValues) {
            return number * ScoreType.getCounts(diceValues)[number - 1];
        }
        return func;
    }
}

class YahtzeeScore extends ScoreType {

    scoreName = "Yahtzee";

    getScore(diceValues) {
        if (ScoreType.mostNumerous(diceValues) === 5) {
            return 50;
        }
        return 0;
    }
}
class ChanceScore extends ScoreType {

    scoreName = "Chance";

    getScore(diceValues) {
        return ScoreType.diceSum(diceValues);
    }

}
class FullHouseScore extends ScoreType {

    scoreName = "Full House";

    getScore(diceValues) {
        let countVals = ScoreType.getCountVals(diceValues);
        let desired = [0, 2, 3];  // defines full house
        // TODO: should probably let yahtzee be a degenerate full house
        // although not strictly in specs
        if (arraysEqual(countVals, desired)) {
            return 25;
        }
        return 0;
    }
}

class ThreeKindScore extends ScoreType {

    scoreName = "Three of a Kind";

    getScore(diceValues) {
        if (ScoreType.mostNumerous(diceValues) >= 3) {
            return ScoreType.diceSum(diceValues);
        }
        return 0;
    }

}
class FourKindScore extends ScoreType {

    scoreName = "Four of a Kind";

    getScore(diceValues) {
        if (ScoreType.mostNumerous(diceValues) >= 4) {
            return ScoreType.diceSum(diceValues);
        }
        return 0;
    }

}

class SmallStraightScore extends ScoreType {

    scoreName = "Small Straight";

    getScore(diceValues) {
        // TODO: is there a better way? others I can think of off-hand seem kind of convoluted
        if ((diceValues.includes(3) && diceValues.includes(4)) &&
            ((diceValues.includes(1) && diceValues.includes(2)) || (diceValues.includes(2) && diceValues.includes(5))
                || (diceValues.includes(5) && diceValues.includes(6)))
        ) {
            return 30;
        }
        return 0;
    }
}
class LongStraightScore extends ScoreType {

    scoreName = "Long Straight";

    getScore(diceValues) {
        // TODO: is there a better way? others I can think of off-hand seem kind of convoluted
        if (diceValues.includes(2) && (diceValues.includes(3) && diceValues.includes(4) && diceValues.includes(5)) &&
            (diceValues.includes(1) || diceValues.includes(6))
        ) {
            return 40;
        }
        return 0;
    }
}

class DiceScores {
    constructor() {
        this.topHalf = {
            "aces": new NumberScore(1),
            "twos": new NumberScore(2),
            "threes": new NumberScore(3),
            "fours": new NumberScore(4),
            "fives": new NumberScore(5),
            "sixes": new NumberScore(6)
        };
        this.bottomHalf = {
            "three_kind": new ThreeKindScore(),
            "four_kind": new FourKindScore(),
            "full_house": new FullHouseScore(),
            "small_straight": new SmallStraightScore(),
            "long_straight": new LongStraightScore(),
            "yahtzee": new YahtzeeScore(),
            "chance": new ChanceScore()
        };
    }
    get scoreSet() {
        return { ...this.topHalf, ...this.bottomHalf };
    }
    getNames() {
        return Object.keys(this.scoreSet);
    }
    getTopHalfNames() {
        return Object.keys(this.topHalf)
    }
    getBottomHalfNames() {
        return Object.keys(this.bottomHalf)
    }
}

class GameArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dice: Array(5).fill().map(() => ({ "value": this.randomRoll(), "hold": false })),
            rollNumber: 1,
            scoreRefs: new DiceScores(),
            scores: {},
            turnOver: false,
            gameFinished: false,
            message: ""
        };
        Object.values(this.state.scoreRefs.getNames()).map((score) => this.state.scores[score] = " ");
    }

    renderMessageAlert() {
        return <div id="alert">
            {this.state.message}
        </div>
    }

    handleDieClick(i) {
        if ([0, 3].includes(this.state.rollNumber)) {
            return
        }
        const dice = this.state.dice.slice();
        dice[i].hold = !dice[i].hold;
        this.setState({ dice: dice });
    }

    randomRoll() {
        return Math.floor(Math.random() * 6) + 1;
    }

    renderDie(i) {
        return <Die
            data={this.state.dice[i]}
            onClick={() => this.handleDieClick(i)}
        />;
    }

    generateRoll() {
        if (this.state.turnOver) {
            return
        }
        this.state.rollNumber = this.state.rollNumber + 1;  // being explicit
        let dice = this.state.dice.slice();
        dice = dice.map(
            (item) => {
                item.value = item.hold ? item.value : this.randomRoll();
                return item;
            });
        this.setState({ dice: dice });
        if (this.state.rollNumber === 3) {
            this.state.turnOver = true;
        }
    }

    renderRollButton() {
        let status = "usable";
        if (this.state.rollNumber === 3) {
            status = "unusable";
        }
        return <RollButton
            className={status}
            onClick={() => this.generateRoll()}
        />;
    }

    deselectAll() {
        let dice = this.state.dice.slice();
        dice = dice.map(
            (item) => {
                item.hold = false;
                return item;
            });
        this.setState({ dice: dice });
    }

    newGame() {
        if (!window.confirm("Are you sure you want to start a new game?")) {
            return
        }
        let scores = {};
        Object.keys(this.state.scores).map((score) => scores[score] = " ");
        this.deselectAll();
        this.generateRoll();
        this.setState(
            {
                scores: scores,
                rollNumber: 1,
                turnOver: false,
                gameFinished: false
            }
        )
    }

    renderNewGameButton() {
        return <NewGameButton
            onClick={() => this.newGame()}
        />;
    }

    updateScore(score, func, diceVals) {
        // TODO: messaging system not really set up in a helpful way
        if (this.state.rollNumber === 0) {
            console.log("yeah " + this.state.rollNumber);
            this.setState({ message: "You must roll before entering a score!" });
            return
        } else if (this.state.scores[score] !== " ") {
            console.log("yeassaah " + this.state.rollNumber);
            this.setState({ message: "You cannot enter the same category of score twice!" });
            return
        }
        this.setState({ message: "" });
        this.state.scores[score] = func(diceVals);
        // TODO: check if we are finished the game!
        this.state.turnOver = false;
        this.state.rollNumber = 0;
        this.deselectAll();
    }

    renderScore(score) {
        let diceVals = this.state.dice.slice().map(
            (die) => die.value
        );
        let scoreName = this.state.scoreRefs.scoreSet[score].scoreName;
        let data = {
            scoreName: scoreName,
            value: this.state.scores[score]
        }
        let scoreFunc = this.state.scoreRefs.scoreSet[score].getScore;
        return <ScoreRow
            key={scoreName}
            data={data}
            onClick={() => this.updateScore(score, scoreFunc, diceVals)}
        />;
    }

    get topHalfSub() {
        let scoreNames = this.state.scoreRefs.getTopHalfNames();
        let scores = scoreNames.map((scoreName) => this.state.scores[scoreName]);
        if (scores.includes(" ")) {
            return " ";
        }
        return ScoreType.diceSum(scores);
    }

    get bottomHalfTotal() {
        let scoreNames = this.state.scoreRefs.getBottomHalfNames();
        let scores = scoreNames.map((scoreName) => this.state.scores[scoreName]);
        if (scores.includes(" ")) {
            return " ";
        }
        return ScoreType.diceSum(scores);
    }

    get bonus() {
        if (this.topHalfSub === " ") {
            return " ";
        }
        if (this.topHalfSub >= 63) {
            return 35;
        }
        return 0;
    }

    get topHalfTotal() {
        if (this.bonus !== " ") {
            return this.topHalfSub + this.bonus;
        }
        return " ";
    }

    get grandTotal() {
        if (this.topHalfTotal === " " || this.bottomHalfTotal === " ") {
            return " ";
        }
        this.gameFinished = true;
        return this.topHalfTotal + this.bottomHalfTotal;
    }

    renderStatus(rollNumber) {
        return <h1 id="status">
            {'Roll number:  '} <span id="roll-number">{rollNumber}</span>
        </h1>
    }

    render() {
        if (this.state.rollNumber === 3) {
            this.state.message = "Please select a score category";
        } else {
            this.state.message = "";
        }

        return (
            <div>
                <div id="play-area">
                    {this.renderStatus(this.state.rollNumber)}
                    <div id="dice-holder">
                        {this.renderDie(0)}
                        {this.renderDie(1)}
                        {this.renderDie(2)}
                        {this.renderDie(3)}
                        {this.renderDie(4)}
                    </div>
                    {this.renderNewGameButton()}
                    {this.renderMessageAlert()}
                    {this.renderRollButton()}
                </div>
                <div id="score-sheet">
                    <table id="score-table">
                        <colgroup>
                            <col span="1" style={{ width: "60%" }}></col>
                            <col span="1" style={{ width: "40%" }}></col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* TODO: the score name functions can probably be static, no? */}
                            {this.state.scoreRefs.getTopHalfNames().map(
                                score => (
                                    this.renderScore(score)
                                )
                            )}
                            <tr>
                                <th>Top Half Sub-total</th>
                                <th>{this.topHalfSub}</th>
                            </tr>
                            <tr>
                                <th>Bonus</th>
                                <th>{this.bonus}</th>
                            </tr>
                            <tr>
                                <th>Top Half Total</th>
                                <th>{this.topHalfTotal}</th>
                            </tr>
                            {this.state.scoreRefs.getBottomHalfNames().map(
                                score => (
                                    this.renderScore(score)
                                )
                            )}
                            <tr>
                                <th>Bottom Half Total</th>
                                <th>{this.bottomHalfTotal}</th>
                            </tr>
                            <tr>
                                <th>Grand Total</th>
                                <th>{this.grandTotal}</th>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

const domContainer = document.querySelector('#dice-area');
ReactDOM.render(e(GameArea), domContainer);
