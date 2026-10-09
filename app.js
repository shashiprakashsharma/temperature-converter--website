/**
 * ThermoShift - Interactive Temperature Converter
 * Vanilla JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // DOM Element References
    // ----------------------------------------------------------------------
    const tempInput = document.getElementById('tempInput');
    const unitSelect = document.getElementById('unitSelect');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const liveToggle = document.getElementById('liveToggle');
    const errorMessage = document.getElementById('errorMessage');
    const errorTitle = document.getElementById('errorTitle');
    const errorText = document.getElementById('errorText');

    // Result value elements
    const valCelsius = document.getElementById('valCelsius');
    const valFahrenheit = document.getElementById('valFahrenheit');
    const valKelvin = document.getElementById('valKelvin');

    // Result card containers
    const cardCelsius = document.getElementById('cardCelsius');
    const cardFahrenheit = document.getElementById('cardFahrenheit');
    const cardKelvin = document.getElementById('cardKelvin');

    // Visualizer elements
    const mercuryFill = document.getElementById('mercuryFill');
    const thermalLevelText = document.getElementById('thermalLevelText');
    const waterStateText = document.getElementById('waterStateText');
    const absZeroOffset = document.getElementById('absZeroOffset');
    const thermalStateBadgeText = document.getElementById('thermalStateText');

    // Formula elements
    const formulaCtoF = document.getElementById('formulaCtoF');
    const formulaCtoK = document.getElementById('formulaCtoK');
    const formulaCalculationText = document.getElementById('formulaCalculationText');

    // Preset buttons & copy buttons
    const presetBtns = document.querySelectorAll('.preset-btn');
    const copyBtns = document.querySelectorAll('.copy-btn');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    // Absolute zero thresholds
    const ABSOLUTE_ZERO = {
        C: -273.15,
        F: -459.67,
        K: 0
    };

    // ----------------------------------------------------------------------
    // Core Conversion Functions
    // ----------------------------------------------------------------------
    
    /**
     * Converts any input temperature to Celsius
     */
    function toCelsius(value, unit) {
        switch (unit) {
            case 'C':
                return value;
            case 'F':
                return (value - 32) * (5 / 9);
            case 'K':
                return value - 273.15;
            default:
                return value;
        }
    }

    /**
     * Converts Celsius to Fahrenheit
     */
    function celsiusToFahrenheit(celsius) {
        return (celsius * (9 / 5)) + 32;
    }

    /**
     * Converts Celsius to Kelvin
     */
    function celsiusToKelvin(celsius) {
        return celsius + 273.15;
    }

    /**
     * Format numbers cleanly (e.g. 2 decimal places, trimming trailing zeros if clean integer)
     */
    function formatTempNumber(num) {
        if (isNaN(num)) return '---';
        // Round to 2 decimal places
        const rounded = Math.round(num * 100) / 100;
        // If it has decimals, format to 2 places, otherwise display as clean string
        return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
    }

    // ----------------------------------------------------------------------
    // Input Validation & Processing
    // ----------------------------------------------------------------------

    /**
     * Validates input string for numeric validity and absolute zero bounds
     */
    function validateInput(rawStr, unit) {
        const str = rawStr.trim();

        if (str === '') {
            return { isValid: false, type: 'EMPTY', message: 'Please enter a temperature value.' };
        }

        // Strict numeric check (rejects letters, multiple decimals, special characters)
        const numericRegex = /^-?\d*(\.\d+)?$/;
        if (!numericRegex.test(str) || isNaN(Number(str))) {
            return { 
                isValid: false, 
                type: 'NAN', 
                message: 'Non-numeric input detected. Please enter a valid number (e.g., 25 or -10.5).' 
            };
        }

        const value = parseFloat(str);
        const minAllowed = ABSOLUTE_ZERO[unit];

        // Absolute Zero Check
        if (value < minAllowed) {
            let unitSymbol = unit === 'C' ? '°C' : (unit === 'F' ? '°F' : 'K');
            return {
                isValid: false,
                type: 'ABSOLUTE_ZERO',
                message: `Absolute Zero Violation! Temperature cannot be lower than ${minAllowed}${unitSymbol} (0 Kelvin).`
            };
        }

        return { isValid: true, value: value };
    }

    // ----------------------------------------------------------------------
    // UI Update Handlers
    // ----------------------------------------------------------------------

    /**
     * Performs main conversion logic and UI refresh
     */
    function performConversion() {
        const rawValue = tempInput.value;
        const currentUnit = unitSelect.value;
        const validation = validateInput(rawValue, currentUnit);

        // Update Active Card visual indication
        updateActiveUnitCards(currentUnit);

        if (!validation.isValid) {
            showError(validation.type, validation.message);
            resetOutputDisplays();
            return;
        }

        // Clear error if valid
        hideError();

        const inputValue = validation.value;
        const celsiusVal = toCelsius(inputValue, currentUnit);
        const fahrenheitVal = celsiusToFahrenheit(celsiusVal);
        const kelvinVal = celsiusToKelvin(celsiusVal);

        // Update Output Card Text
        valCelsius.textContent = formatTempNumber(celsiusVal);
        valFahrenheit.textContent = formatTempNumber(fahrenheitVal);
        valKelvin.textContent = formatTempNumber(kelvinVal);

        // Update Visual Thermometer & Atmospheric Theme
        updateThermometerAndTheme(celsiusVal, kelvinVal);

        // Update Formula Breakdown Text
        updateFormulaBreakdown(inputValue, currentUnit, celsiusVal, fahrenheitVal, kelvinVal);
    }

    /**
     * Highlights the card corresponding to the user's selected input unit
     */
    function updateActiveUnitCards(currentUnit) {
        [cardCelsius, cardFahrenheit, cardKelvin].forEach(card => {
            if (card.dataset.unit === currentUnit) {
                card.classList.add('active-unit');
            } else {
                card.classList.remove('active-unit');
            }
        });
    }

    /**
     * Shows inline error callout message
     */
    function showError(type, msg) {
        tempInput.classList.add('input-error');
        errorMessage.classList.remove('hidden');

        if (type === 'ABSOLUTE_ZERO') {
            errorTitle.textContent = 'Absolute Zero Boundary Exceeded';
        } else if (type === 'NAN') {
            errorTitle.textContent = 'Invalid Numeric Input';
        } else {
            errorTitle.textContent = 'Input Required';
        }
        errorText.textContent = msg;
    }

    /**
     * Hides error callout message
     */
    function hideError() {
        tempInput.classList.remove('input-error');
        errorMessage.classList.add('hidden');
    }

    /**
     * Resets visual outputs when input is invalid
     */
    function resetOutputDisplays() {
        valCelsius.textContent = '---';
        valFahrenheit.textContent = '---';
        valKelvin.textContent = '---';
        formulaCalculationText.textContent = 'Enter a valid temperature to see formula step-by-step.';
    }

    /**
     * Updates mercury thermometer fill, atmospheric theme, & water state indicators
     */
    function updateThermometerAndTheme(celsius, kelvin) {
        // Calculate Mercury height percentage based on range -50°C to 100°C
        const minTemp = -50;
        const maxTemp = 100;
        let percentage = ((celsius - minTemp) / (maxTemp - minTemp)) * 100;
        
        // Clamp percentage between 5% and 98% for visual aesthetics
        percentage = Math.max(5, Math.min(98, percentage));
        mercuryFill.style.height = `${percentage}%`;

        // Determine Theme & Thermal Level
        let themeClass = 'theme-moderate';
        let levelText = 'Moderate';
        let waterState = 'Liquid Water';

        if (celsius <= -50) {
            themeClass = 'theme-extreme-cold';
            levelText = 'Extremely Frigid';
            waterState = 'Solid Ice (Glacial)';
        } else if (celsius <= 0) {
            themeClass = 'theme-cold';
            levelText = 'Freezing Cold';
            waterState = 'Solid Ice / Freezing';
        } else if (celsius <= 28) {
            themeClass = 'theme-moderate';
            levelText = 'Comfortable / Ambient';
            waterState = 'Liquid Water';
        } else if (celsius <= 50) {
            themeClass = 'theme-warm';
            levelText = 'Warm / Hot';
            waterState = 'Warm Liquid';
        } else {
            themeClass = 'theme-hot';
            levelText = 'Extremely Hot';
            waterState = celsius >= 100 ? 'Superheated Steam / Gas' : 'Vaporizing Liquid';
        }

        // Apply theme class to body
        document.body.className = themeClass;

        // Update stats
        thermalLevelText.textContent = levelText;
        waterStateText.textContent = waterState;
        absZeroOffset.textContent = `${formatTempNumber(kelvin)} K`;
        thermalStateBadgeText.textContent = levelText;
    }

    /**
     * Dynamic formula breakdown explanation
     */
    function updateFormulaBreakdown(inputVal, unit, celsius, fahrenheit, kelvin) {
        const inStr = `${formatTempNumber(inputVal)}${unit === 'K' ? ' K' : '°' + unit}`;

        if (unit === 'C') {
            formulaCtoF.textContent = `°F = (${inStr} × 9/5) + 32 = ${formatTempNumber(fahrenheit)}°F`;
            formulaCtoK.textContent = `K = ${inStr} + 273.15 = ${formatTempNumber(kelvin)} K`;
            formulaCalculationText.innerHTML = `Converted <strong>${inStr}</strong> directly to Fahrenheit using <em>(°C × 1.8) + 32</em> and to Kelvin by adding <em>273.15</em>.`;
        } else if (unit === 'F') {
            formulaCtoF.textContent = `°C = (${inStr} - 32) × 5/9 = ${formatTempNumber(celsius)}°C`;
            formulaCtoK.textContent = `K = (${inStr} - 32) × 5/9 + 273.15 = ${formatTempNumber(kelvin)} K`;
            formulaCalculationText.innerHTML = `Converted <strong>${inStr}</strong> to Celsius by subtracting 32 and multiplying by 5/9, yielding <strong>${formatTempNumber(celsius)}°C</strong>.`;
        } else if (unit === 'K') {
            formulaCtoF.textContent = `°C = ${inStr} - 273.15 = ${formatTempNumber(celsius)}°C`;
            formulaCtoK.textContent = `°F = (${inStr} - 273.15) × 9/5 + 32 = ${formatTempNumber(fahrenheit)}°F`;
            formulaCalculationText.innerHTML = `Converted <strong>${inStr}</strong> to Celsius by subtracting 273.15 (<strong>${formatTempNumber(celsius)}°C</strong>), then derived Fahrenheit.`;
        }
    }

    // ----------------------------------------------------------------------
    // Event Listeners
    // ----------------------------------------------------------------------

    // Live conversion input handler
    tempInput.addEventListener('input', () => {
        if (liveToggle.checked) {
            performConversion();
        }
    });

    // Unit selector change handler
    unitSelect.addEventListener('change', () => {
        performConversion();
    });

    // Convert button click handler
    convertBtn.addEventListener('click', () => {
        performConversion();
    });

    // Clear input button
    clearBtn.addEventListener('click', () => {
        tempInput.value = '';
        tempInput.focus();
        if (liveToggle.checked) {
            performConversion();
        }
    });

    // Presets click handlers
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.val;
            const unit = btn.dataset.unit;
            tempInput.value = val;
            unitSelect.value = unit;
            performConversion();
        });
    });

    // Copy to Clipboard buttons
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const targetEl = document.getElementById(targetId);
            if (targetEl && targetEl.textContent !== '---') {
                const textToCopy = targetEl.textContent;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast(`Copied ${textToCopy} to clipboard!`);
                }).catch(err => {
                    showToast(`Copied: ${textToCopy}`);
                });
            }
        });
    });

    let toastTimeout = null;
    function showToast(message) {
        toastMsg.textContent = message;
        toast.classList.remove('hidden');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 2500);
    }

    // Initial Trigger on Page Load
    performConversion();
});
