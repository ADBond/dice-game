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

class DiceSet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dice: Array(5).fill().map(() => ({"value": "-", "hold": false})),
            rollNumber: 0,
        };
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
        if (this.state.rollNumber == 3){
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
        let dice = Array(5).fill().map(() => ({"value": "-", "hold": false}));
        this.setState({ dice: dice});
    }

    renderNewGameButton() {
        return <NewGameButton
            onClick={() => this.newGame()}
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
            </div>
        );
    }
}

const domContainer = document.querySelector('#dice-area');
ReactDOM.render(e(DiceSet), domContainer);
