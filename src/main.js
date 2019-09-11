const GLOBAL   = {};
GLOBAL.mouse   = {};
GLOBAL.keys    = [];

const LEFT = 37;
const RIGHT = 39;
const UP = 38;
const validKeys = [LEFT, RIGHT, UP];

function getXRange(min) {
  return { min: min, max: window.innerWidth - min };
}

function getYRange(min) {
  return { min: min, max: window.innerHeight - min };
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomX(min) {
  return getRandomArbitrary(min, window.innerWidth - min);
}

function getRandomY(min) {
  return getRandomArbitrary(min, window.innerHeight - min);
}

function getRandom(max) {
  return Math.floor(Math.random() * max);
}

function getRadians(angle) {
  return angle * Math.PI/180;
}

function getDxDy(angle, speed) {
  const dx = Math.cos(getRadians(angle)) * speed;
  const dy = Math.sin(getRadians(angle)) * speed;
  return { dx, dy };
}

function createCircle() {
  const type = 'circle';
  const id = 100;
  const radius = 40;
  const x = window.innerWidth / 2;
  const y = 100;
  const nextX = x;
  const nextY = y;
  const testAngle = 270;
  const angle = 0;
  const speed = Math.abs(radius-100)/16;
  const { dx, dy } = getDxDy(angle, speed);
  const xRange = getXRange(radius);
  const yRange = getYRange(radius);
  const satelliteAngle = 0;
  return { type, id, radius, x, y, angle, testAngle, speed, dx, dy, xRange, yRange, satelliteAngle };
}

function clone(obj) {
  return Object.assign({}, obj);
}

function compose() {
  var fns = arguments;

  return function (result) {
    for (var i = fns.length - 1; i > -1; i--) {
      result = fns[i].call(this, result);
    }

    return result;
  };
};

function clearScreen(ctx) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function isCircle(obj) {
  return obj && obj.type === 'circle';
}

function isBall(obj) {
  return obj && obj.type === 'ball';
}

function isInRange(value, range) {
  return value ? (value >= range.min && value <= range.max) : false;
}

function getNextTestAngle(angle, currentTestAngle) {
  if (angle === 0) {
    const nextTestAngle = currentTestAngle + 1;
    if (nextTestAngle > 358) {
      return 358;
    } else {
      return nextTestAngle;
    }
  } else {
    const nextTestAngle = currentTestAngle - 1;
    if (nextTestAngle < 182) {
      return 182;
    } else {
      return nextTestAngle;
    }
  }
}

function getSatelliteAngle(currentAngle) {
  const nextAngle = currentAngle + 10;
  return nextAngle >= 360 ? 0 : nextAngle;
}

function applyLeftOrRight(circle) {
  if (circle.dx === undefined) return circle;
  const c = clone(circle);
  if (isInRange(c.x + c.dx, c.xRange)) {
    c.x += c.dx;
  } else {
    c.angle = 180 - c.angle;
    const { dx } = getDxDy(c.angle, c.speed);
    c.dx = dx;
  }

  c.testAngle = getNextTestAngle(c.angle, c.testAngle)
  return c;
}

function applyUpOrDown(circle) {
  if (circle.dy === undefined) return circle;
  const c = clone(circle);
  if (isInRange(c.y + c.dy, c.yRange)) {
    c.y += c.dy;
  } else {
    c.angle = 360 - c.angle;
    const { dy } = getDxDy(c.angle, c.speed);
    c.dy = dy;
  }
  return c;
}

function applyKeyCircle(circle) {
  if (GLOBAL.keys.length === 0) {
    return circle;
  }
  const key = GLOBAL.keys[0];
  if (key === LEFT || key === RIGHT) {
    console.log(key);
    GLOBAL.keys.shift();
    const c = clone(circle);

    if (key === RIGHT) {
      c.angle = 0;
    } else {
      c.angle = 180;
    }
    const { dx } = getDxDy(c.angle, c.speed);
    c.dx = dx;

    if (isInRange(c.x + c.dx, c.xRange)) {
      c.x += c.dx;
    }

    c.testAngle = getNextTestAngle(c.angle, c.testAngle)
    return c;
  }
  return circle
}

function applySatellite(circle) {
  const c = clone(circle);
  c.satelliteAngle = getSatelliteAngle(c.satelliteAngle)
  console.log(c.satelliteAngle);
  return c;
}

const applyStyle = filter => style => circles => {
  return circles.map((circle, index) =>
    filter(circle, circles, index) ? style(circle, circles, index) : circle
  );
}

const applyFreely = compose(
  applyLeftOrRight,
  applyUpOrDown
);

const moveLeftOrRight = applyStyle(isCircle)(applyLeftOrRight);
const moveBall = applyStyle(isBall)(applyFreely);
const moveCircle = applyStyle(isCircle)(applyKeyCircle);
const moveSatellite = applyStyle(isCircle)(applySatellite);

function drawCircle(ctx, circle) {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2, false);
  ctx.fillStyle = circle.fillStyle || "rgba(20, 100, 20, 0.1)";
  ctx.strokeStyle = circle.strokeStyle || "black";
  ctx.stroke();
  ctx.fill();
}

