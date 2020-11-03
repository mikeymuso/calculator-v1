///////////////////////
//     UI MODULE     //
///////////////////////

const display = document.querySelector('.display');

const UIModule = (function () {
	const toggleClass = function (id, cssClass, time = 100) {
		button = document.getElementById(id);
		button.classList.toggle(cssClass);
		setTimeout(function () {
			button.classList.toggle(cssClass);
		}, time);
	};

	return {
		updateDisplay: function (value) {
			display.textContent = value.toString().slice(0, 10);
		},

		clearDisplay: function () {
			display.textContent = 0;
		},

		triggerButton: function (id) {
			if (id >= 0 || id <= 9) {
				toggleClass(id, 'num-pressed');
			} else if (id == 'equals') {
				toggleClass(id, 'equals-pressed');
			} else {
				toggleClass(id, 'operator-pressed');
			}
		},
	};
})();

///////////////////////
// Processing Module //
///////////////////////

const processModule = (function () {
	let data = {
		firstNum: 0,
		secondNum: 0,
		result: null,
		operator: '',
		awaitingSecondOperator: false,
		decimalUsed: false,
		equals: false,
	};

	const plus = function (a, b) {
		return a + b;
	};

	const subtract = function (a, b) {
		return b - a;
	};

	const multiply = function (a, b) {
		return a * b;
	};

	const divide = function (a, b) {
		if (a == 0 || b == 0) {
			return 'Error';
		} else {
			return b / a;
		}
	};

	const getOperation = function (a, b) {
		let op = data.operator;
		if (op == 'plus' || op == '+') {
			return plus(a, b);
		} else if (op == 'subtract' || op == '-') {
			return subtract(a, b);
		} else if (op == 'multiply' || op == '*') {
			return multiply(a, b);
		} else if (op == 'divide' || op == '/') {
			return divide(a, b);
		} else {
			console.warn('ERROR - no valid operator supplied');
		}
	};

	return {
		getData: function () {
			return data;
		},

		checkDecimal: function () {
			if (data.secondNum.split('').indexOf('.') !== -1) {
				data.decimalUsed = true;
				return data.decimalUsed;
			}
		},

		// update the current saved number up to a limit of 10 digits
		updatesecondNum: function (value) {
			if (data.secondNum == '0') {
				if (value == '.') {
					data.secondNum += value;
				} else {
					data.secondNum = value;
				}
			} else if (data.secondNum.length < 10) {
				data.secondNum += value;
			}
			return data.secondNum;
		},

		setOperator: function (operator) {
			data.operator = operator;
			data.awaitingSecondOperator = true;
		},

		clearOperator: function () {
			data.operator = '';
			data.secondNum = 0;
		},

		storeFirstNum: function () {
			data.firstNum = data.secondNum;
			data.secondNum = 0;
		},

		clearNumbers: function () {
			data.secondNum = 0;
			data.firstNum = 0;
		},

		setResult: function () {
			data.firstNum = data.result;
			data.secondNum = 0;
		},

		performOperation: function () {
			if (data.operator !== '') {
				data.result = getOperation(parseFloat(data.secondNum), parseFloat(data.firstNum));
			}
		},

		deleteNum: function () {
			if (data.secondNum > 0 && data.secondNum.length > 1) {
				const numArr = data.secondNum.split('');
				numArr.pop();
				data.secondNum = numArr.join('');
			} else if (data.secondNum.length == 1) {
				data.secondNum = 0;
			}

			return data.secondNum;
		},

		init: function () {
			data.firstNum = 0;
			data.secondNum = 0;
			data.result = null;
			data.operator = '';
			data.awaitingSecondOperator = false;
			data.equals = false;
		},
	};
})();

///////////////////////
//     Main Module   //
///////////////////////

const mainModule = (function (UIMod, processMod) {
	const numInput = function (input) {
		/* 	
			This checks if equals has been pressed (and no operator selected after).
			If it has been pressed and no operator has been selected
			it will be considered a new calculation so this initialises the calculator 
		*/
		if (data.equals) {
			processMod.init();
		}

		// Triggering CSS if numbers are typed (checking for decimal key id)
		UIMod.triggerButton(input !== '.' ? input : 'decimal');

		secondNum = processMod.updatesecondNum(input);
		UIMod.updateDisplay(secondNum);
	};

	const data = processMod.getData();

	const operatorInput = function (operator) {
		data.equals = false;
		UIMod.triggerButton(operator);

		// If an operator has been selected already...listening out for another operator & calculating/storing our previous result
		// Otherwise setting the operator waiting for second input
		if (!data.awaitingSecondOperator) {
			processMod.storeFirstNum();
			processMod.setOperator(operator);
			data.awaitingSecondOperator = true;
		} else if (data.awaitingSecondOperator) {
			// if change mind on operator

			processMod.performOperation();
			processMod.setResult();
			UIMod.updateDisplay(data.result);
			processMod.setOperator(operator);
		}
	};

	const decimalInput = function (input) {
		// Checking if a decimal has already been used
		if (!processMod.checkDecimal()) {
			numInput('.');
		}
	};

	const equalsInput = function () {
		UIMod.triggerButton('equals');
		// Calculate result and display. Set equals to true to decide whether next button pressed sets a new operator or initialises the app
		if (data.operator !== '') {
			processMod.performOperation();
			UIMod.updateDisplay(data.result);
			data.awaitingSecondOperator = true;
			processMod.clearOperator();
			data.equals = true;
		}
	};

	const deleteNumber = function () {
		const num = processMod.deleteNum();
		UIMod.updateDisplay(num);
	};

	const clearBtn = function () {
		UIMod.clearDisplay();
		processMod.init();
	};

	const addEventListeners = function () {
		window.addEventListener('click', function (event) {
			const input = event.target.id;
			const operators = ['plus', 'subtract', 'multiply', 'divide'];

			if (parseInt(input) >= 0 && parseInt(input) <= 9) {
				numInput(input);
			} else if (operators.indexOf(event.target.id) !== -1) {
				operatorInput(input);
			} else if (event.target.id === 'decimal') {
				decimalInput(input);
			} else if (event.target.id === 'equals') {
				equalsInput();
			} else if (event.target.id === 'clear') {
				clearBtn();
			}
		});

		window.addEventListener('keydown', function (event) {
			const input = event.key;
			const opKeys = ['+', '-', '*', '/'];
			const operators = ['plus', 'subtract', 'multiply', 'divide'];

			if (parseInt(input) >= 0 && parseInt(input) <= 9) {
				numInput(input);
			} else if (opKeys.indexOf(input) !== -1) {
				// Converting the key to a string
				const op = opKeys.indexOf(input);
				operatorInput(operators[op]);
			} else if (input === '.') {
				decimalInput(input);
			} else if (input === 'Enter') {
				equalsInput();
			} else if (input === 'Backspace') {
				deleteNumber();
			}
		});
	};

	return {
		init: function () {
			addEventListeners();
			processMod.init();
			UIMod.clearDisplay();
		},
	};
})(UIModule, processModule);

mainModule.init();
