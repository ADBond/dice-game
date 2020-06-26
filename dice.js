// TODO: split this beast up into sensible chunks

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var e = React.createElement;

// utilities
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

function Die(props) {
    return React.createElement(
        "button",
        { className: "die die-" + props.data.hold, onClick: function onClick() {
                return props.onClick();
            } },
        props.data.value
    );
}

function RollButton(props) {
    return React.createElement(
        "button",
        { className: "action-buttons " + props.className, id: "roll-button", onClick: function onClick() {
                return props.onClick();
            } },
        "Roll again!"
    );
}

function NewGameButton(props) {
    return React.createElement(
        "button",
        { className: "action-buttons", id: "new-game-button", onClick: function onClick() {
                return props.onClick();
            } },
        "New game"
    );
}

function ScoreRow(props) {
    return React.createElement(
        "tr",
        { id: "score-row-" + props.data.scoreName },
        React.createElement(
            "td",
            null,
            props.data.scoreName
        ),
        React.createElement(
            "td",
            { className: "score-value", onClick: function onClick() {
                    return props.onClick();
                } },
            props.data.value
        )
    );
}

var ScoreType = function () {
    function ScoreType() {
        _classCallCheck(this, ScoreType);

        if (this.constructor === ScoreType) {
            throw new Error("Can't instantiate abstract ScoreType class");
        }
    }

    _createClass(ScoreType, [{
        key: "getScore",
        value: function getScore(diceValues) {
            throw new Error("Must override getScore method");
        }

        // TODO: not sure if this class is the best place for all these utilities

    }], [{
        key: "getCounts",
        value: function getCounts(diceValues) {
            var counts = Array(6).fill(0);
            diceValues.forEach(function (die) {
                return counts[die - 1]++;
            });
            return counts;
        }
    }, {
        key: "getCountVals",
        value: function getCountVals(diceValues) {
            var counts = ScoreType.getCounts(diceValues);
            var countVals = [].concat(_toConsumableArray(new Set(counts)));
            countVals.sort();
            return countVals;
        }
    }, {
        key: "diceSum",
        value: function diceSum(diceValues) {
            return diceValues.reduce(function (x, y) {
                return x + y;
            });
        }

        // how often does the most often number appear?

    }, {
        key: "mostNumerous",
        value: function mostNumerous(diceValues) {
            var counts = ScoreType.getCountVals(diceValues);
            return counts.reduce(function (x, y) {
                return Math.max(x, y);
            });
        }
    }]);

    return ScoreType;
}();

var NumberScore = function (_ScoreType) {
    _inherits(NumberScore, _ScoreType);

    function NumberScore(number) {
        _classCallCheck(this, NumberScore);

        var _this = _possibleConstructorReturn(this, (NumberScore.__proto__ || Object.getPrototypeOf(NumberScore)).call(this));

        _this.number = "";

        _this.number = number;
        _this.getScore = _this.getScoreGeneric(number);
        return _this;
    }

    _createClass(NumberScore, [{
        key: "getScoreGeneric",
        value: function getScoreGeneric(number) {
            var func = function func(diceValues) {
                return number * ScoreType.getCounts(diceValues)[number - 1];
            };
            return func;
        }
    }, {
        key: "scoreName",
        get: function get() {
            return {
                1: "Aces",
                2: "Twos",
                3: "Threes",
                4: "Fours",
                5: "Fives",
                6: "Sixes"
            }[this.number];
        }
    }]);

    return NumberScore;
}(ScoreType);

var YahtzeeScore = function (_ScoreType2) {
    _inherits(YahtzeeScore, _ScoreType2);

    function YahtzeeScore() {
        var _ref;

        var _temp, _this2, _ret;

        _classCallCheck(this, YahtzeeScore);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = YahtzeeScore.__proto__ || Object.getPrototypeOf(YahtzeeScore)).call.apply(_ref, [this].concat(args))), _this2), _this2.scoreName = "Yahtzee", _temp), _possibleConstructorReturn(_this2, _ret);
    }

    _createClass(YahtzeeScore, [{
        key: "getScore",
        value: function getScore(diceValues) {
            if (ScoreType.mostNumerous(diceValues) === 5) {
                return 50;
            }
            return 0;
        }
    }]);

    return YahtzeeScore;
}(ScoreType);

