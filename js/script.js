const POINT_RADIUS = 20;
const SELECTED_BOX_OFFSET = 5;
const MINI_POINT_RADIUS = 20;

function fieldSwitcherEventHandlers() {
    // matchfield & skillsfield buttons
    const matchFieldButton = document.getElementById('match-field-button');
    const skillsFieldButton = document.getElementById('skills-field-button');
    const matchField = document.getElementById('match-field');

    matchFieldButton.addEventListener('click', () => {
        matchField.style.display = 'block';
    });

    skillsFieldButton.addEventListener('click', () => {
        matchField.style.display = 'none';
    });
}

function mediaControlEventHandlers() {
    // play, pause & reset buttons
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');

    playButton.addEventListener('click', () => {
        playButton.style.display = 'none';
        pauseButton.style.display = 'block';
        console.log('play button pressed, pause button displayed');
    });

    pauseButton.addEventListener('click', () => {
        playButton.style.display = 'block';
        pauseButton.style.display = 'none';
        console.log('pause button pressed, play button displayed');
    });

    resetButton.addEventListener('click', () => {
        if (pauseButton.style.display === 'block') {
            playButton.style.display = 'block';
            pauseButton.style.display = 'none';
            console.log('reset button pressed, play button displayed');
        }
        console.log('reset button pressed');
    });
}

fieldSwitcherEventHandlers();
mediaControlEventHandlers();

// get canvas size
const fieldCanvas = document.getElementById('field-canvas');
const ctx = fieldCanvas.getContext('2d');

// resize the canvas to become the actual width and height of the canvas (js is goofy)
function resizeCanvas() {
    const computedStyle = getComputedStyle(fieldCanvas);
    fieldCanvas.width = parseFloat(computedStyle.width);
    fieldCanvas.height = parseFloat(computedStyle.height);
}

resizeCanvas();

console.log("Canvas size:", fieldCanvas.width, fieldCanvas.height);

let mouseX = 0;
let mouseY = 0;

fieldCanvas.addEventListener('mousemove', (e) => {
    let rect = fieldCanvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left - fieldCanvas.width / 2;
    mouseY = -(e.clientY - rect.top - fieldCanvas.height / 2);

    // console.log("Mouse position:", mouseX, mouseY);
});

// Point class
class Point {
    constructor(x, y, theta = 0) {
        this.x = x;
        this.y = y;
        this.theta = theta;
        this.updateCanvasPosition();
    }

    moveToPoint(x, y) {
        this.x = x;
        this.y = y;
        this.updateCanvasPosition();
    }

    updateCanvasPosition() {
        this._canvasX = this.x + fieldCanvas.width / 2;
        this._canvasY = -this.y + fieldCanvas.height / 2;
    }

    rotate(theta) {
        this.theta += theta;
        this.theta %= 2 * Math.PI;
    }

    rotateTo(theta) {
        this.theta = theta;
        this.theta %= 2 * Math.PI;
    }

