type Operator = "+" | "-" | "*" | "/";

let current = "0";
let previous: number | null = null;
let operator: Operator | null = null;
let waitingForInput = false;

const display = document.querySelector<HTMLDivElement>("#display")!;

function render(): void {
    display.textContent = current;
}

function clear(): void {
    current = "0";
    previous = null;
    operator = null;
    waitingForInput = false;
}

function inputDigit(digit: string): void {
    if (waitingForInput || current === "Error") {
        current = digit;
        waitingForInput = false;
    } else {
        current = current === "0" ? digit : current + digit;
    }
}

function inputDecimal(): void {
    if (waitingForInput || current === "Error") {
        current = "0.";
        waitingForInput = false;
    } else if (!current.includes(".")) {
        current += ".";
    }
}

function calculate(
    left: number,
    right: number,
    operation: Operator
): number {
    switch (operation) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "/": return left / right;
    }
}

function applyPendingOperation(): boolean {
    if (previous === null || operator === null) return true;

    const result = calculate(previous, Number(current), operator);

    if (!Number.isFinite(result)) {
        clear();
        current = "Error";
        return false;
    }

    // ลดเศษทศนิยมจากการคำนวณ เช่น 0.1 + 0.2
    current = String(Number(result.toPrecision(12)));
    return true;
}

function selectOperator(nextOperator: Operator): void {
    if (current === "Error") return;

    if (operator !== null && !waitingForInput) {
        if (!applyPendingOperation()) return;
    }

    previous = Number(current);
    operator = nextOperator;
    waitingForInput = true;
}

function equals(): void {
    if (waitingForInput || operator === null) return;
    if (!applyPendingOperation()) return;

    previous = null;
    operator = null;
    waitingForInput = true;
}

document.querySelector(".keys")!.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest("button");
    if (!button) return;

    const digit = button.dataset.digit;
    const operation = button.dataset.operator;

    if (digit !== undefined) {
        inputDigit(digit);
    } else if (
        operation === "+" ||
        operation === "-" ||
        operation === "*" ||
        operation === "/"
    ) {
        selectOperator(operation);
    } else {
        switch (button.dataset.action) {
            case "clear":
                clear();
                break;

            case "delete":
                if (!waitingForInput && current !== "Error") {
                    current = current.slice(0, -1);
                    if (current === "" || current === "-") current = "0";
                }
                break;

            case "decimal":
                inputDecimal();
                break;

            case "equals":
                equals();
                break;
        }
    }

    render();
});


async function showVersion(): Promise<void> {
    const element = document.querySelector<HTMLParagraphElement>("#version");
    if (!element) return;

    try {
        const version = await window.appInfo.getVersion();
        element.textContent = `เวอร์ชัน ${version}`;
    } catch (error) {
        element.textContent = "อ่านเวอร์ชันไม่สำเร็จ";
        console.error(error);
    }
}

const checkUpdateButton =
    document.querySelector<HTMLButtonElement>("#check-update")!;

const updateStatus =
    document.querySelector<HTMLParagraphElement>("#update-status")!;

checkUpdateButton.addEventListener("click", async () => {
    checkUpdateButton.disabled = true;
    updateStatus.textContent = "กำลังตรวจสอบจาก GitHub...";

    try {
        const result = await window.appInfo.checkUpdate();

        if (!result.ok) {
            updateStatus.textContent = result.message;
            return;
        }

        if (result.available) {
            updateStatus.textContent =
                `พบเวอร์ชันใหม่ ${result.latestVersion}\n${result.notes}`;
        } else {
            updateStatus.textContent =
                `ไม่มีเวอร์ชันใหม่กว่า ${result.currentVersion}`;
        }
    } catch (error) {
        updateStatus.textContent = "ตรวจสอบอัปเดตไม่สำเร็จ";
        console.error(error);
    } finally {
        checkUpdateButton.disabled = false;
    }
});

render();
void showVersion();