var ChanceScore = function (_ScoreType3) {
    _inherits(ChanceScore, _ScoreType3);

    function ChanceScore() {
        var _ref2;

        var _temp2, _this3, _ret2;

        _classCallCheck(this, ChanceScore);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_ref2 = ChanceScore.__proto__ || Object.getPrototypeOf(ChanceScore)).call.apply(_ref2, [this].concat(args))), _this3), _this3.scoreName = "Chance", _temp2), _possibleConstructorReturn(_this3, _ret2);
    }

    _createClass(ChanceScore, [{
        key: "getScore",
        value: function getScore(diceValues) {
            return ScoreType.diceSum(diceValues);
        }
    }]);

    return ChanceScore;
}(ScoreType);

var FullHouseScore = function (_ScoreType4) {
    _inherits(FullHouseScore, _ScoreType4);

    function FullHouseScore() {
        var _ref3;

        var _temp3, _this4, _ret3;

        _classCallCheck(this, FullHouseScore);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this4 = _possibleConstructorReturn(this, (_ref3 = FullHouseScore.__proto__ || Object.getPrototypeOf(FullHouseScore)).call.apply(_ref3, [this].concat(args))), _this4), _this4.scoreName = "Full House", _temp3), _possibleConstructorReturn(_this4, _ret3);
    }

    _createClass(FullHouseScore, [{
        key: "getScore",
        value: function getScore(diceValues) {
            var countVals = ScoreType.getCountVals(diceValues);
            var desired = [0, 2, 3]; // defines full house
            // TODO: should probably let yahtzee be a degenerate full house
            // although not strictly in specs
            if (arraysEqual(countVals, desired)) {
                return 25;
            }
            return 0;
        }
    }]);

    return FullHouseScore;
}(ScoreType);

var ThreeKindScore = function (_ScoreType5) {
    _inherits(ThreeKindScore, _ScoreType5);

    function ThreeKindScore() {
        var _ref4;

        var _temp4, _this5, _ret4;

        _classCallCheck(this, ThreeKindScore);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret4 = (_temp4 = (_this5 = _possibleConstructorReturn(this, (_ref4 = ThreeKindScore.__proto__ || Object.getPrototypeOf(ThreeKindScore)).call.apply(_ref4, [this].concat(args))), _this5), _this5.scoreName = "Three of a Kind", _temp4), _possibleConstructorReturn(_this5, _ret4);
    }

    _createClass(ThreeKindScore, [{
        key: "getScore",
        value: function getScore(diceValues) {
            if (ScoreType.mostNumerous(diceValues) >= 3) {
                return ScoreType.diceSum(diceValues);
            }
            return 0;
        }
    }]);

    return ThreeKindScore;
}(ScoreType);

var FourKindScore = function (_ScoreType6) {
    _inherits(FourKindScore, _ScoreType6);

    function FourKindScore() {
        var _ref5;

        var _temp5, _this6, _ret5;

        _classCallCheck(this, FourKindScore);

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        return _ret5 = (_temp5 = (_this6 = _possibleConstructorReturn(this, (_ref5 = FourKindScore.__proto__ || Object.getPrototypeOf(FourKindScore)).call.apply(_ref5, [this].concat(args))), _this6), _this6.scoreName = "Four of a Kind", _temp5), _possibleConstructorReturn(_this6, _ret5);
    }

    _createClass(FourKindScore, [{
        key: "getScore",
        value: function getScore(diceValues) {
            if (ScoreType.mostNumerous(diceValues) >= 4) {
                return ScoreType.diceSum(diceValues);
            }
            return 0;
        }
    }]);

    return FourKindScore;
}(ScoreType);

