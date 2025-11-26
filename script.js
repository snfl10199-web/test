const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle
const paddle = { width: 75, height: 10, x: (WIDTH - 75) / 2, speed: 7 };
let rightPressed = false;
let leftPressed = false;

// Ball
let ballRadius = 6;
let ball = { x: WIDTH/2, y: HEIGHT-30, dx: 2, dy: -2 };

// Bricks
const brickRowCount = 5;
const brickColumnCount = 6;
const brickWidth = 60;
const brickHeight = 16;
const brickPadding = 8;
const brickOffsetTop = 30;
const brickOffsetLeft = 20;
let bricks = [];

let score = 0;
let lives = 3;
let running = false;

function initBricks(){
  bricks = [];
  for(let c=0;c<brickColumnCount;c++){
    bricks[c] = [];
    for(let r=0;r<brickRowCount;r++){
      bricks[c][r] = { x:0, y:0, status:1 };
    }
  }
}

function drawBall(){
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle(){
  ctx.beginPath();
  ctx.rect(paddle.x, HEIGHT - paddle.height - 10, paddle.width, paddle.height);
  ctx.fillStyle = '#06d6a0';
  ctx.fill();
  ctx.closePath();
}

function drawBricks(){
  for(let c=0;c<brickColumnCount;c++){
    for(let r=0;r<brickRowCount;r++){
      if(bricks[c][r].status===1){
        const brickX = c*(brickWidth+brickPadding)+brickOffsetLeft;
        const brickY = r*(brickHeight+brickPadding)+brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = `hsl(${r*30 + c*10}, 70%, 55%)`;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection(){
  for(let c=0;c<brickColumnCount;c++){
    for(let r=0;r<brickRowCount;r++){
      const b = bricks[c][r];
      if(b.status===1){
        if(ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight){
          ball.dy = -ball.dy;
          b.status = 0;
          score += 10;
          scoreEl.textContent = '점수: ' + score;
          if(score === brickRowCount * brickColumnCount * 10){
            alert('축하합니다! 모든 벽돌을 깼습니다.');
            resetGame();
          }
        }
      }
    }
  }
}

function draw(){
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  // 벽 충돌
  if(ball.x + ball.dx > WIDTH - ballRadius || ball.x + ball.dx < ballRadius){
    ball.dx = -ball.dx;
  }
  if(ball.y + ball.dy < ballRadius){
    ball.dy = -ball.dy;
  } else if(ball.y + ball.dy > HEIGHT - ballRadius - paddle.height - 10){
    if(ball.x > paddle.x && ball.x < paddle.x + paddle.width){
      // 패들에 맞춤 — 반사 속도 보정
      const collidePoint = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
      const angle = collidePoint * (Math.PI/3); // 최대 60도
      const speed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
      ball.dx = speed * Math.sin(angle);
      ball.dy = -Math.abs(speed * Math.cos(angle));
    } else if(ball.y + ball.dy > HEIGHT - ballRadius){
      // 놓침
      lives--;
      livesEl.textContent = '생명: ' + lives;
      if(lives === 0){
        alert('게임 오버');
        resetGame();
        return;
      } else {
        // 공과 패들 초기화
        ball.x = WIDTH/2;
        ball.y = HEIGHT-30;
        ball.dx = 2;
        ball.dy = -2;
        paddle.x = (WIDTH - paddle.width) / 2;
      }
    }
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  // 패들 이동
  if(rightPressed && paddle.x < WIDTH - paddle.width){
    paddle.x += paddle.speed;
  } else if(leftPressed && paddle.x > 0){
    paddle.x -= paddle.speed;
  }

  if(running) requestAnimationFrame(draw);
}

// 입력 처리
document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowRight' || e.key === 'Right') rightPressed = true;
  if(e.key === 'ArrowLeft' || e.key === 'Left') leftPressed = true;
});
document.addEventListener('keyup', (e)=>{
  if(e.key === 'ArrowRight' || e.key === 'Right') rightPressed = false;
  if(e.key === 'ArrowLeft' || e.key === 'Left') leftPressed = false;
});
canvas.addEventListener('mousemove', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = mouseX - paddle.width/2;
  if(paddle.x < 0) paddle.x = 0;
  if(paddle.x + paddle.width > WIDTH) paddle.x = WIDTH - paddle.width;
});

function start(){
  if(running) return;
  running = true;
  requestAnimationFrame(draw);
}

function resetGame(){
  running = false;
  score = 0;
  lives = 3;
  scoreEl.textContent = '점수: ' + score;
  livesEl.textContent = '생명: ' + lives;
  ball.x = WIDTH/2; ball.y = HEIGHT-30; ball.dx = 2; ball.dy = -2;
  paddle.x = (WIDTH - paddle.width) / 2;
  initBricks();
}

startBtn.addEventListener('click', ()=>{
  resetGame();
  start();
});

// 초기화 및 자동 시작하지 않음
initBricks();
scoreEl.textContent = '점수: ' + score;
livesEl.textContent = '생명: ' + lives;
