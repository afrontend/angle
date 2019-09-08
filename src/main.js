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
  const radius = getRandomArbitrary(5, 100);
  const x = getRandomX(radius);
  const y = getRandomY(radius);
  const nextX = x;
  const nextY = y;
  // const angle = getRandom(360);
  const testAngle = getRandom(360);
  const angle = 0;
  const speed = Math.abs(radius-100)/16;
  const { dx, dy } = getDxDy(angle, speed);
  const xRange = getXRange(radius);
  const yRange = getYRange(radius);
  return { type, id, radius, x, y, angle, testAngle, speed, dx, dy, xRange, yRange };
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

function isInRange(value, range) {
  return value ? (value >= range.min && value <= range.max) : false;
}

function getNextTestAngle(angle, currentTestAngle) {
  if (angle === 0) {
    const nextTestAngle = currentTestAngle + 1;
    if (nextTestAngle > 180) {
      return 180;
    } else {
      return nextTestAngle;
    }
  } else {
    const nextTestAngle = currentTestAngle - 1;
    if (nextTestAngle < 0) {
      return 0;
    } else {
      return nextTestAngle;
    }
  }
}

function applyMoveLeftOrRight(circle) {
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

const applyStyle = filter => style => circles => {
  return circles.map((circle, index) =>
    filter(circle, circles, index) ? style(circle, circles, index) : circle
  );
}

const moveLeftOrRight = applyStyle(isCircle)(applyMoveLeftOrRight);

function drawCircle(ctx, circle) {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2, false);
  if (circle.fillStyle) {
    ctx.fillStyle = circle.fillStyle;
  } else {
    ctx.fillStyle = "rgba(20, 100, 20, 0.1)"
  }
  if (circle.strokeStyle) {
    ctx.strokeStyle = circle.strokeStyle;
  } else {
    ctx.strokeStyle = "black";
  }
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

const drawCircles = ctx => circles => {
  circles.forEach(function(circle) {
    if (isCircle(circle)) {
      drawCircle(ctx, circle);
      drawDirectionLine(ctx, circle);
    }
  });
  return circles;
}

function startAnimation(ctx) {
  let objs = [];
  objs.push(createCircle());
  const update = compose(
    moveLeftOrRight
  );
  const draw = compose(
    drawCircles(ctx)
  );
  function animate() {
    requestAnimationFrame(animate);
    objs = update(objs);
    clearScreen(ctx);
    objs = draw(objs);
  }
  animate();
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

window.addEventListener('load', activate);
