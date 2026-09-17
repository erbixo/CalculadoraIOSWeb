const display = document.querySelector('.display');
const historyDisplay = document.querySelector('.operation-history');
const clearButton = document.getElementById('btn-clear');
const buttons = document.querySelectorAll('.buttons-grid button');


let currentNumber = '0';
let equationStructure = [];
let lastResult = '';
let resetOnNextNumber = false;

let lastAppliedOperator = null; 
let lastAppliedValue = null;

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent.trim();

        if (button.classList.contains('btn-backspace')) {
            handleBackspace();
            updateDisplay();
            updateClearButtonText();
            return;
        }

        if (button.classList.contains('btn-plus-minus')) {
            handlePlusMinus();
            updateDisplay();
            return;
        }

        if (button.id === 'btn-clear') {
            handleClearAction();
            updateDisplay();
            updateClearButtonText();
            return;
        }

        switch (value) {
            case '%':
                handlePercentage();
                break;
            case '.':
                appendDot();
                break;
            case '=':
                calculate();
                break;
            case '+':
            case '−':
            case '×':
            case '÷':
                handleOperator(value);
                break;
            default:
                appendNumber(value);
                break;
        }
        
        updateDisplay();
        updateClearButtonText();
    });
});

function updateDisplay() {
    if (equationStructure.length === 0 && currentNumber === '0') {
        display.textContent = '0';
    } else {
        let activeEquation = equationStructure.join(' ');
        
        if (currentNumber !== '') {
            if (currentNumber === '0' && equationStructure.length > 0 && isOperator(equationStructure[equationStructure.length - 1])) {
            } else if (currentNumber !== '0' || equationStructure.length === 0) {
                activeEquation += (activeEquation ? ' ' : '') + currentNumber;
            }
        }
        
        display.textContent = activeEquation || '0';
    }

    if (display.textContent.length > 10) {
        display.style.fontSize = '2.4rem';
    } else if (display.textContent.length > 6) {
        display.style.fontSize = '3.2rem';
    } else {
        display.style.fontSize = '4.5rem';
    }

    display.scrollLeft = display.scrollWidth;
}

function updateClearButtonText() {
    if (currentNumber === '0') {
        clearButton.textContent = 'AC';
    } else {
        clearButton.textContent = 'C';
    }
}

function isOperator(val) {
    return ['+', '−', '×', '÷'].includes(val);
}

function roundResult(num) {
    if (!isFinite(num)) return num;
    // Si el número es muy pequeño, no lo redondeamos todavía para no perderlo como 0
    if (Math.abs(num) > 0 && Math.abs(num) < 1e-6) {
        return num;
    }
    return parseFloat(num.toFixed(7));
}

const SUPERSCRIPT_MAP = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '-': '⁻'
};
const FROM_SUPERSCRIPT_MAP = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁻': '-'
};

function toSuperscript(num) {
    return num.toString().split('').map(ch => SUPERSCRIPT_MAP[ch] !== undefined ? SUPERSCRIPT_MAP[ch] : ch).join('');
}

function fromSuperscript(str) {
    return str.split('').map(ch => FROM_SUPERSCRIPT_MAP[ch] !== undefined ? FROM_SUPERSCRIPT_MAP[ch] : ch).join('');
}

function formatResult(num) {
    if (typeof num !== 'number' || !isFinite(num)) {
        return num.toString();
    }
    if (num === 0) return '0';

    const absNum = Math.abs(num);

    // Muy grande o muy pequeño: notación científica en base 10 (mantisa × 10^exponente)
    if (absNum >= 1e10 || absNum < 1e-6) {
        let expStr = num.toExponential(6);
        let [mantissa, exponent] = expStr.split('e');
        let expNum = parseInt(exponent, 10);
        return `${mantissa} × 10${toSuperscript(expNum)}`;
    }

    return num.toString();
}