function drawDirectionLine(ctx, circle) {
  ctx.beginPath();
  ctx.strokeStyle = 'pink';
  ctx.moveTo(circle.x, circle.y);
  const { dx, dy } = getDxDy(circle.testAngle, circle.radius);
  ctx.lineTo(circle.x + dx, circle.y + dy);
  ctx.closePath();
  ctx.stroke();
}

function drawSatellite(ctx, circle) {
  ctx.beginPath();
  const { dx, dy } = getDxDy(circle.satelliteAngle, circle.radius);
  const x = circle.x + dx;
  const y = circle.y + dy;
  ctx.arc(x, y, circle.radius/10, 0, Math.PI*2, false);
  ctx.fillStyle = "brown"
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.fill();
}

const drawCircles = ctx => circles => {
  circles.forEach(function(circle) {
    if (isCircle(circle)) {
      drawCircle(ctx, circle);
      drawDirectionLine(ctx, circle);
      drawSatellite(ctx, circle);
    }
    if (isBall(circle)) {
      drawCircle(ctx, circle);
    }
  });
  return circles;
}

function findBall(objs) {
  return objs.find(item => {
    return isBall(item);
  });
}

function findCircle(objs) {
  return objs.find(item => {
    return isCircle(item);
  });
}

function createBall(circle) {
  const ball = clone(circle);
  ball.type = 'ball';
  ball.angle = circle.testAngle;
  ball.testAngle = 0;
  ball.fillStyle = 'red';
  ball.radius = 6;
  ball.xRange = getXRange(ball.radius);
  ball.yRange = getYRange(ball.radius);
  ball.speed = ball.speed * 2;
  const { dx, dy } = getDxDy(ball.angle, ball.speed);
  ball.dx = dx;
  ball.dy = dy;
  return ball;
}

function addBall(objs) {
  if (GLOBAL.keys.length === 0) {
    return objs;
  }

  const key = GLOBAL.keys[0];
  if (key === UP) {
    GLOBAL.keys.shift();
    console.log(key);
    const c = findCircle(objs);
    if (c) {
      c.id = objs.length;
      objs.push(createBall(c));
    }
  }
  return objs;
}

function createPerson(count = 0) {
  const width = 20;
  const height = 50;
  const x = (window.innerWidth / 2) - (width / 2);
  const y = window.innerHeight - height;
  const fillStyle = 'blue'
  const xRange = getXRange(0);
  return { x, y, width, height, fillStyle, xRange };
}

function startAnimation(ctx) {
  let objs = [];
  objs.push(createCircle());
  const update = compose(
    addBall,
    moveBall,
    moveCircle,
    moveSatellite
  );
  const draw = compose(
    drawCircles(ctx)
  );
  function animate() {
    objs = update(objs);
    clearScreen(ctx);
    objs = draw(objs);
  }
  setInterval(function() {
    animate();
  }, 30);
}

function notify(msg) {
  const m = document.querySelectorAll(".message")[0];
  m.innerHTML = msg;
  m.className = 'message';
  setTimeout(function() {
    m.className = 'message hide';
  }, 1000);
}

function activate() {
  notify('Angle');
  setTimeout(function() {
    const c = document.querySelector("canvas");
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const ctx = c.getContext("2d");
    startAnimation(ctx);
  }, 1000);
}

function processKeyEvent(e) {
  if (validKeys.includes(e.keyCode)) {
    GLOBAL.keys.push(e.keyCode);
    console.log(GLOBAL.keys.length);
  }
}

window.addEventListener('load', activate);
window.addEventListener('keydown', processKeyEvent, true);
