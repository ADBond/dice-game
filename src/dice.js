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

class DiceSet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dice: Array(5).fill().map(() => ({"value": 1, "hold": false}))
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
        return Math.floor(Math.random() * Math.floor(5)) + 1;
    }

    renderDie(i) {
        return <Die
            data={this.state.dice[i]}
            onClick={() => this.handleClick(i)}
        />;
    }

    generateRoll() {
        let dice = this.state.dice.slice();
        console.log(dice);
        dice = dice.map(
            (item) => {
                item.value = this.randomRoll();
                return item;
            });
        console.log(dice);
        this.setState({ dice: dice });
    }

    renderRollButton() {
        return <RollButton
            onClick={() => this.generateRoll()}
        />;
    }

    render() {
        const status = 'Roll number: 1';

        return (
            <div>
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