function parseValue(val) {
    if (typeof val === 'number') return val;
    if (typeof val !== 'string') return NaN;

    const sciMatch = val.match(/^(-?\d+\.?\d*)\s*×\s*10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/);
    if (sciMatch) {
        const mantissa = parseFloat(sciMatch[1]);
        const exponent = parseInt(fromSuperscript(sciMatch[2]), 10);
        return mantissa * Math.pow(10, exponent);
    }

    return parseFloat(val);
}

function handleClearAction() {
    if (clearButton.textContent === 'C') {
        currentNumber = '0';
        if (resetOnNextNumber) {
            equationStructure = [];
            resetOnNextNumber = false;
        }
    } else {
        currentNumber = '0';
        equationStructure = [];
        resetOnNextNumber = false;
        lastAppliedOperator = null;
        lastAppliedValue = null;
    }
}

function appendNumber(number) {
    if (resetOnNextNumber) {
        equationStructure = [];
        currentNumber = '0';
        resetOnNextNumber = false;
    }

    if (currentNumber === '0') {
        currentNumber = number;
    } else {
        currentNumber += number;
    }
}

function appendDot() {
    if (resetOnNextNumber) {
        equationStructure = [];
        currentNumber = '0.';
        resetOnNextNumber = false;
        return;
    }
    if (currentNumber === '') {
        currentNumber = '0.';
    } else if (!currentNumber.includes('.') && !currentNumber.includes('%')) {
        currentNumber += '.';
    }
}

function handleBackspace() {
    if (resetOnNextNumber) {
        resetOnNextNumber = false;
    }
    
    if (currentNumber !== '' && currentNumber !== '0') {
        if (currentNumber.endsWith('%')) {
            currentNumber = currentNumber.slice(0, -1);
        } else if (currentNumber.length > 1) {
            currentNumber = currentNumber.slice(0, -1);
        } else {
            if (equationStructure.length > 0) {
                currentNumber = '0';
            } else {
                currentNumber = '0';
            }
        }
    } 
    else if (currentNumber === '0' && equationStructure.length > 0) {
        let lastItem = equationStructure[equationStructure.length - 1];
        if (isOperator(lastItem)) {
            equationStructure.pop(); 
            let previousNum = equationStructure.pop();
            currentNumber = previousNum !== undefined ? previousNum : '0';
        }
    }
}

function handlePlusMinus() {
    if (resetOnNextNumber) {
        resetOnNextNumber = false; 
    }

    if (currentNumber !== '' && currentNumber !== '0' && !currentNumber.includes('%')) {
        if (currentNumber.startsWith('-')) {
            currentNumber = currentNumber.slice(1);
        } else {
            currentNumber = '-' + currentNumber;
        }
    }
}

function handlePercentage() {
    if (currentNumber === '' && equationStructure.length === 0) return;
    if (currentNumber === '0' && equationStructure.length === 0) return;
    if (currentNumber === '' && isOperator(equationStructure[equationStructure.length - 1])) return;
    
    if (resetOnNextNumber) {
        resetOnNextNumber = false;
    }
    currentNumber += '%';
}

function handleOperator(operator) {
    if (resetOnNextNumber) {
        resetOnNextNumber = false;
    }

    if (currentNumber !== '') {
        equationStructure.push(currentNumber);
        currentNumber = '';
    } else if (equationStructure.length > 0 && isOperator(equationStructure[equationStructure.length - 1])) {
        equationStructure[equationStructure.length - 1] = operator;
        return;
    }
    equationStructure.push(operator);
}

