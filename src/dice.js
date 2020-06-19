// placeholder example from React website

'use strict';

const e = React.createElement;

class Die extends React.Component {
    render() {
        if (this.props.value === 6) {
            console.log("nice");
        }

        return (
            <button className="die" onClick={() => this.props.onClick()}>
                {this.props.value}
            </button>
        );
    }
}

class RollButton extends React.Component {
    render() {
        return (
            <button className="roll-button" onClick={() => this.props.onClick()}>
                Roll again!
            </button>
        );
    }
}

class DiceSet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dice: Array(5).fill(1),
        };
    }


    handleClick(i) {
        const dice = this.state.dice.slice();
        dice[i] = 2;
        this.setState({ dice: dice });
    }

    randomRoll() {
        return Math.floor(Math.random() * Math.floor(5)) + 1;
    }

    renderDie(i) {
        return <Die
            value={this.state.dice[i]}
            onClick={() => this.handleClick(i)}
        />;
    }

    generateRoll() {
        const dice = this.state.dice.slice().map(this.randomRoll);
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
