/* =========================================
   HESAP MAKİNESİ UYGULAMASI - ANA MODÜL
   Mimarlık / Mühendislik için ~40 işlem
   ========================================= */

(function(){
    "use strict";

    // ---------- DOM Elementleri ----------
    const exprDisplay = document.getElementById('expressionDisplay');
    const resultDisplay = document.getElementById('resultDisplay');
    const angleIndicator = document.getElementById('angleModeIndicator');
    const memoryIndicator = document.getElementById('memoryIndicator');
    const buttonContainer = document.getElementById('buttonContainer');

    // ---------- Hesap Makinesi Durumu ----------
    let currentValue = '0';           // Gösterilen değer (string)
    let previousValue = null;         // Önceki sayı (number)
    let operator = null;              // Bekleyen operatör (+, -, *, /, ^, mod)
    let waitingForOperand = false;    // Operatörden sonra yeni sayı giriliyor mu?
    let expression = '';              // Ekranda gösterilecek ifade metni
    let memory = 0;                   // Bellek değeri
    let isRadians = false;            // false = Derece, true = Radyan
    let lastResult = 0;               // Son hesaplanan sonuç (yardımcı)

    // ---------- Yardımcı Fonksiyonlar ----------

    /** Ekranları günceller */
    function updateDisplay() {
        resultDisplay.textContent = currentValue;
        exprDisplay.textContent = expression || ' '; // boşluk karakteri
        // Açı modu göstergesi
        angleIndicator.textContent = isRadians ? 'RAD' : 'DEG';
        // Bellek göstergesi (dolu ise vurgula)
        memoryIndicator.style.opacity = memory !== 0 ? '1' : '0.4';
    }

    /** Sayı formatını düzenler (çok uzun ondalık kısmı kırpar) */
    function formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
            return 'Hata';
        }
        // Mühendislik gösterimi için fazla basamakları sınırla
        let str = num.toString();
        if (str.includes('e')) {
            // Bilimsel gösterimi koru ama çok uzunsa kısalt
            return num.toExponential(8);
        }
        // Ondalık kısmı 10 haneyi geçmesin
        if (str.includes('.')) {
            let parts = str.split('.');
            if (parts[1].length > 10) {
                return num.toFixed(10).replace(/\.?0+$/, '');
            }
        }
        // Gereksiz sondaki .0'ı kaldır
        return str.replace(/\.0+$/, '');
    }

    /** İfadeye ekleme yapar (operatör vs) */
    function appendToExpression(text) {
        expression += text;
    }

    /** Yeni sayı girişi başlatır */
    function startNewNumber(valueStr) {
        currentValue = valueStr;
        waitingForOperand = false;
    }

    /** İşlem yapılabilir mi kontrolü */
    function canCalculate() {
        return previousValue !== null && operator !== null && !waitingForOperand;
    }

    /** Temel aritmetik işlem */
    function calculate(prev, curr, op) {
        const p = parseFloat(prev);
        const c = parseFloat(curr);
        if (isNaN(p) || isNaN(c)) return NaN;
        switch (op) {
            case '+': return p + c;
            case '-': return p - c;
            case '*': return p * c;
            case '/': return c !== 0 ? p / c : NaN;
            case '^': return Math.pow(p, c);
            case 'mod': return p % c;
            default: return c;
        }
    }

    /** Ana eşittir işlemini gerçekleştir */
    function performEquals() {
        if (!canCalculate()) return;
        
        const curr = parseFloat(currentValue);
        const result = calculate(previousValue, curr, operator);
        
        if (isNaN(result) || !isFinite(result)) {
            currentValue = 'Hata';
            expression = 'Hata';
            previousValue = null;
            operator = null;
            waitingForOperand = false;
            updateDisplay();
            return;
        }
        
        // İfadeyi güncelle
        expression = `${previousValue} ${operator === '^' ? '^' : operator} ${curr} =`;
        currentValue = formatNumber(result);
        lastResult = result;
        previousValue = result;
        operator = null;
        waitingForOperand = true; // Yeni sayı girişi temizler
        updateDisplay();
    }

    /** Operatör ataması */
    function setOperator(op) {
        const inputValue = parseFloat(currentValue);
        
        if (previousValue === null) {
            previousValue = inputValue;
            expression = currentValue + ' ' + op + ' ';
        } else if (operator && !waitingForOperand) {
            // Zincirleme işlem: önce öncekini hesapla
            const result = calculate(previousValue, inputValue, operator);
            if (isNaN(result) || !isFinite(result)) {
                currentValue = 'Hata';
                previousValue = null;
                operator = null;
                waitingForOperand = false;
                updateDisplay();
                return;
            }
            previousValue = result;
            currentValue = formatNumber(result);
            expression = currentValue + ' ' + op + ' ';
        } else {
            // Operatör değiştirme
            expression = expression.replace(/[\+\-\*\/\^mod]+$/, '') + ' ' + op + ' ';
        }
        
        operator = op;
        waitingForOperand = true;
        updateDisplay();
    }

    /** Sayı veya nokta girişi */
    function inputDigit(digit) {
        if (waitingForOperand) {
            currentValue = digit;
            waitingForOperand = false;
        } else {
            if (digit === '.' && currentValue.includes('.')) return;
            currentValue = currentValue === '0' && digit !== '.' ? digit : currentValue + digit;
        }
        updateDisplay();
    }

    /** Tek operandlı fonksiyonlar (sqrt, sin, log vs) */
    function applySingleArgFunction(func) {
        let val = parseFloat(currentValue);
        if (isNaN(val)) {
            currentValue = 'Hata';
            updateDisplay();
            return;
        }
        
        let result;
        let funcName = '';
        
        // Açı dönüşümü gerekenler için helper
        const toRad = isRadians ? (x) => x : (deg) => deg * Math.PI / 180;
        
        switch (func) {
            case 'sqrt':
                result = Math.sqrt(val);
                funcName = '√';
                break;
            case 'square':
                result = val * val;
                funcName = 'sqr';
                break;
            case 'cube':
                result = val * val * val;
                funcName = 'cube';
                break;
            case 'cbrt':
                result = Math.cbrt(val);
                funcName = '∛';
                break;
            case 'inv':
                result = 1 / val;
                funcName = '1/';
                break;
            case 'sin':
                result = Math.sin(toRad(val));
                funcName = isRadians ? 'sin(' : 'sin(';
                break;
            case 'cos':
                result = Math.cos(toRad(val));
                funcName = 'cos(';
                break;
            case 'tan':
                result = Math.tan(toRad(val));
                funcName = 'tan(';
                break;
            case 'asin':
                result = Math.asin(val);
                if (!isRadians) result = result * 180 / Math.PI;
                funcName = 'asin(';
                break;
            case 'acos':
                result = Math.acos(val);
                if (!isRadians) result = result * 180 / Math.PI;
                funcName = 'acos(';
                break;
            case 'atan':
                result = Math.atan(val);
                if (!isRadians) result = result * 180 / Math.PI;
                funcName = 'atan(';
                break;
            case 'log':
                result = Math.log10(val);
                funcName = 'log(';
                break;
            case 'ln':
                result = Math.log(val);
                funcName = 'ln(';
                break;
            case 'exp10':
                result = Math.pow(10, val);
                funcName = '10^';
                break;
            case 'exp':
                result = Math.exp(val);
                funcName = 'e^';
                break;
            case 'fact':
                if (val < 0 || !Number.isInteger(val)) { result = NaN; break; }
                result = factorial(val);
                funcName = '!';
                break;
            case 'abs':
                result = Math.abs(val);
                funcName = '|';
                break;
            case 'negate':
                result = -val;
                funcName = 'neg';
                break;
            default: return;
        }
        
        if (isNaN(result) || !isFinite(result)) {
            currentValue = 'Hata';
        } else {
            // İfadeye ekle
            if (func === 'square') expression = `sqr(${val})`;
            else if (func === 'cube') expression = `cube(${val})`;
            else if (func === 'cbrt') expression = `∛(${val})`;
            else if (func === 'inv') expression = `1/(${val})`;
            else if (func === 'negate') expression = `-(${val})`;
            else if (func === 'fact') expression = `${val}!`;
            else expression = `${funcName}${val})`;
            
            currentValue = formatNumber(result);
            lastResult = result;
        }
        previousValue = null;
        operator = null;
        waitingForOperand = true;
        updateDisplay();
    }

    /** Faktöriyel hesaplama (iteratif) */
    function factorial(n) {
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    /** Sabit ekle (pi, e) */
    function insertConstant(constant) {
        const val = constant === 'pi' ? Math.PI : Math.E;
        currentValue = formatNumber(val);
        expression = constant === 'pi' ? 'π' : 'e';
        waitingForOperand = true;
        previousValue = null;
        operator = null;
        updateDisplay();
    }

    /** Temizleme işlemleri */
    function clearAll() {
        currentValue = '0';
        previousValue = null;
        operator = null;
        waitingForOperand = false;
        expression = '';
        updateDisplay();
    }

    function clearEntry() {
        currentValue = '0';
        waitingForOperand = false;
        updateDisplay();
    }

    function backspace() {
        if (!waitingForOperand && currentValue.length > 1) {
            currentValue = currentValue.slice(0, -1);
        } else {
            currentValue = '0';
        }
        updateDisplay();
    }

    /** Bellek işlemleri */
    function memoryAdd() {
        const val = parseFloat(currentValue);
        if (!isNaN(val)) memory += val;
        memoryIndicator.style.opacity = memory !== 0 ? '1' : '0.4';
    }
    function memorySubtract() {
        const val = parseFloat(currentValue);
        if (!isNaN(val)) memory -= val;
        memoryIndicator.style.opacity = memory !== 0 ? '1' : '0.4';
    }
    function memoryRecall() {
        currentValue = formatNumber(memory);
        waitingForOperand = true;
        updateDisplay();
    }
    function memoryClear() {
        memory = 0;
        memoryIndicator.style.opacity = '0.4';
    }

    /** Radyan/Derece değiştir */
    function toggleAngleMode() {
        isRadians = !isRadians;
        updateDisplay();
    }

    /** Yüzde işlemi */
    function applyPercentage() {
        let val = parseFloat(currentValue);
        if (previousValue !== null && operator) {
            // önceki değerin yüzdesi olarak
            val = previousValue * val / 100;
        } else {
            val = val / 100;
        }
        currentValue = formatNumber(val);
        waitingForOperand = true;
        updateDisplay();
    }

    // ---------- BUTON TANIMLARI (40+ İŞLEM) ----------
    const buttonDefinitions = [
        // Satır 1: Bellek ve temizlik
        { label: 'MC', action: 'memoryClear', class: 'btn-memory' },
        { label: 'MR', action: 'memoryRecall', class: 'btn-memory' },
        { label: 'M+', action: 'memoryAdd', class: 'btn-memory' },
        { label: 'M-', action: 'memorySubtract', class: 'btn-memory' },
        { label: 'C', action: 'clearEntry', class: 'btn-clear' },
        { label: 'AC', action: 'clearAll', class: 'btn-clear' },
        { label: '⌫', action: 'backspace', class: 'btn-function' },
        { label: '÷', action: 'operator', value: '/', class: 'btn-operator' },
        
        // Satır 2: Fonksiyonlar
        { label: 'x²', action: 'singleArg', func: 'square', class: 'btn-function' },
        { label: 'x³', action: 'singleArg', func: 'cube', class: 'btn-function' },
        { label: 'xʸ', action: 'operator', value: '^', class: 'btn-operator' },
        { label: '√', action: 'singleArg', func: 'sqrt', class: 'btn-function' },
        { label: '∛', action: 'singleArg', func: 'cbrt', class: 'btn-function' },
        { label: '1/x', action: 'singleArg', func: 'inv', class: 'btn-function' },
        { label: '%', action: 'percentage', class: 'btn-function' },
        { label: 'mod', action: 'operator', value: 'mod', class: 'btn-operator' },
        
        // Satır 3: Trigonometri
        { label: 'sin', action: 'singleArg', func: 'sin', class: 'btn-function' },
        { label: 'cos', action: 'singleArg', func: 'cos', class: 'btn-function' },
        { label: 'tan', action: 'singleArg', func: 'tan', class: 'btn-function' },
        { label: 'asin', action: 'singleArg', func: 'asin', class: 'btn-function' },
        { label: 'acos', action: 'singleArg', func: 'acos', class: 'btn-function' },
        { label: 'atan', action: 'singleArg', func: 'atan', class: 'btn-function' },
        { label: 'RAD', action: 'toggleAngle', class: 'btn-function' },
        { label: 'π', action: 'constant', value: 'pi', class: 'btn-number' },
        
        // Satır 4: Log/Exp
        { label: 'log', action: 'singleArg', func: 'log', class: 'btn-function' },
        { label: 'ln', action: 'singleArg', func: 'ln', class: 'btn-function' },
        { label: '10ˣ', action: 'singleArg', func: 'exp10', class: 'btn-function' },
        { label: 'eˣ', action: 'singleArg', func: 'exp', class: 'btn-function' },
        { label: '|x|', action: 'singleArg', func: 'abs', class: 'btn-function' },
        { label: 'x!', action: 'singleArg', func: 'fact', class: 'btn-function' },
        { label: '±', action: 'singleArg', func: 'negate', class: 'btn-function' },
        { label: 'e', action: 'constant', value: 'e', class: 'btn-number' },
        
        // Satır 5: Sayılar 7 8 9 + ( )
        { label: '7', action: 'digit', class: 'btn-number' },
        { label: '8', action: 'digit', class: 'btn-number' },
        { label: '9', action: 'digit', class: 'btn-number' },
        { label: '×', action: 'operator', value: '*', class: 'btn-operator' },
        { label: '4', action: 'digit', class: 'btn-number' },
        { label: '5', action: 'digit', class: 'btn-number' },
        { label: '6', action: 'digit', class: 'btn-number' },
        { label: '−', action: 'operator', value: '-', class: 'btn-operator' },
        
        // Satır 6: 1 2 3 + 
        { label: '1', action: 'digit', class: 'btn-number' },
        { label: '2', action: 'digit', class: 'btn-number' },
        { label: '3', action: 'digit', class: 'btn-number' },
        { label: '+', action: 'operator', value: '+', class: 'btn-operator' },
        { label: '0', action: 'digit', class: 'btn-number span-2' }, // 0 iki sütun
        { label: '.', action: 'digit', class: 'btn-number' },
        { label: '=', action: 'equals', class: 'btn-equals' },
    ];

    // ---------- BUTONLARI OLUŞTUR VE DİNLEYİCİ EKLE ----------
    function renderButtons() {
        buttonContainer.innerHTML = '';
        buttonDefinitions.forEach(def => {
            const btn = document.createElement('button');
            btn.textContent = def.label;
            btn.className = `btn ${def.class || ''}`;
            if (def.label === '0') btn.classList.add('span-2');
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                handleButtonAction(def);
            });
            
            buttonContainer.appendChild(btn);
        });
    }

    /** Buton aksiyonlarını yönlendir */
    function handleButtonAction(def) {
        switch (def.action) {
            case 'digit':
                inputDigit(def.label);
                break;
            case 'operator':
                setOperator(def.value);
                break;
            case 'singleArg':
                applySingleArgFunction(def.func);
                break;
            case 'constant':
                insertConstant(def.value);
                break;
            case 'equals':
                performEquals();
                break;
            case 'clearAll':
                clearAll();
                break;
            case 'clearEntry':
                clearEntry();
                break;
            case 'backspace':
                backspace();
                break;
            case 'percentage':
                applyPercentage();
                break;
            case 'memoryAdd': memoryAdd(); break;
            case 'memorySubtract': memorySubtract(); break;
            case 'memoryRecall': memoryRecall(); break;
            case 'memoryClear': memoryClear(); break;
            case 'toggleAngle': toggleAngleMode(); break;
            default: break;
        }
    }

    // ---------- BAŞLAT ----------
    renderButtons();
    updateDisplay();

    // Klavye desteği (opsiyonel)
    window.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '0' && key <= '9') inputDigit(key);
        else if (key === '.') inputDigit('.');
        else if (key === '+' || key === '-' || key === '*' || key === '/') {
            let op = key;
            if (key === '*') op = '*';
            if (key === '/') op = '/';
            setOperator(op);
        }
        else if (key === 'Enter' || key === '=') performEquals();
        else if (key === 'Escape') clearAll();
        else if (key === 'Backspace') backspace();
        else if (key === '%') applyPercentage();
        e.preventDefault();
    });

})();