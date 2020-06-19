// placeholder example from React website

'use strict';

const e = React.createElement;

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
        <tr>
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

    static getScore(diceValues) {
        throw new Error("Must override getScore method");
    }
}

class YahtzeeScore extends ScoreType {

    score_name = "Yahtzee";

    getScore(diceValues) {
        console.log("yaaahh");
        console.log(diceValues);
        let unique = new Set(diceValues);
        if (unique.size == 1) {
            return 50;
        }
        return 0;
    }
}
class ChanceScore extends ScoreType {

    score_name = "Chance";

    getScore(diceValues) {
        console.log("calculate score");
        console.log(diceValues);
        return diceValues.reduce((x, y) => x + y);
    }

}
class DiceScores {
    constructor() {
        this.score_set = {
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
            scores: {}
        };
        Object.values(this.state.score_refs.getNames()).map((score) => this.state.scores[score] = " ");
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
        if (this.state.rollNumber == 3) {
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
    }

    renderRollButton() {
        return <RollButton
            onClick={() => this.generateRoll()}
        />;
    }

    newGame() {
        this.generateRoll();
        let dice = this.state.dice.slice();
        dice = dice.map(
            (item) => {
                item.hold = false;
                return item;
            });
        this.setState(
            {
                scores: Object.values(this.state.scores).map((score) => " "),
                dice: dice,
                rollNumber: 1
            }
        )
    }

    renderNewGameButton() {
        return <NewGameButton
            onClick={() => this.newGame()}
        />;
    }

    updateScore(func, diceVals) {
        func(diceVals);
    }

    renderScore(score) {
        let dice_vals = this.state.dice.slice().map(
            (die) => die.value
        );
        console.log("rendereing");
        let data = {
            score_name: score,
            value: this.state.scores[score]
        }
        console.log(this.state.score_refs.score_set[score]);
        return <ScoreRow
            data={data} 
            onClick={() => this.state.score_refs.score_set[score].getScore(dice_vals)}
        />;
    }

    render() {
        const status = 'Roll number: ' + this.state.rollNumber;

        return (
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
                <div className="score-sheet">
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* TODO: this will be a loop */}
                            {this.renderScore("yahtzee")}
                            {this.renderScore("chance")}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

const domContainer = document.querySelector('#dice-area');
ReactDOM.render(e(GameArea), domContainer);
