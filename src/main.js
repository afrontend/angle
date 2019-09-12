const GLOBAL   = {};
GLOBAL.mouse   = {};
GLOBAL.keys    = [];
GLOBAL.timer   = null;

const LEFT = 37;
const RIGHT = 39;
const UP = 38;
const validKeys = [LEFT, RIGHT, UP];
const GRAVITY  = 0.1;
const FRICTION = 0.7;

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
  const radius = 50;
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

function isOverCount(obj) {
  return obj && obj.type === 'ball' && (obj.lifeCount >= 300);
}

function isUnderCount(obj) {
  return obj && obj.type === 'ball' && (obj.lifeCount < 300);
}

function isBlock(obj) {
  return obj && obj.type === 'block';
}

function isNone(obj) {
  return obj && obj.type === 'none';
}

function isBottom(obj) {
  if (isBall(obj)) {
    if ((obj.y + obj.radius) >= window.innerHeight) {
      return true;
    } else {
      return false;
    }
  } else {
    if (obj.y >= window.innerHeight) {
      return true;
    } else {
      return false;
    }
  }
}

function isTop(obj) {
  if (isBlock(obj)) {
    if (obj.y <= 0) {
      return true;
    } else {
      return false;
    }
  }
}

function isInRange(value, range) {
  return value ? (value >= range.min && value <= range.max) : false;
}

function getTestAngle(angle, currentTestAngle) {
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

  c.testAngle = getTestAngle(c.angle, c.testAngle)
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

    c.testAngle = getTestAngle(c.angle, c.testAngle)
    return c;
  }
  return circle
}

function applySatellite(circle) {
  const c = clone(circle);
  c.satelliteAngle = getSatelliteAngle(c.satelliteAngle)
  return c;
}

const update = filter => style => objs => {
  return objs.map((obj, index) =>
    filter(obj, objs, index) ? style(obj, objs, index) : obj
  );
}

function incrementLifeCount(obj) {
  const o = clone(obj);
  o.lifeCount += 1;
  return o;
}

const applyFreely = compose(
  incrementLifeCount,
  applyLeftOrRight,
  applyUpOrDown
);

function applyGravity(circle) {
  const c = clone(circle);
  if (!isInRange(c.y + c.dy, c.yRange)) {
    c.dy = -c.dy * FRICTION;
  } else {
    c.dy += GRAVITY;
  }
  c.y += c.dy;
  return c;
}

function upBlock(block) {
  const b = clone(block);
  b.height += b.speed;
  b.y -= b.speed;
  return b;
}

function downBlock(block) {
  const b = clone(block);
  b.height -= 10;
  b.y += 10;
  return b;
}

const applyBlock = block => (
  isInRange(block.y, getYRange(0)) ? upBlock(block) : {}
);

function countDown(obj) {
  if (!obj) return obj;
  const aObj = clone(obj);
  if (aObj.timeoutCount === undefined) {
    aObj.timeoutCount = 5;
  }
  aObj.timeoutCount--;
  if (aObj.timeoutCount === 0) {
    aObj.type = 'none';
    return aObj;
  } else {
    return aObj;
  }
}

function pauseBlock(obj) {
  clearTimeout(GLOBAL.timer);
  return obj;
}

const checkBottom = obj => isBottom(obj) ? countDown(obj) : obj;
const checkTop = obj => isTop(obj) ? pauseBlock(obj) : obj;

const checkBallOnTheBottom = update(isBall)(checkBottom);
const checkBlockOnTheBottom = update(isBlock)(checkBottom);
const checkBlockOnTheTop = update(isBlock)(checkTop);
const updateBall = update(isUnderCount)(applyFreely);
const moveLeftOrRight = update(isOverCount)(applyLeftOrRight);
const gravityBall = update(isOverCount)(applyGravity);
const updateCircle = update(isCircle)(applyKeyCircle);
const updateSatellite = update(isCircle)(applySatellite);
const updateBlock = update(isBlock)(applyBlock);
const removeNoneType = (objs) => {
  return objs.filter(obj => (obj.type !== 'none'));
}

const widenBlock = (block, size) => {
  const b = clone(block);
  b.x = b.x - size;
  b.y = b.y - size;
  b.width = b.width + size;
  b.height = b.height + size;
  return b;
}