function calculate() {
    if (currentNumber !== '') {
        if (currentNumber.endsWith('.')) {
            currentNumber = currentNumber.slice(0, -1);
        }
        equationStructure.push(currentNumber);
        currentNumber = '';
    }

    if (resetOnNextNumber && equationStructure.length === 1 && lastAppliedOperator && lastAppliedValue !== null) {
        if (typeof lastAppliedValue === 'string' && lastAppliedValue.endsWith('.')) {
            lastAppliedValue = lastAppliedValue.slice(0, -1);
        }
        equationStructure.push(lastAppliedOperator);
        equationStructure.push(lastAppliedValue);
    }

    if (equationStructure.length === 0) return;
    if (isOperator(equationStructure[equationStructure.length - 1])) return;

    let fullOperationString = equationStructure.join(' ');

    if (equationStructure.length >= 3) {
        lastAppliedOperator = equationStructure[equationStructure.length - 2];
        lastAppliedValue = equationStructure[equationStructure.length - 1];
    }

    let tokens = [];
    for (let i = 0; i < equationStructure.length; i++) {
        let token = equationStructure[i];
        
        if (typeof token === 'string' && token.includes('%')) {
            let parts = token.split('%');
            let numericValue = parseValue(parts[0]);
            let calculatedPercent;

            calculatedPercent = numericValue / 100;
            tokens.push(calculatedPercent);

            if (parts[1] && parts[1].trim() !== '') {
                tokens.push('×');
                tokens.push(parseValue(parts[1]));
            }
        } else {
            tokens.push(token);
        }
    }

    let i = 0;
    while (i < tokens.length) {
        if (tokens[i] === '×' || tokens[i] === '÷') {
            let prev = parseValue(tokens[i - 1]);
            let next = parseValue(tokens[i + 1]);
            let res = 0;
            if (tokens[i] === '×') res = prev * next;
            if (tokens[i] === '÷') res = next === 0 ? 'Error' : prev / next;
            tokens.splice(i - 1, 3, res);
            i--;
        }
        i++;
    }

    i = 0;
    while (tokens.length > 1 && i < tokens.length) {
        if (tokens[i] === '+' || tokens[i] === '−') {
            let prev = parseValue(tokens[i - 1]);
            let next = parseValue(tokens[i + 1]);
            let res = 0;
            if (tokens[i] === '+') res = prev + next;
            if (tokens[i] === '−') res = prev - next;
            tokens.splice(i - 1, 3, res);
            i--;
        }
        i++;
    }

    let finalResult = tokens[0];
    if (typeof finalResult === 'number') {
        finalResult = roundResult(finalResult);
    }

    let displayResult = formatResult(finalResult);

    historyDisplay.textContent = `${fullOperationString}`;
    historyDisplay.scrollLeft = historyDisplay.scrollWidth;

    if (!window.historialOperaciones) window.historialOperaciones = [];
    window.historialOperaciones.push({
        ecuacion: fullOperationString,
        resultado: displayResult
    });
    actualizarPanelHistorial();

    currentNumber = displayResult;
    lastResult = currentNumber;
    equationStructure = []; 
    resetOnNextNumber = true; 
}

const btnHistorial = document.getElementById('btn-historial');
const panelHistorial = document.getElementById('panel-historial');

btnHistorial.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panelHistorial.classList.toggle('abierto');
    updateClearButtonText();
});


document.querySelector('.calculator').addEventListener('click', (e) => {
    if (!panelHistorial.contains(e.target) && e.target !== btnHistorial) {
        panelHistorial.classList.remove('abierto');
    }
});

function actualizarPanelHistorial() {
    const lista = panelHistorial.querySelector('.lista-operaciones');
    lista.innerHTML = '';

    window.historialOperaciones.forEach((item) => {
        const fila = document.createElement('div');
        fila.classList.add('fila-historial');
        fila.innerHTML = `
            <span class="hist-eq">${item.ecuacion} =</span>
            <span class="hist-res">${item.resultado}</span>
        `;
        
        fila.addEventListener('click', (e) => {
            e.stopPropagation();
            
            currentNumber = item.resultado.toString();
            equationStructure = [];
            resetOnNextNumber = true;
            
            updateDisplay();
            clearButton.textContent = 'AC';
            
            panelHistorial.classList.remove('abierto');
        });
        
        lista.appendChild(fila);
    });
}