var SmallStraightScore = function (_ScoreType7) {
    _inherits(SmallStraightScore, _ScoreType7);

    function SmallStraightScore() {
        var _ref6;

        var _temp6, _this7, _ret6;

        _classCallCheck(this, SmallStraightScore);

        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
        }

        return _ret6 = (_temp6 = (_this7 = _possibleConstructorReturn(this, (_ref6 = SmallStraightScore.__proto__ || Object.getPrototypeOf(SmallStraightScore)).call.apply(_ref6, [this].concat(args))), _this7), _this7.scoreName = "Small Straight", _temp6), _possibleConstructorReturn(_this7, _ret6);
    }

    _createClass(SmallStraightScore, [{
        key: "getScore",
        value: function getScore(diceValues) {
            // TODO: is there a better way? others I can think of off-hand seem kind of convoluted
            if (diceValues.includes(3) && diceValues.includes(4) && (diceValues.includes(1) && diceValues.includes(2) || diceValues.includes(2) && diceValues.includes(5) || diceValues.includes(5) && diceValues.includes(6))) {
                return 30;
            }
            return 0;
        }
    }]);

    return SmallStraightScore;
}(ScoreType);

var LongStraightScore = function (_ScoreType8) {
    _inherits(LongStraightScore, _ScoreType8);

    function LongStraightScore() {
        var _ref7;

        var _temp7, _this8, _ret7;

        _classCallCheck(this, LongStraightScore);

        for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
            args[_key7] = arguments[_key7];
        }

        return _ret7 = (_temp7 = (_this8 = _possibleConstructorReturn(this, (_ref7 = LongStraightScore.__proto__ || Object.getPrototypeOf(LongStraightScore)).call.apply(_ref7, [this].concat(args))), _this8), _this8.scoreName = "Long Straight", _temp7), _possibleConstructorReturn(_this8, _ret7);
    }

    _createClass(LongStraightScore, [{
        key: "getScore",
        value: function getScore(diceValues) {
            // TODO: is there a better way? others I can think of off-hand seem kind of convoluted
            if (diceValues.includes(2) && diceValues.includes(3) && diceValues.includes(4) && diceValues.includes(5) && (diceValues.includes(1) || diceValues.includes(6))) {
                return 40;
            }
            return 0;
        }
    }]);

    return LongStraightScore;
}(ScoreType);

