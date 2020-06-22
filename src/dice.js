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
        <button className="roll-button" onClick={() => props.onClick()}>
            Roll again!
        </button>
    );
}

function NewGameButton(props) {
    return (
        <button className="new-game-button" onClick={() => props.onClick()}>
            New game
        </button>
    );
}

function ScoreRow(props) {
    return (
        <tr id={"score-row-" + props.data.score_name}>
            <td>{props.data.score_name}</td>
            <td className="score-value" onClick={() => props.onClick()}>{props.data.value}</td>
        </tr>
    )
}

class ScoreType {

    // Don't use this, so just allow the error if we try to access it!
    // score_name = "";  

    constructor() {
        if (this.constructor == ScoreType) {
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
        console.log("Number score " + number);
        super();
        this.number = number;
        this.getScore = this.getScoreGeneric(number);
    }

    get score_name() {
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
        //return (diceValues) => number * ScoreType.getCounts(diceValues)[number];
        let func = function (diceValues) {
            console.log(diceValues);
            console.log("yeaaaaa");
            console.log(ScoreType.getCounts(diceValues));
            return number * ScoreType.getCounts(diceValues)[number - 1];
        }
        return func;
    }
}

class YahtzeeScore extends ScoreType {

    score_name = "Yahtzee";

    getScore(diceValues) {
        if (ScoreType.mostNumerous(diceValues) == 5) {
            return 50;
        }
        return 0;
    }
}
class ChanceScore extends ScoreType {

    score_name = "Chance";

    getScore(diceValues) {
        return ScoreType.diceSum(diceValues);
    }

}
class FullHouseScore extends ScoreType {

    score_name = "Full House";

    getScore(diceValues) {
        let countVals = ScoreType.getCountVals(diceValues);
        let desired = [0, 2, 3];  // defines full house
        // TODO: should probably let yahtzee be a degenerate full house
        if (arraysEqual(countVals, desired)) {
            return 25;
        }
        return 0;
    }
}

class ThreeKindScore extends ScoreType {

    score_name = "Three of a Kind";

    getScore(diceValues) {
        if (ScoreType.mostNumerous(diceValues) >= 3) {
            return ScoreType.diceSum(diceValues);
        }
        return 0;
    }

}
class FourKindScore extends ScoreType {

    score_name = "Four of a Kind";

    getScore(diceValues) {
        if (ScoreType.mostNumerous(diceValues) >= 4) {
            return ScoreType.diceSum(diceValues);
        }
        return 0;
    }

}

class SmallStraightScore extends ScoreType {

    score_name = "Small Straight";

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

    score_name = "Long Straight";

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
        this.top_half = {
            "aces": new NumberScore(1),
            "twos": new NumberScore(2),
            "threes": new NumberScore(3),
            "fours": new NumberScore(4),
            "fives": new NumberScore(5),
            "sixes": new NumberScore(6)
        };
        this.bottom_half = {
            "three_kind": new ThreeKindScore(),
            "four_kind": new FourKindScore(),
            "full_house": new FullHouseScore(),
            "small_straight": new SmallStraightScore(),
            "long_straight": new LongStraightScore(),
            "yahtzee": new YahtzeeScore(),
            "chance": new ChanceScore()
        };
    }
    get score_set() {
        return { ...this.top_half, ...this.bottom_half };
    }
    getNames() {
        return Object.keys(this.score_set);
    }
    getTopHalfNames() {
        return Object.keys(this.top_half)
    }
    getBottomHalfNames() {
        return Object.keys(this.bottom_half)
    }
}

class GameArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dice: Array(5).fill().map(() => ({ "value": this.randomRoll(), "hold": false })),
            rollNumber: 1,
            score_refs: new DiceScores(),
            scores: {},
            turnOver: false,
            gameFinished: false,
            message: ""
        };
        Object.values(this.state.score_refs.getNames()).map((score) => this.state.scores[score] = " ");
    }

    renderMessageAlert() {
        // TODO: better semantics
        return <h3>
            {this.state.message}
        </h3>
    }

    handleClick(i) {
        const dice = this.state.dice.slice();
        console.log(dice);
        console.log(i);
        console.log(dice[i]);
        dice[i].hold = !dice[i].hold;
        console.log(dice);
        this.setState({ dice: dice });
    }

    randomRoll() {
        return Math.floor(Math.random() * 6) + 1;
    }

    renderDie(i) {
        return <Die
            data={this.state.dice[i]}
            onClick={() => this.handleClick(i)}
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
        return <RollButton
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
        let scores = {};
        Object.keys(this.state.scores).map((score) => scores[score] = " ");
        console.log(scores);
        this.generateRoll();
        this.deselectAll()
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
            this.state.message = "You must roll before entering a score!";
            return
        } else if (this.state.scores[score] !== " ") {
            console.log("score is (" + this.state.scores[score] + ")");
            this.state.message = "You cannot enter the same category of score twice!";
            return
        }
        else {
            this.state.message = "";
        }
        this.state.scores[score] = func(diceVals);
        // TODO: check if we are finished the game!
        this.state.turnOver = false;
        this.state.rollNumber = 0;
        this.deselectAll();
    }

    renderScore(score) {
        let dice_vals = this.state.dice.slice().map(
            (die) => die.value
        );
        console.log("rendereing");
        let score_name = this.state.score_refs.score_set[score].score_name;
        let data = {
            score_name: score_name,
            value: this.state.scores[score]
        }
        console.log(this.state.score_refs.score_set[score]);
        let score_func = this.state.score_refs.score_set[score].getScore;
        return <ScoreRow
            key={score_name}
            data={data}
            onClick={() => this.updateScore(score, score_func, dice_vals)}
        />;
    }

    get topHalfSub() {
        let score_names = this.state.score_refs.getTopHalfNames();
        let scores = score_names.map((score_name) => this.state.scores[score_name]);
        if (scores.includes(" ")) {
            return " ";
        }
        return ScoreType.diceSum(scores);
    }

    get bottomHalfTotal() {
        let score_names = this.state.score_refs.getBottomHalfNames();
        let scores = score_names.map((score_name) => this.state.scores[score_name]);
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


    render() {
        const status = 'Roll number: ' + this.state.rollNumber;

        return (
            <div>
                <div>
                    <div className="new-game">{this.renderNewGameButton()}</div>
                    <div className="status">{status}</div>
                    <div className="dice-holder">
                        {this.renderDie(0)}
                        {this.renderDie(1)}
                        {this.renderDie(2)}
                        {this.renderDie(3)}
                        {this.renderDie(4)}
                    </div>
                    {this.renderRollButton()}
                    <div className="alert">{this.renderMessageAlert()}</div>
                </div>
                <div className="score-sheet">
                    <table id="score-table">
                        <colgroup>
                            <col span="1" style={{width: "60%"}}></col>
                            <col span="1" style={{width: "40%"}}></col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* TODO: the score name functions can probably be static, no? */}
                            {this.state.score_refs.getTopHalfNames().map(
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
                            {this.state.score_refs.getBottomHalfNames().map(
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
