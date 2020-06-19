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
        <tr className={"score-completed-" + props.data.scored}>
            <td>{props.data.score_name}</td>
            <td onClick={() => props.onClick()}>{props.data.value}</td>
        </tr>
    )
}

class ScoreType {

    score_name = "";
    value = " ";

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
    scored = false;

    getScore(diceValues) {
        console.log("yaaahh");
        console.log(diceValues);
        let unique = new Set(diceValues);
        if (unique.size == 1) {
            this.value = 50;
        } else {
            this.value = 0;
        }
        this.scored = true;
    }
}
class ChanceScore extends ScoreType {

    score_name = "Chance";
    scored = false;

    getScore(diceValues) {
        console.log("calculate score");
        console.log(diceValues);
        this.value = diceValues.reduce((x, y) => x + y);
        this.scored = true;
    }

}
class DiceScores {
    constructor() {
        this.score_set = {
            "yahtzee": new YahtzeeScore(),
            "chance": new ChanceScore()
        };
    }
}

class GameArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dice: Array(5).fill().map(() => ({ "value": "-", "hold": false })),
            rollNumber: 0,
            scores: new DiceScores()
        };
        //this.generateRoll();
        console.log(this.state.scores);
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
        this.state.rollNumber = 0;
        this.generateRoll();
    }

    renderNewGameButton() {
        return <NewGameButton
            onClick={() => this.newGame()}
        />;
    }

    updateScore(func, diceVals) {
        return func(diceVals);
    }

    renderScore(score) {
        console.log(this.state.scores.score_set[score]);
        let score_data = this.state.scores.score_set[score];
        let dice_vals = this.state.dice.slice().map(
            (die) => die.value
        );
        return <ScoreRow
            data={score_data} // TODO: how much need we pass?
            onClick={() => score_data.getScore(dice_vals)}
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