    distanceTo_Squared(point) {
        return (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
    }

    angleTo(point) {
        return Math.atan2(point.y - this.y, point.x - this.x);
    }

    isHovered() {
        return this.distanceTo_Squared(new Point(mouseX, mouseY)) < (POINT_RADIUS + SELECTED_BOX_OFFSET) ** 2;
    }

    draw(num = 0) {
        // Draw the circle
        ctx.beginPath();
        ctx.arc(this._canvasX, this._canvasY, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'purple';
        ctx.fill();

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(
            this._canvasX + (POINT_RADIUS / 3) * Math.cos(-this.theta),
            this._canvasY + (POINT_RADIUS / 3) * Math.sin(-this.theta)
        );
        ctx.lineTo(
            this._canvasX + POINT_RADIUS * Math.cos(-this.theta),
            this._canvasY + POINT_RADIUS * Math.sin(-this.theta)
        );
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw the number
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(num, this._canvasX, this._canvasY);

        // Draw the border
        ctx.beginPath();
        ctx.arc(this._canvasX, this._canvasY, POINT_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawMini(num = 0) {
        ctx.beginPath();
        ctx.arc(this._canvasX, this._canvasY, MINI_POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'purple';
        ctx.fill();
    }

    drawLineTo(point) {
        ctx.beginPath();
        ctx.setLineDash([10, 10]);
        ctx.moveTo(this._canvasX, this._canvasY);
        ctx.lineTo(point._canvasX, point._canvasY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawSelectedBox() {
        ctx.beginPath();
        ctx.rect(
            this._canvasX - (POINT_RADIUS + SELECTED_BOX_OFFSET),
            this._canvasY - (POINT_RADIUS + SELECTED_BOX_OFFSET),
            (POINT_RADIUS + SELECTED_BOX_OFFSET) * 2,
            (POINT_RADIUS + SELECTED_BOX_OFFSET) * 2
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

console.log("<G1> 343X is permanently banned from competing in VEX Robotics");
console.log("source: trust me bro");

let points = [];
points.push(new Point(0, 0, 0));

let selectedPoint = null;

fieldCanvas.addEventListener('mousedown', handleMouseDown);

function handleMouseDown(e) {
    if (e.button !== 0) return;
    selectedPoint = points.find((point) => point.isHovered());

    if (!selectedPoint) {
        let newPoint = new Point(mouseX, mouseY);
        points.push(newPoint);
        selectedPoint = newPoint;
    }
    updateAngleWithMove();

    fieldCanvas.addEventListener('mousemove', movePoint);

    fieldCanvas.addEventListener('mouseup', stopMovingPoint);
    window.addEventListener('keydown', handleKeyDown);
    robotX.addEventListener('input', updateRobotX);
    robotY.addEventListener('input', updateRobotY);

    if (selectedPoint === points[0]) {
        fieldCanvas.addEventListener('wheel', changeAngle);
        robotAngle.addEventListener('input', updateRobotAngle);
    } else {
        fieldCanvas.removeEventListener('wheel', changeAngle);
        robotAngle.removeEventListener('input', updateRobotAngle);
    }

    updateSidebars();
    console.log("mouse down, selecting point", points.indexOf(selectedPoint) + 1, ". Selected point:", selectedPoint);
}

function handleKeyDown(e) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.type === 'text') {
        return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
        removePoint(selectedPoint);
    }
}

function removePoint(point) {
    if (points.length > 1) {
        const index = points.indexOf(point);
        points.splice(index, 1);
        selectedPoint = null;
    }

    updateSidebars();
}

// Update the initial position to be the position of node 1
const initialX = points[0]._canvasX;
const initialY = points[0]._canvasY;

// Adjust the mouse position based on the initial position
fieldCanvas.addEventListener('mousemove', (e) => {
    let rect = fieldCanvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left - initialX;
    mouseY = -(e.clientY - rect.top - initialY);
});

function movePoint() {
    if (selectedPoint) {
        selectedPoint.moveToPoint(mouseX, mouseY);
        updateAngleWithMove();
    }

    updateSidebars();
    console.log("mouse move, moving point", points.indexOf(selectedPoint) + 1);
}

function updateAngleWithMove() {
    if (selectedPoint) {
        const prevPoint = points[points.indexOf(selectedPoint) - 1];
        if (prevPoint) {
            selectedPoint.theta = Math.atan2(selectedPoint.y - prevPoint.y, selectedPoint.x - prevPoint.x);
        }
    }

    updateSidebars();
    console.log("mouse move, updating angle of point", points.indexOf(selectedPoint) + 1);
}

function stopMovingPoint() {
    fieldCanvas.removeEventListener('mousemove', movePoint);
    fieldCanvas.removeEventListener('mouseup', stopMovingPoint);

    console.log("mouse up, stopping event listening on point", points.indexOf(selectedPoint) + 1);
}

function changeAngle(e) {
    const oldTheta = selectedPoint.theta * 180 / Math.PI;

    if (selectedPoint && selectedPoint.isHovered()) {
        const direction = e.deltaY > 0 ? -1 : 1;
        selectedPoint.rotate(2 * direction * Math.PI / 180);
    }

    updateSidebars();
    console.log("mouse wheel, changing angle of point", points.indexOf(selectedPoint) + 1, "from", oldTheta, "to", selectedPoint.theta * 180 / Math.PI);
}

function isEmpty(str) {
    return !str.trim().length;
}

function updateRobotX() {
    if (isEmpty(robotX.value) || Number.isNaN(robotX.value) || robotX.value.endsWith('.')) {
        selectedPoint.moveToPoint(0, selectedPoint.y);
        return;
    }

    const xInputValue = constrainInputToField(parseFloat(robotX.value));

    if (selectedPoint) {
        selectedPoint.moveToPoint(convertFieldUnitsToPixel(xInputValue), selectedPoint.y);
    }

    updateCode();
    console.log("updating robot x to", robotX.value, ". Selected point:", points.indexOf(selectedPoint) + 1);
}

function updateRobotY() {
    if (isEmpty(robotY.value) || Number.isNaN(robotY.value) || robotY.value.endsWith('.')) {
        selectedPoint.moveToPoint(selectedPoint.x, 0);
        return;
    }

    const yInputValue = constrainInputToField(parseFloat(robotY.value));

    if (selectedPoint) {
        selectedPoint.moveToPoint(selectedPoint.x, convertFieldUnitsToPixel(yInputValue));
    }

    updateCode();
    console.log("updating robot y to", robotY.value, ". Selected point:", points.indexOf(selectedPoint) + 1);
}

function updateRobotAngle() {
    if (isEmpty(robotAngle.value) || Number.isNaN(robotAngle.value) || robotAngle.value.endsWith('.')) {
        selectedPoint.theta = 0;
        return;
    }

    const angleInputValue = normalizeAngle_n180_180(parseFloat(robotAngle.value));

    if (selectedPoint) {
        selectedPoint.theta = angleInputValue * Math.PI / 180;
    }

    updateCode();
    console.log("updating robot angle to", robotAngle.value, ". Selected point:", points.indexOf(selectedPoint) + 1);
}

function constrainInputToField(number) {
    return Math.max(-72, Math.min(72, number));
}

const robotX = document.getElementById('robot-x');
const robotY = document.getElementById('robot-y');
const robotAngle = document.getElementById('robot-angle');
const selectedVar = document.getElementById('selected-var');

function update() {
    function drawPoints() {
        ctx.clearRect(0, 0, fieldCanvas.width, fieldCanvas.height);

        points.forEach((point, index) => {
            if (index < points.length - 1) {
                point.drawLineTo(points[index + 1]);
            }
            point.draw(index + 1);

            if (point === selectedPoint) {
                point.drawSelectedBox();
            }
        });

        requestAnimationFrame(update);
    }
    drawPoints();
}

update();

function updateSidebars() {
    if (selectedPoint) {
        robotX.value = formatNumberWithCeiling(convertPixelToFieldUnits(selectedPoint.x), 2);
        robotY.value = formatNumberWithCeiling(convertPixelToFieldUnits(selectedPoint.y), 2);
        robotAngle.value = formatNumberWithCeiling(selectedPoint.theta * 180 / Math.PI, 2);
        selectedVar.innerText = "Point " + (points.indexOf(selectedPoint) + 1);
    } else {
        robotX.value = '';
        robotY.value = '';
        robotAngle.value = '';
        selectedVar.innerText = "None";
    }

    updateCode();
}

function updateCode() {
    let newCode = '';
    points.forEach((point, index) => {
        if (index === points.length - 1) {
            return;
        }

        const distance = Math.sqrt(point.distanceTo_Squared(points[index + 1]));
        const angle = points[index + 1].theta - point.theta;

        if (angle) {
            newCode += 'chassis.turnToHeading(' +
                formatNumberWithCeiling(angle * 180 / Math.PI) +
                ', 4000);\n';
        }

        newCode +=
            'chassis.moveToPoint(' +
            formatNumberWithCeiling(convertPixelToFieldUnits(points[index + 1].x - points[0].x)) +
            ', ' +
            formatNumberWithCeiling(convertPixelToFieldUnits(points[index + 1].y - points[0].y)) +
            ', 4000);\n';
    });

    codeTextbox.setValue(newCode);
}

function convertPixelToFieldUnits(number) {
    return number * (144 / fieldCanvas.width);
}

function convertFieldUnitsToPixel(number) {
    return number * (fieldCanvas.width / 144);
}

function formatNumberWithCeiling(number, decimalPlaces = 6) {
    let roundedNumber = Math.ceil(number * (10 ** decimalPlaces)) / (10 ** decimalPlaces);
    let formattedNumber = roundedNumber.toString().replace(/(\.\d*?)0+$/, '$1');

    return formattedNumber;
}

const codeTextbox = CodeMirror(document.getElementById('code-textbox'), {
    mode: 'text/x-c++src',
    theme: 'material-darker',
});

codeTextbox.setSize('100%', '100%');

console.log("<G2> 1388B is by default the VEX world champion");

function normalizeAngle_n180_180(angle) {
    return (angle + 180) % 360 - 180;
}