function isOverlap(ball, block) {
  if (isBall(ball) && isBlock(block)) {
    const wBlock = widenBlock(block, ball.radius);
    if (
      ball.x >= wBlock.x &&
      ball.x <= wBlock.x + wBlock.width &&
      ball.y >= wBlock.y &&
      ball.y <= wBlock.y + wBlock.height
    ) {
      return true;
    }
  }
  return false;
}

const checkCollisionBall = objs => {
  const blocks = objs.filter(item => isBlock(item));
  return objs.map(obj => {
    if (isBall(obj)) {
      const collision = blocks.some(block => isOverlap(obj, block));
      if (collision) {
        obj.type = "none";
        return obj;
      } else {
        return obj;
      }
    } else {
      return obj;
    }
  });
}

const checkCollisionBlock = objs => {
  const balls = objs.filter(item => isBall(item));
  return objs.map(obj => {
    if (isBlock(obj)) {
      const collision = balls.some(ball => isOverlap(ball, obj));
      if (collision) {
        obj.fillStyle = 'yellow';
        return downBlock(obj);
      } else {
        obj.fillStyle = 'blue';
        return obj;
      }
    } else {
      return obj;
    }
  });
}

function drawCircle(ctx, circle) {
  ctx.beginPath();
  ctx.fillStyle = circle.fillStyle || "rgba(20, 100, 20, 0.1)";
  ctx.strokeStyle = circle.strokeStyle || "black";
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2, false);
  ctx.stroke();
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = circle.fillStyle || "rgba(20, 100, 100, 0.1)";
  ctx.arc(circle.x, circle.y, circle.radius, getRadians(180 + 90 + circle.testAngle), getRadians(180 + 270 + circle.testAngle), false);
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


const drawBlock = ctx => {
  return circles => {
    circles.forEach(function(item) {
      if(isBlock(item)) {
        ctx.fillStyle = item.fillStyle;
        ctx.fillRect(item.x, item.y, item.width, item.height);
      }
    });
    return circles;
  }
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
  // ball.speed = ball.speed * 2;
  ball.lifeCount = 0;
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
    const c = findCircle(objs);
    if (c) {
      c.id = objs.length;
      objs.push(createBall(c));
    }
  }
  return objs;
}

function findBlock(objs) {
  return objs.find(obj => {
    return isBlock(obj);
  });
}

function createBlock(x, width) {
  const type = 'block';
  const height = 50;
  const y = window.innerHeight - height;
  const fillStyle = 'blue'
  const xRange = getXRange(0);
  const speed = getRandomArbitrary(1, 2);
  return { type, x, y, width, height, fillStyle, xRange, speed };
}

function createBlocks(barLen) {
  const blocks = [];
  const width = window.innerWidth / barLen;
  for (let i = 0; i < barLen; i++) {
    blocks.push(createBlock(width * i, width));
  }
  return blocks;
}

const addBlock = (function () {
  let count = 0;
  let step = 0;
  return function (objs) {
    const block = findBlock(objs);
    if (block) {
      count = 0;
    } else {
      count++;
      if (count > 50) {
        count = 0;
        step++;
        return objs.concat(createBlocks(step));
      }
    }
    return objs;
  };
})();

function startAnimation(ctx) {
  let objs = [];
  objs.push(createCircle());
  const update = compose(
    updateCircle,
    updateSatellite,
    checkBallOnTheBottom,
    checkBlockOnTheBottom,
    checkBlockOnTheTop,
    addBall,
    updateBall,
    checkCollisionBall,
    addBlock,
    updateBlock,
    checkCollisionBlock,
    moveLeftOrRight,
    gravityBall,
    removeNoneType
  );
  const draw = compose(
    drawCircles(ctx),
    drawBlock(ctx)
  );
  function animate() {
    objs = update(objs);
    clearScreen(ctx);
    objs = draw(objs);
  }
  GLOBAL.timer = setInterval(function() {
    animate();
  }, 30);
}

function activate() {
  const c = document.querySelector("canvas");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext("2d");
  startAnimation(ctx);
}

function processKeyEvent(e) {
  if (validKeys.includes(e.keyCode)) {
    GLOBAL.keys.push(e.keyCode);
  }
}

window.addEventListener('load', activate);
window.addEventListener('keydown', processKeyEvent, true);
