// TODO: split this beast up into sensible chunks

'use strict';

const e = React.createElement;

// utilities
function arraysEqual(arr1, arr2){
    if(arr1.length !== arr2.length){
        return false;
    }
    for(let i=0; i < arr1.length; i++){
        if (arr1[i] !== arr2[i]){
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
            <td onClick={() => props.onClick()}>{props.data.value}</td>
        </tr>
    )
}

class ScoreType {

    score_name = "";

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
class DiceScores {
    constructor() {
        this.score_set = {
            "three_kind": new ThreeKindScore(),
            "four_kind": new FourKindScore(),
            "full_house": new FullHouseScore(),
            "yahtzee": new YahtzeeScore(),
            "chance": new ChanceScore()
        };
    }
    getNames() {
        return Object.keys(this.score_set);
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
        if (this.state.rollNumber === 3 || this.state.turnOver) {
            return
        }
        this.state.rollNumber = this.state.rollNumber + 1;  // being explicit
        let dice = this.state.dice.slice();
        dice = dice.map(
            (item) => {
                item.value = item.hold ? item.value : this.randomRoll();
                return item;
            });
        if (this.state.turnOver === 3) {
            this.state.turnOver = true;
        }
        this.setState({ dice: dice });
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
        this.generateRoll();
        this.deselectAll()
        this.setState(
            {
                scores: Object.values(this.state.scores).map((score) => " "),
                rollNumber: 1
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
        } else {
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

    render() {
        const status = 'Roll number: ' + this.state.rollNumber;

        return (
            <div>
                <div className="alert">{this.renderMessageAlert()}</div>
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
                <div className="score-sheet">
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.score_refs.getNames().map(
                                score => (
                                    this.renderScore(score)
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

const domContainer = document.querySelector('#dice-area');
ReactDOM.render(e(GameArea), domContainer);