var DiceScores = function () {
    function DiceScores() {
        _classCallCheck(this, DiceScores);

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

    _createClass(DiceScores, [{
        key: "getNames",
        value: function getNames() {
            return Object.keys(this.scoreSet);
        }
    }, {
        key: "getTopHalfNames",
        value: function getTopHalfNames() {
            return Object.keys(this.topHalf);
        }
    }, {
        key: "getBottomHalfNames",
        value: function getBottomHalfNames() {
            return Object.keys(this.bottomHalf);
        }
    }, {
        key: "scoreSet",
        get: function get() {
            return Object.assign({}, this.topHalf, this.bottomHalf);
        }
    }]);

    return DiceScores;
}();

var GameArea = function (_React$Component) {
    _inherits(GameArea, _React$Component);

    function GameArea(props) {
        _classCallCheck(this, GameArea);

        var _this9 = _possibleConstructorReturn(this, (GameArea.__proto__ || Object.getPrototypeOf(GameArea)).call(this, props));

        _this9.state = {
            dice: Array(5).fill().map(function () {
                return { "value": _this9.randomRoll(), "hold": false };
            }),
            rollNumber: 1,
            scoreRefs: new DiceScores(),
            scores: {},
            turnOver: false,
            gameFinished: false,
            message: ""
        };
        Object.values(_this9.state.scoreRefs.getNames()).map(function (score) {
            return _this9.state.scores[score] = " ";
        });
        return _this9;
    }

    _createClass(GameArea, [{
        key: "renderMessageAlert",
        value: function renderMessageAlert() {
            return React.createElement(
                "div",
                { id: "alert" },
                this.state.message
            );
        }
    }, {
        key: "handleDieClick",
        value: function handleDieClick(i) {
            if ([0, 3].includes(this.state.rollNumber)) {
                return;
            }
            var dice = this.state.dice.slice();
            dice[i].hold = !dice[i].hold;
            this.setState({ dice: dice });
        }
    }, {
        key: "randomRoll",
        value: function randomRoll() {
            return Math.floor(Math.random() * 6) + 1;
        }
    }, {
        key: "renderDie",
        value: function renderDie(i) {
            var _this10 = this;

            return React.createElement(Die, {
                data: this.state.dice[i],
                onClick: function onClick() {
                    return _this10.handleDieClick(i);
                }
            });
        }
    }, {
        key: "generateRoll",
        value: function generateRoll() {
            var _this11 = this;

            if (this.state.turnOver) {
                return;
            }
            this.state.rollNumber = this.state.rollNumber + 1; // being explicit
            var dice = this.state.dice.slice();
            var message = "";
            dice = dice.map(function (item) {
                item.value = item.hold ? item.value : _this11.randomRoll();
                return item;
            });
            this.setState({ dice: dice, message: message });
            if (this.state.rollNumber === 3) {
                this.state.turnOver = true;
            }
        }
    }, {
        key: "renderRollButton",
        value: function renderRollButton() {
            var _this12 = this;

            var status = "usable";
            if (this.state.rollNumber === 3) {
                status = "unusable";
            }
            return React.createElement(RollButton, {
                className: status,
                onClick: function onClick() {
                    return _this12.generateRoll();
                }
            });
        }
    }, {
        key: "deselectAll",
        value: function deselectAll() {
            var dice = this.state.dice.slice();
            dice = dice.map(function (item) {
                item.hold = false;
                return item;
            });
            this.setState({ dice: dice });
        }
    }, {
        key: "newGame",
        value: function newGame() {
            if (!window.confirm("Are you sure you want to start a new game?")) {
                return;
            }
            var scores = {};
            var message = "";
            Object.keys(this.state.scores).map(function (score) {
                return scores[score] = " ";
            });
            this.deselectAll();
            this.setState({
                scores: scores,
                rollNumber: 0,
                turnOver: false,
                gameFinished: false,
                message: message
            });
            //this.generateRoll();
        }
    }, {
        key: "renderNewGameButton",
        value: function renderNewGameButton() {
            var _this13 = this;

            return React.createElement(NewGameButton, {
                onClick: function onClick() {
                    return _this13.newGame();
                }
            });
        }
    }, {
        key: "updateScore",
        value: function updateScore(score, func, diceVals) {
            // TODO: messaging system not really set up in a helpful way
            if (this.state.rollNumber === 0) {
                this.setState({ message: "You must roll before entering a score!" });
                return;
            } else if (this.state.scores[score] !== " ") {
                this.setState({ message: "You cannot enter the same category of score twice!" });
                return;
            }
            this.state.scores[score] = func(diceVals);
            if (this.gameIsOver()) {
                this.setState({ message: "Game finished! Well done!" });
            } else {
                this.setState({ message: "" });
            }
            this.state.turnOver = false;
            this.state.rollNumber = 0;
            this.deselectAll();
        }
    }, {
        key: "gameIsOver",
        value: function gameIsOver() {
            return !Object.values(this.state.scores).includes(" ");
        }
    }, {
        key: "renderScore",
        value: function renderScore(score) {
            var _this14 = this;

            var diceVals = this.state.dice.slice().map(function (die) {
                return die.value;
            });
            var scoreName = this.state.scoreRefs.scoreSet[score].scoreName;
            var data = {
                scoreName: scoreName,
                value: this.state.scores[score]
            };
            var scoreFunc = this.state.scoreRefs.scoreSet[score].getScore;
            return React.createElement(ScoreRow, {
                key: scoreName,
                data: data,
                onClick: function onClick() {
                    return _this14.updateScore(score, scoreFunc, diceVals);
                }
            });
        }
    }, {
        key: "renderStatus",
        value: function renderStatus(rollNumber) {
            return React.createElement(
                "h1",
                { id: "status" },
                'Roll number:  ',
                " ",
                React.createElement(
                    "span",
                    { id: "roll-number" },
                    rollNumber
                )
            );
        }
    }, {
        key: "render",
        value: function render() {
            var _this15 = this;

            if (this.state.rollNumber === 3) {
                this.state.message = "Please select a score category";
            }

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { id: "play-area" },
                    this.renderStatus(this.state.rollNumber),
                    React.createElement(
                        "div",
                        { id: "dice-holder" },
                        this.renderDie(0),
                        this.renderDie(1),
                        this.renderDie(2),
                        this.renderDie(3),
                        this.renderDie(4)
                    ),
                    this.renderNewGameButton(),
                    this.renderMessageAlert(),
                    this.renderRollButton()
                ),
                React.createElement(
                    "div",
                    { id: "score-sheet" },
                    React.createElement(
                        "table",
                        { id: "score-table" },
                        React.createElement(
                            "colgroup",
                            null,
                            React.createElement("col", { span: "1", style: { width: "60%" } }),
                            React.createElement("col", { span: "1", style: { width: "40%" } })
                        ),
                        React.createElement(
                            "thead",
                            null,
                            React.createElement(
                                "tr",
                                null,
                                React.createElement(
                                    "th",
                                    null,
                                    "Category"
                                ),
                                React.createElement(
                                    "th",
                                    null,
                                    "Value"
                                )
                            )
                        ),
                        React.createElement(
                            "tbody",
                            null,
                            this.state.scoreRefs.getTopHalfNames().map(function (score) {
                                return _this15.renderScore(score);
                            }),
                            React.createElement(
                                "tr",
                                null,
                                React.createElement(
                                    "th",
                                    null,
                                    "Top Half Sub-total"
                                ),
                                React.createElement(
                                    "th",
                                    null,
                                    this.topHalfSub
                                )
                            ),
                            React.createElement(
                                "tr",
                                null,
                                React.createElement(
                                    "th",
                                    null,
                                    "Bonus"
                                ),
                                React.createElement(
                                    "th",
                                    null,
                                    this.bonus
                                )
                            ),
                            React.createElement(
                                "tr",
                                null,
                                React.createElement(
                                    "th",
                                    null,
                                    "Top Half Total"
                                ),
                                React.createElement(
                                    "th",
                                    null,
                                    this.topHalfTotal
                                )
                            ),
                            this.state.scoreRefs.getBottomHalfNames().map(function (score) {
                                return _this15.renderScore(score);
                            }),
                            React.createElement(
                                "tr",
                                null,
                                React.createElement(
                                    "th",
                                    null,
                                    "Bottom Half Total"
                                ),
                                React.createElement(
                                    "th",
                                    null,
                                    this.bottomHalfTotal
                                )
                            ),
                            React.createElement(
                                "tr",
                                null,
                                React.createElement(
                                    "th",
                                    null,
                                    "Grand Total"
                                ),
                                React.createElement(
                                    "th",
                                    null,
                                    this.grandTotal
                                )
                            )
                        )
                    )
                )
            );
        }
    }, {
        key: "topHalfSub",
        get: function get() {
            var _this16 = this;

            var scoreNames = this.state.scoreRefs.getTopHalfNames();
            var scores = scoreNames.map(function (scoreName) {
                return _this16.state.scores[scoreName];
            });
            if (scores.includes(" ")) {
                return " ";
            }
            return ScoreType.diceSum(scores);
        }
    }, {
        key: "bottomHalfTotal",
        get: function get() {
            var _this17 = this;

            var scoreNames = this.state.scoreRefs.getBottomHalfNames();
            var scores = scoreNames.map(function (scoreName) {
                return _this17.state.scores[scoreName];
            });
            if (scores.includes(" ")) {
                return " ";
            }
            return ScoreType.diceSum(scores);
        }
    }, {
        key: "bonus",
        get: function get() {
            if (this.topHalfSub === " ") {
                return " ";
            }
            if (this.topHalfSub >= 63) {
                return 35;
            }
            return 0;
        }
    }, {
        key: "topHalfTotal",
        get: function get() {
            if (this.bonus !== " ") {
                return this.topHalfSub + this.bonus;
            }
            return " ";
        }
    }, {
        key: "grandTotal",
        get: function get() {
            if (this.topHalfTotal === " " || this.bottomHalfTotal === " ") {
                return " ";
            }
            this.gameFinished = true;
            return this.topHalfTotal + this.bottomHalfTotal;
        }
    }]);

    return GameArea;
}(React.Component);

var domContainer = document.querySelector('#dice-area');
ReactDOM.render(e(GameArea), domContainer);