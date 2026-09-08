"use strict";

const symbols = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }
};

const values = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const files = "abcdefgh";

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const movesEl = document.getElementById("moves");
const capturedWhiteEl = document.getElementById("capturedWhite");
const capturedBlackEl = document.getElementById("capturedBlack");
const promotionDialog = document.getElementById("promotionDialog");
const difficultyEl = document.getElementById("difficulty");
const difficultyLabel = document.getElementById("difficultyLabel");
const difficultyDepth = document.getElementById("difficultyDepth");
const coachEl = document.getElementById("coach");
const tutorialListEl = document.getElementById("tutorialList");
const tutorialTitleEl = document.getElementById("tutorialTitle");
const tutorialGoalEl = document.getElementById("tutorialGoal");
const tutorialStepsEl = document.getElementById("tutorialSteps");
const tutorialTipEl = document.getElementById("tutorialTip");
const lessonControlsEl = document.getElementById("lessonControls");
const lessonStartEl = document.getElementById("lessonStart");
const lessonPrevEl = document.getElementById("lessonPrev");
const lessonNextEl = document.getElementById("lessonNext");
const lessonCurrentEl = document.getElementById("lessonCurrent");

const difficultyProfiles = [
  { name: "Beginner", detail: "Makes mistakes", depth: 0, noise: 260, blunder: 0.38, moveLimit: 10 },
  { name: "Casual", detail: "Looks ahead 1 move", depth: 1, noise: 130, blunder: 0.18, moveLimit: 14 },
  { name: "Balanced", detail: "Looks ahead 2 moves", depth: 2, noise: 55, blunder: 0.06, moveLimit: 18 },
  { name: "Strong", detail: "Looks ahead 3 moves", depth: 3, noise: 20, blunder: 0.02, moveLimit: 22 },
  { name: "Tough", detail: "Looks ahead 3+ moves", depth: 3, noise: 0, blunder: 0, moveLimit: 32 }
];

const tutorials = [
  {
    title: "White: Safe Attack Start",
    goal: "Use a simple first-five-moves plan that prepares an attack without weakening your king.",
    steps: ["1. e4: take the center and open your bishop.", "2. Nf3: develop and attack Black's e5 pawn.", "3. Bc4: aim at the weak f7 square.", "4. O-O: castle before the center opens.", "5. Re1 or d4: bring a rook to the center or open lines when ready."],
    line: [
      { from: "e2", to: "e4", note: "Move the white pawn from e2 to e4. This takes center space and opens the bishop." },
      { from: "e7", to: "e5", note: "Black answers in the center." },
      { from: "g1", to: "f3", note: "Move the knight from g1 to f3. It attacks e5 and develops a piece." },
      { from: "b8", to: "c6", note: "Black protects the e5 pawn." },
      { from: "f1", to: "c4", note: "Move the bishop to c4. It points at the weak f7 pawn." },
      { from: "g8", to: "f6", note: "Black develops and fights the center." },
      { from: "e1", to: "g1", note: "Castle kingside: king goes to g1 and rook moves to f1 automatically." }
    ],
    tip: "If you are not sure what to do, develop a new piece toward the center before moving the queen."
  },
  {
    title: "Black: Solid Defense Start",
    goal: "Answer White's center control, develop fast, and castle before attacking.",
    steps: ["Against 1. e4, play e5 or c5 if you want sharper games.", "Develop a knight with Nc6 or Nf6.", "Develop a bishop to c5, b4, e7, or g7 depending on the position.", "Castle early, usually kingside.", "Only counterattack after your king is safe and pieces are out."],
    line: [
      { from: "e2", to: "e4", note: "White starts with e4, so Black must answer the center." },
      { from: "e7", to: "e5", note: "Move Black's pawn from e7 to e5. This fights for the center." },
      { from: "g1", to: "f3", note: "White develops a knight and attacks e5." },
      { from: "b8", to: "c6", note: "Move the black knight to c6 to defend e5." },
      { from: "f1", to: "c4", note: "White aims the bishop at f7. Notice the threat." },
      { from: "g8", to: "f6", note: "Develop the other knight, but always watch the f7 square." },
      { from: "f8", to: "c5", note: "Move the bishop to c5 so Black develops and prepares castling." }
    ],
    tip: "As Black, first equalize: fight the center, avoid early pawn weaknesses, then counterattack."
  },
  {
    title: "Opening Attack Plan",
    goal: "Build an attack without exposing your own king.",
    steps: ["Play e4 or d4 to claim the center.", "Develop knights before moving the queen.", "Put a bishop on c4 or b5 to create pressure.", "Castle before opening the center.", "Attack only when two or three pieces are aiming at the king."],
    tip: "Do not start with queen tricks every game. Good attacks come from developed pieces."
  },
  {
    title: "Opening Defense Checklist",
    goal: "Survive the first 10 moves without falling for easy traps.",
    steps: ["Check if your f2 or f7 pawn is being attacked.", "If their queen comes out early, attack it with a developing move.", "Do not move the f-pawn early unless you know the reason.", "Do not grab a pawn if it lets your king get checked.", "Castle before launching a pawn storm."],
    tip: "Every turn ask: what is my opponent threatening against my king or queen?"
  },
  {
    title: "Italian Attack Setup",
    goal: "A beginner-friendly attacking setup with bishop pressure on f7.",
    steps: ["1. e4 e5", "2. Nf3 Nc6", "3. Bc4: bishop points at f7.", "4. c3 or O-O: prepare d4 or make king safe.", "5. d4: open the center when your pieces are ready."],
    line: [
      { from: "e2", to: "e4", note: "White takes the center with e4." },
      { from: "e7", to: "e5", note: "Black mirrors the center." },
      { from: "g1", to: "f3", note: "Knight to f3 attacks e5 and develops." },
      { from: "b8", to: "c6", note: "Black defends e5 with the knight." },
      { from: "f1", to: "c4", note: "Bishop to c4 creates pressure on f7." },
      { from: "g8", to: "f6", note: "Black develops a knight." },
      { from: "e1", to: "g1", note: "Castle now. Attack after your king is safe." },
      { from: "f8", to: "c5", note: "Black develops the bishop." },
      { from: "c2", to: "c3", note: "c3 prepares d4, so White can open the center later." }
    ],
    tip: "The idea is not instant mate. The idea is fast development plus pressure on f7."
  },
  {
    title: "London Setup",
    goal: "A calm system opening that is hard to trick and easy to remember.",
    steps: ["1. d4: control the center.", "2. Bf4: develop the bishop outside the pawn chain.", "3. e3: support the center.", "4. Nf3 and Bd3: develop pieces naturally.", "5. O-O: castle, then look for Ne5 or c4 breaks."],
    line: [
      { from: "d2", to: "d4", note: "Move the pawn to d4. This controls the center." },
      { from: "d7", to: "d5", note: "Black also takes center space." },
      { from: "c1", to: "f4", note: "Move the bishop to f4 before blocking it with e3." },
      { from: "g8", to: "f6", note: "Black develops a knight." },
      { from: "e2", to: "e3", note: "e3 supports d4 and opens your other bishop." },
      { from: "e7", to: "e6", note: "Black builds a solid center." },
      { from: "g1", to: "f3", note: "Develop the knight toward the center." },
      { from: "f8", to: "d6", note: "Black develops the bishop." },
      { from: "f1", to: "d3", note: "Bishop to d3 points toward Black's king side." }
    ],
    tip: "Use the London when you want a safe start and fewer opening traps."
  },
  {
    title: "Scholar's Mate",
    goal: "Attack the weak f7 square with queen and bishop.",
    steps: ["1. e4 e5", "2. Qh5 Nc6", "3. Bc4 Nf6?", "4. Qxf7#"],
    line: [
      { from: "e2", to: "e4", note: "Start by opening the queen and bishop." },
      { from: "e7", to: "e5", note: "Black answers in the center." },
      { from: "d1", to: "h5", note: "Queen to h5 attacks e5 and looks at f7." },
      { from: "b8", to: "c6", note: "Black defends e5." },
      { from: "f1", to: "c4", note: "Bishop to c4 adds a second attacker on f7." },
      { from: "g8", to: "f6", note: "This is the mistake: Black lets the queen take f7." },
      { from: "h5", to: "f7", note: "Queen captures f7: checkmate if Black cannot escape." }
    ],
    tip: "This works only if Black ignores f7. Stronger players attack the queen with g6 or defend carefully."
  },
  {
    title: "Stop Scholar's Mate",
    goal: "Do not let queen and bishop gang up on f7.",
    steps: ["After Qh5, notice the attack on e5 and f7.", "Play Nc6 to defend e5.", "If Bc4 appears, play g6 to hit the queen.", "Develop Nf6 only when your e5 pawn and f7 square are safe.", "Never ignore a queen looking at your king pawns."],
    line: [
      { from: "e2", to: "e4", note: "White opens lines for the queen and bishop." },
      { from: "e7", to: "e5", note: "Black takes the center too." },
      { from: "d1", to: "h5", note: "White queen attacks e5 and looks toward f7." },
      { from: "b8", to: "c6", note: "Black knight to c6 protects the e5 pawn." },
      { from: "f1", to: "c4", note: "White bishop joins the queen against f7." },
      { from: "g7", to: "g6", note: "Move the black pawn to g6. It attacks the queen and stops the easy mate." },
      { from: "h5", to: "f3", note: "White queen usually moves away." },
      { from: "g8", to: "f6", note: "Now Black develops the knight after the danger is handled." }
    ],
    tip: "When the enemy queen comes out early, attack it while developing."
  },
  {
    title: "When To Attack",
    goal: "Know when an attack is real instead of just a hope.",
    steps: ["Your king is safe or already castled.", "You have more attackers near their king than they have defenders.", "The center is closed or you control the center.", "Your queen is supported by pieces, not alone.", "You can calculate at least one check, capture, or threat after your move."],
    tip: "A queen alone is not an attack. Queen plus bishop plus knight is dangerous."
  },
  {
    title: "Knight Fork",
    goal: "Use a knight to attack king and queen at the same time.",
    steps: ["Look for checks with your knight.", "Common fork squares are d5, d6, e7, f7, c7, and g7.", "A fork is strongest when one target is the king.", "After the king moves, take the queen or rook."],
    tip: "Before every knight move, ask: can this knight check and attack another piece?"
  },
  {
    title: "Pin And Win",
    goal: "Freeze a defender so it cannot move.",
    steps: ["Use a bishop on g5 to pin a knight on f6.", "Use a rook or bishop on an open line toward the king or queen.", "Attack the pinned piece with a pawn.", "Add pressure before capturing."],
    tip: "Pinned pieces look defended, but often they cannot recapture."
  },
  {
    title: "Back Rank Mate",
    goal: "Trap a castled king behind its own pawns.",
    steps: ["Open a file for your rook or queen.", "Check the enemy king on the back rank.", "Make sure escape squares are blocked by its own pawns.", "Use another piece to protect your checking rook or queen."],
    tip: "Make luft for your own king with h3 or h6 when back-rank mate is possible."
  }
];

let state;
let selected = null;
let legalForSelected = [];
let flipped = false;
let vsComputer = true;
let playerColor = "w";
let thinking = false;
let coachMove = null;
let coachText = "Start by fighting for the center and developing your pieces.";
let currentTutorialIndex = 0;
let lessonActive = false;
let lessonStep = 0;

function freshState() {
  const grid = Array.from({ length: 8 }, () => Array(8).fill(null));
  const back = ["r", "n", "b", "q", "k", "b", "n", "r"];
  for (let c = 0; c < 8; c++) {
    grid[0][c] = { color: "b", type: back[c] };
    grid[1][c] = { color: "b", type: "p" };
    grid[6][c] = { color: "w", type: "p" };
    grid[7][c] = { color: "w", type: back[c] };
  }
  return {
    grid,
    turn: "w",
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
    halfmove: 0,
    fullmove: 1,
    history: [],
    moves: [],
    lastMove: null
  };
}

function cloneState(src) {
  return {
    grid: src.grid.map(row => row.map(piece => piece ? { ...piece } : null)),
    turn: src.turn,
    castling: { ...src.castling },
    enPassant: src.enPassant ? { ...src.enPassant } : null,
    halfmove: src.halfmove,
    fullmove: src.fullmove,
    history: src.history,
    moves: src.moves,
    lastMove: src.lastMove ? copyMove(src.lastMove) : null
  };
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function sameSquare(a, b) {
  return a && b && a.r === b.r && a.c === b.c;
}

function algebraic(pos) {
  return `${files[pos.c]}${8 - pos.r}`;
}

function fromAlgebraic(square) {
  return { r: 8 - Number(square[1]), c: files.indexOf(square[0]) };
}

function opponent(color) {
  return color === "w" ? "b" : "w";
}

function pieceAt(game, pos) {
  return game.grid[pos.r][pos.c];
}

function setPiece(game, pos, piece) {
  game.grid[pos.r][pos.c] = piece;
}

function pseudoMoves(game, from) {
  const piece = pieceAt(game, from);
  if (!piece) return [];
  const moves = [];
  const dir = piece.color === "w" ? -1 : 1;

  const add = (r, c, extra = {}) => {
    if (!inBounds(r, c)) return;
    const target = game.grid[r][c];
    if (!target || target.color !== piece.color) {
      moves.push({ from, to: { r, c }, ...extra });
    }
  };

  const slide = directions => {
    for (const [dr, dc] of directions) {
      let r = from.r + dr;
      let c = from.c + dc;
      while (inBounds(r, c)) {
        const target = game.grid[r][c];
        if (!target) {
          moves.push({ from, to: { r, c } });
        } else {
          if (target.color !== piece.color) moves.push({ from, to: { r, c } });
          break;
        }
        r += dr;
        c += dc;
      }
    }
  };

  if (piece.type === "p") {
    const one = { r: from.r + dir, c: from.c };
    if (inBounds(one.r, one.c) && !pieceAt(game, one)) {
      addPawnMove(moves, from, one, piece.color);
      const start = piece.color === "w" ? 6 : 1;
      const two = { r: from.r + dir * 2, c: from.c };
      if (from.r === start && !pieceAt(game, two)) {
        moves.push({ from, to: two, doublePawn: true });
      }
    }
    for (const dc of [-1, 1]) {
      const to = { r: from.r + dir, c: from.c + dc };
      if (!inBounds(to.r, to.c)) continue;
      const target = pieceAt(game, to);
      if (target && target.color !== piece.color) addPawnMove(moves, from, to, piece.color);
      if (game.enPassant && sameSquare(game.enPassant, to)) {
        moves.push({ from, to, enPassant: true });
      }
    }
  }

  if (piece.type === "n") {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
      add(from.r + dr, from.c + dc);
    }
  }

  if (piece.type === "b") slide([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
  if (piece.type === "r") slide([[-1, 0], [1, 0], [0, -1], [0, 1]]);
  if (piece.type === "q") slide([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);

  if (piece.type === "k") {
    for (const dr of [-1, 0, 1]) {
      for (const dc of [-1, 0, 1]) {
        if (dr || dc) add(from.r + dr, from.c + dc);
      }
    }
    addCastleMoves(game, moves, from, piece.color);
  }

  return moves;
}

function addPawnMove(moves, from, to, color) {
  const endRank = color === "w" ? 0 : 7;
  if (to.r === endRank) {
    for (const promotion of ["q", "r", "b", "n"]) moves.push({ from, to, promotion });
  } else {
    moves.push({ from, to });
  }
}

function addCastleMoves(game, moves, from, color) {
  const row = color === "w" ? 7 : 0;
  if (from.r !== row || from.c !== 4 || isInCheck(game, color)) return;
  const kingSide = color === "w" ? "wK" : "bK";
  const queenSide = color === "w" ? "wQ" : "bQ";
  if (game.castling[kingSide] && !game.grid[row][5] && !game.grid[row][6]) {
    if (!isSquareAttacked(game, { r: row, c: 5 }, opponent(color)) && !isSquareAttacked(game, { r: row, c: 6 }, opponent(color))) {
      moves.push({ from, to: { r: row, c: 6 }, castle: "K" });
    }
  }
  if (game.castling[queenSide] && !game.grid[row][1] && !game.grid[row][2] && !game.grid[row][3]) {
    if (!isSquareAttacked(game, { r: row, c: 3 }, opponent(color)) && !isSquareAttacked(game, { r: row, c: 2 }, opponent(color))) {
      moves.push({ from, to: { r: row, c: 2 }, castle: "Q" });
    }
  }
}

function legalMoves(game, color = game.turn) {
  const result = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.grid[r][c];
      if (!piece || piece.color !== color) continue;
      for (const move of pseudoMoves(game, { r, c })) {
        const test = cloneState(game);
        applyMove(test, move, false);
        if (!isInCheck(test, color)) result.push(move);
      }
    }
  }
  return result;
}

function attacksFrom(game, from) {
  const piece = pieceAt(game, from);
  if (!piece) return [];
  if (piece.type === "p") {
    const dir = piece.color === "w" ? -1 : 1;
    return [{ r: from.r + dir, c: from.c - 1 }, { r: from.r + dir, c: from.c + 1 }].filter(pos => inBounds(pos.r, pos.c));
  }
  if (piece.type === "k") {
    const out = [];
    for (const dr of [-1, 0, 1]) {
      for (const dc of [-1, 0, 1]) {
        if (dr || dc) {
          const pos = { r: from.r + dr, c: from.c + dc };
          if (inBounds(pos.r, pos.c)) out.push(pos);
        }
      }
    }
    return out;
  }
  return pseudoMoves({ ...game, castling: { wK: false, wQ: false, bK: false, bQ: false } }, from).map(move => move.to);
}

function isSquareAttacked(game, square, byColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.grid[r][c];
      if (!piece || piece.color !== byColor) continue;
      if (attacksFrom(game, { r, c }).some(pos => sameSquare(pos, square))) return true;
    }
  }
  return false;
}

function findKing(game, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.grid[r][c];
      if (piece && piece.color === color && piece.type === "k") return { r, c };
    }
  }
  return null;
}

function isInCheck(game, color) {
  const king = findKing(game, color);
  return king ? isSquareAttacked(game, king, opponent(color)) : false;
}

function applyMove(game, move, record = true) {
  const before = record ? snapshot(game) : null;
  const piece = pieceAt(game, move.from);
  const captured = move.enPassant
    ? game.grid[move.from.r][move.to.c]
    : pieceAt(game, move.to);

  setPiece(game, move.from, null);
  if (move.enPassant) setPiece(game, { r: move.from.r, c: move.to.c }, null);

  const movedPiece = { ...piece };
  if (move.promotion) movedPiece.type = move.promotion;
  setPiece(game, move.to, movedPiece);

  if (move.castle === "K") {
    const row = move.to.r;
    setPiece(game, { r: row, c: 5 }, pieceAt(game, { r: row, c: 7 }));
    setPiece(game, { r: row, c: 7 }, null);
  }
  if (move.castle === "Q") {
    const row = move.to.r;
    setPiece(game, { r: row, c: 3 }, pieceAt(game, { r: row, c: 0 }));
    setPiece(game, { r: row, c: 0 }, null);
  }

  updateCastling(game, piece, move, captured);
  game.enPassant = move.doublePawn ? { r: (move.from.r + move.to.r) / 2, c: move.from.c } : null;
  game.halfmove = piece.type === "p" || captured ? 0 : game.halfmove + 1;
  if (game.turn === "b") game.fullmove++;
  const notation = record ? moveNotation(game, move, piece, captured) : "";
  game.turn = opponent(game.turn);

  if (record) {
    game.history.push(before);
    game.moves.push(notation);
    game.lastMove = copyMove(move);
  }
}

function updateCastling(game, piece, move, captured) {
  if (piece.type === "k") {
    game.castling[`${piece.color}K`] = false;
    game.castling[`${piece.color}Q`] = false;
  }
  if (piece.type === "r") {
    if (piece.color === "w" && move.from.r === 7 && move.from.c === 0) game.castling.wQ = false;
    if (piece.color === "w" && move.from.r === 7 && move.from.c === 7) game.castling.wK = false;
    if (piece.color === "b" && move.from.r === 0 && move.from.c === 0) game.castling.bQ = false;
    if (piece.color === "b" && move.from.r === 0 && move.from.c === 7) game.castling.bK = false;
  }
  if (captured && captured.type === "r") {
    if (move.to.r === 7 && move.to.c === 0) game.castling.wQ = false;
    if (move.to.r === 7 && move.to.c === 7) game.castling.wK = false;
    if (move.to.r === 0 && move.to.c === 0) game.castling.bQ = false;
    if (move.to.r === 0 && move.to.c === 7) game.castling.bK = false;
  }
}

function snapshot(game) {
  return {
    grid: game.grid.map(row => row.map(piece => piece ? { ...piece } : null)),
    turn: game.turn,
    castling: { ...game.castling },
    enPassant: game.enPassant ? { ...game.enPassant } : null,
    halfmove: game.halfmove,
    fullmove: game.fullmove,
    moves: [...game.moves],
    lastMove: game.lastMove ? copyMove(game.lastMove) : null
  };
}

function restore(saved) {
  state.grid = saved.grid.map(row => row.map(piece => piece ? { ...piece } : null));
  state.turn = saved.turn;
  state.castling = { ...saved.castling };
  state.enPassant = saved.enPassant ? { ...saved.enPassant } : null;
  state.halfmove = saved.halfmove;
  state.fullmove = saved.fullmove;
  state.moves = [...saved.moves];
  state.lastMove = saved.lastMove ? copyMove(saved.lastMove) : null;
}

function copyMove(move) {
  return {
    ...move,
    from: { ...move.from },
    to: { ...move.to }
  };
}

function moveNotation(game, move, piece, captured) {
  if (move.castle === "K") return "O-O";
  if (move.castle === "Q") return "O-O-O";
  const name = piece.type === "p" ? "" : piece.type.toUpperCase();
  const takes = captured || move.enPassant ? "x" : "";
  const fromFile = piece.type === "p" && takes ? files[move.from.c] : "";
  const promo = move.promotion ? `=${move.promotion.toUpperCase()}` : "";
  return `${name}${fromFile}${takes}${algebraic(move.to)}${promo}`;
}

function render() {
  const legal = legalMoves(state);
  const lessonMove = currentLessonMove();
  const checkedKing = isInCheck(state, state.turn) ? findKing(state, state.turn) : null;
  boardEl.innerHTML = "";
  const rows = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  for (const r of rows) {
    for (const c of cols) {
      const square = document.createElement("button");
      const piece = state.grid[r][c];
      square.type = "button";
      square.className = `square ${(r + c) % 2 ? "dark" : "light"}`;
      square.dataset.r = r;
      square.dataset.c = c;
      square.setAttribute("role", "gridcell");
      square.setAttribute("aria-label", `${algebraic({ r, c })}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`);
      if (piece) {
        const pieceEl = document.createElement("span");
        pieceEl.className = `piece piece-${piece.color} piece-${piece.type}`;
        pieceEl.textContent = symbols[piece.color][piece.type];
        square.append(pieceEl);
      }
      if (selected && selected.r === r && selected.c === c) square.classList.add("selected");
      if (state.lastMove && (sameSquare(state.lastMove.from, { r, c }) || sameSquare(state.lastMove.to, { r, c }))) {
        square.classList.add("last-move");
      }
      if (coachMove && (sameSquare(coachMove.from, { r, c }) || sameSquare(coachMove.to, { r, c }))) {
        square.classList.add("coach-move");
      }
      if (lessonMove && sameSquare(lessonMove.from, { r, c })) square.classList.add("lesson-from");
      if (lessonMove && sameSquare(lessonMove.to, { r, c })) square.classList.add("lesson-to");
      const hint = legalForSelected.find(move => move.to.r === r && move.to.c === c);
      if (hint) square.classList.add(piece ? "capture-hint" : "hint");
      if (checkedKing && checkedKing.r === r && checkedKing.c === c) square.classList.add("in-check");
      if ((r === 7 && !flipped) || (r === 0 && flipped)) {
        const coord = document.createElement("span");
        coord.className = "coord";
        coord.textContent = algebraic({ r, c });
        square.append(coord);
      }
      square.addEventListener("click", () => handleSquareClick({ r, c }));
      boardEl.append(square);
    }
  }

  renderStatus(legal);
  renderMoves();
  renderCaptured();
  renderCoach();
  document.getElementById("undo").disabled = thinking || state.history.length === 0;
  document.getElementById("hint").disabled = thinking || legal.length === 0 || (vsComputer && state.turn === "b");
  renderLessonControls();
}

function renderStatus(legal) {
  const side = state.turn === "w" ? "White" : "Black";
  if (legal.length === 0) {
    statusEl.textContent = isInCheck(state, state.turn) ? `Checkmate. ${state.turn === "w" ? "Black" : "White"} wins.` : "Stalemate.";
  } else if (isInCheck(state, state.turn)) {
    statusEl.textContent = `${side} is in check`;
  } else if (thinking) {
    statusEl.textContent = "Computer is thinking";
  } else {
    statusEl.textContent = `${side} to move`;
  }
}

function renderMoves() {
  movesEl.innerHTML = "";
  for (let i = 0; i < state.moves.length; i += 2) {
    const li = document.createElement("li");
    li.textContent = state.moves[i + 1] ? `${state.moves[i]}  ${state.moves[i + 1]}` : state.moves[i];
    movesEl.append(li);
  }
  movesEl.scrollTop = movesEl.scrollHeight;
}

function renderCaptured() {
  const start = { w: { p: 8, n: 2, b: 2, r: 2, q: 1 }, b: { p: 8, n: 2, b: 2, r: 2, q: 1 } };
  for (const row of state.grid) {
    for (const piece of row) {
      if (piece && piece.type !== "k") start[piece.color][piece.type]--;
    }
  }
  capturedWhiteEl.textContent = capturedText(start.w, "w");
  capturedBlackEl.textContent = capturedText(start.b, "b");
}

function renderCoach() {
  const material = materialBalance();
  const balance = material === 0
    ? "Material is equal."
    : `${material > 0 ? "White" : "Black"} is ahead by ${Math.abs(material)}.`;
  coachEl.textContent = `${coachText} ${balance}`;
}

function capturedText(counts, color) {
  return ["q", "r", "b", "n", "p"].map(type => symbols[color][type].repeat(counts[type])).join(" ");
}

async function handleSquareClick(pos) {
  if (thinking || isComputerTurn()) return;
  const lessonMove = currentLessonMove();
  const piece = pieceAt(state, pos);
  if (selected) {
    const move = legalForSelected.find(item => sameSquare(item.to, pos));
    if (move) {
      if (lessonMove && (!sameSquare(move.from, lessonMove.from) || !sameSquare(move.to, lessonMove.to))) {
        coachText = `In this lesson, move ${algebraic(lessonMove.from)} to ${algebraic(lessonMove.to)}.`;
        render();
        return;
      }
      await playMove(move);
      if (lessonMove) advanceLessonAfterMove(move);
      return;
    }
  }
  if (lessonMove && !sameSquare(pos, lessonMove.from)) {
    selected = lessonMove.from;
    legalForSelected = legalMoves(state).filter(move => sameSquare(move.from, lessonMove.from));
    coachText = `Tap the highlighted piece on ${algebraic(lessonMove.from)}, then move it to ${algebraic(lessonMove.to)}.`;
    render();
    return;
  }
  if (piece && piece.color === state.turn) {
    selected = pos;
    legalForSelected = legalMoves(state).filter(move => sameSquare(move.from, pos));
  } else {
    selected = null;
    legalForSelected = [];
  }
  render();
}

async function playMove(move) {
  selected = null;
  legalForSelected = [];
  coachMove = null;
  coachText = "";
  if (move.promotion && (!vsComputer || state.turn === playerColor)) {
    move = { ...move, promotion: await choosePromotion() };
  }
  const movingSide = state.turn === "w" ? "White" : "Black";
  const movingPiece = pieceAt(state, move.from);
  const captured = move.enPassant ? state.grid[move.from.r][move.to.c] : pieceAt(state, move.to);
  applyMove(state, move);
  coachText = describeMove(move, movingPiece, captured, movingSide);
  render();
  scheduleComputerMove();
}

function choosePromotion() {
  return new Promise(resolve => {
    promotionDialog.addEventListener("close", () => resolve(promotionDialog.returnValue || "q"), { once: true });
    promotionDialog.showModal();
  });
}

function chooseComputerMove(color = state.turn) {
  const profile = currentDifficulty();
  const moves = orderedMoves(state, legalMoves(state, color)).slice(0, profile.moveLimit);
  if (Math.random() < profile.blunder) return pickLowerRatedMove(state, moves, profile);
  let best = null;
  let bestScore = color === "w" ? -Infinity : Infinity;
  for (const move of moves) {
    const test = cloneState(state);
    applyMove(test, move, false);
    const score = minimax(test, profile.depth - 1, -Infinity, Infinity, test.turn === "w", profile);
    const adjusted = score + randomNoise(profile.noise);
    if (color === "w" ? adjusted > bestScore : adjusted < bestScore) {
      bestScore = adjusted;
      best = move;
    }
  }
  return best;
}

function chooseBestMove(game, color, depth = 2) {
  const profile = { ...difficultyProfiles[2], depth, noise: 0, blunder: 0, moveLimit: 28 };
  const moves = orderedMoves(game, legalMoves(game, color)).slice(0, profile.moveLimit);
  let best = null;
  let bestScore = color === "w" ? -Infinity : Infinity;
  for (const move of moves) {
    const test = cloneState(game);
    applyMove(test, move, false);
    const score = minimax(test, depth - 1, -Infinity, Infinity, test.turn === "w", profile);
    if (color === "w" ? score > bestScore : score < bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}

function minimax(game, depth, alpha, beta, maximizingWhite, profile) {
  const moves = orderedMoves(game, legalMoves(game, game.turn)).slice(0, profile.moveLimit);
  if (depth <= 0 || moves.length === 0) {
    if (moves.length === 0 && isInCheck(game, game.turn)) {
      return game.turn === "w" ? -100000 : 100000;
    }
    return evaluate(game);
  }
  if (maximizingWhite) {
    let best = -Infinity;
    for (const move of moves) {
      const test = cloneState(game);
      applyMove(test, move, false);
      best = Math.max(best, minimax(test, depth - 1, alpha, beta, false, profile));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const move of moves) {
    const test = cloneState(game);
    applyMove(test, move, false);
    best = Math.min(best, minimax(test, depth - 1, alpha, beta, true, profile));
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function evaluate(game) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.grid[r][c];
      if (!piece) continue;
      let v = values[piece.type];
      if (piece.type === "p") v += piece.color === "w" ? (6 - r) * 8 : (r - 1) * 8;
      if (piece.type === "n" || piece.type === "b") v += 18 - Math.abs(3.5 - r) * 4 - Math.abs(3.5 - c) * 4;
      if (piece.type === "k") v += kingSafetyBonus(game, { r, c }, piece.color);
      score += piece.color === "w" ? v : -v;
    }
  }
  score += legalMoves(game, "w").length * 3;
  score -= legalMoves(game, "b").length * 3;
  if (isInCheck(game, "w")) score -= 35;
  if (isInCheck(game, "b")) score += 35;
  return score;
}

function currentDifficulty() {
  return difficultyProfiles[Number(difficultyEl.value) - 1] || difficultyProfiles[2];
}

function randomNoise(amount) {
  return amount ? (Math.random() * amount * 2) - amount : 0;
}

function pickLowerRatedMove(game, moves, profile) {
  const color = game.turn;
  const rated = moves.map(move => {
    const test = cloneState(game);
    applyMove(test, move, false);
    return { move, score: evaluate(test) + randomNoise(profile.noise * 2) };
  }).sort((a, b) => color === "w" ? b.score - a.score : a.score - b.score);
  const start = Math.min(2, rated.length - 1);
  const spread = Math.max(1, Math.min(5, rated.length - start));
  return rated[start + Math.floor(Math.random() * spread)]?.move || rated[0]?.move;
}

function orderedMoves(game, moves) {
  return [...moves].sort((a, b) => movePriority(game, b) - movePriority(game, a));
}

function movePriority(game, move) {
  const piece = pieceAt(game, move.from);
  const target = move.enPassant ? game.grid[move.from.r][move.to.c] : pieceAt(game, move.to);
  let score = Math.random();
  if (target) score += values[target.type] * 2 - values[piece.type] / 5;
  if (move.promotion) score += values[move.promotion] + 500;
  if (move.castle) score += 120;
  if ((piece.type === "n" || piece.type === "b") && ((piece.color === "w" && move.from.r === 7) || (piece.color === "b" && move.from.r === 0))) score += 45;
  const test = cloneState(game);
  applyMove(test, move, false);
  if (isInCheck(test, test.turn)) score += 90;
  if (piece.type === "p" && move.to.c >= 2 && move.to.c <= 5) score += 12;
  return score;
}

function kingSafetyBonus(game, pos, color) {
  const homeRow = color === "w" ? 7 : 0;
  let bonus = pos.r === homeRow && (pos.c === 6 || pos.c === 2) ? 40 : 0;
  const shieldRow = color === "w" ? pos.r - 1 : pos.r + 1;
  for (const c of [pos.c - 1, pos.c, pos.c + 1]) {
    if (!inBounds(shieldRow, c)) continue;
    const piece = game.grid[shieldRow][c];
    if (piece && piece.color === color && piece.type === "p") bonus += 12;
  }
  return bonus;
}

function materialBalance() {
  let score = 0;
  for (const row of state.grid) {
    for (const piece of row) {
      if (!piece || piece.type === "k") continue;
      score += piece.color === "w" ? values[piece.type] : -values[piece.type];
    }
  }
  return Math.round(score / 100);
}

function describeMove(move, piece, captured, side) {
  const pieceName = piece.type === "p" ? "pawn" : piece.type.toUpperCase();
  const action = captured ? `captured on ${algebraic(move.to)}` : `moved to ${algebraic(move.to)}`;
  if (move.castle) return `${side} castled to improve king safety.`;
  if (move.promotion) return `${side} promoted a pawn on ${algebraic(move.to)}.`;
  if (isInCheck(state, state.turn)) return `${side}'s ${pieceName} ${action}, giving check.`;
  if (captured) return `${side}'s ${pieceName} ${action}.`;
  return `${side}'s ${pieceName} ${action}.`;
}

function isComputerTurn() {
  return vsComputer && state.turn !== playerColor;
}

function scheduleComputerMove() {
  if (!isComputerTurn() || !legalMoves(state).length) return;
  thinking = true;
  render();
  window.setTimeout(() => {
    const reply = chooseComputerMove(state.turn);
    if (reply) {
      const replySide = state.turn === "w" ? "White" : "Black";
      const replyPiece = pieceAt(state, reply.from);
      const replyCaptured = reply.enPassant ? state.grid[reply.from.r][reply.to.c] : pieceAt(state, reply.to);
      applyMove(state, reply);
      coachText = describeMove(reply, replyPiece, replyCaptured, replySide);
    }
    thinking = false;
    render();
  }, 250);
}


function currentLesson() {
  return tutorials[currentTutorialIndex] || tutorials[0];
}

function currentLessonMove() {
  if (!lessonActive) return null;
  const step = currentLesson().line?.[lessonStep];
  if (!step) return null;
  return { ...step, from: fromAlgebraic(step.from), to: fromAlgebraic(step.to) };
}

function startLesson() {
  const tutorial = currentLesson();
  if (!tutorial.line?.length) return;
  vsComputer = false;
  document.getElementById("modeLocal").classList.add("active");
  document.getElementById("modeComputer").classList.remove("active");
  state = freshState();
  selected = null;
  legalForSelected = [];
  thinking = false;
  coachMove = null;
  lessonActive = true;
  lessonStep = 0;
  showLessonMove();
}

function showLessonMove() {
  const move = currentLessonMove();
  if (!move) {
    lessonActive = false;
    selected = null;
    legalForSelected = [];
    coachText = "Lesson finished. You can keep playing from this position.";
    render();
    return;
  }
  selected = move.from;
  legalForSelected = legalMoves(state).filter(item => sameSquare(item.from, move.from));
  coachText = move.note;
  render();
}

async function playCurrentLessonMove() {
  const lessonMove = currentLessonMove();
  if (!lessonMove) return;
  const move = legalMoves(state).find(item => sameSquare(item.from, lessonMove.from) && sameSquare(item.to, lessonMove.to));
  if (!move) {
    coachText = "This lesson move is not legal from the current board. Restart the lesson to line it up again.";
    render();
    return;
  }
  await playMove(move);
  advanceLessonAfterMove(move);
}

function advanceLessonAfterMove(move) {
  const lessonMove = currentLessonMove();
  if (!lessonMove || !sameSquare(move.from, lessonMove.from) || !sameSquare(move.to, lessonMove.to)) return;
  lessonStep += 1;
  window.setTimeout(showLessonMove, 120);
}

function replayLessonTo(stepIndex) {
  const tutorial = currentLesson();
  state = freshState();
  selected = null;
  legalForSelected = [];
  coachMove = null;
  lessonActive = true;
  lessonStep = 0;
  for (let i = 0; i < stepIndex; i++) {
    const step = tutorial.line[i];
    const from = fromAlgebraic(step.from);
    const to = fromAlgebraic(step.to);
    const move = legalMoves(state).find(item => sameSquare(item.from, from) && sameSquare(item.to, to));
    if (move) applyMove(state, move);
  }
  lessonStep = stepIndex;
  showLessonMove();
}

function renderLessonControls() {
  const tutorial = currentLesson();
  const hasLine = Boolean(tutorial.line?.length);
  lessonControlsEl.hidden = !hasLine;
  lessonCurrentEl.hidden = !hasLine;
  if (!hasLine) return;
  lessonStartEl.textContent = lessonActive ? "Restart lesson" : "Show on board";
  lessonPrevEl.disabled = !lessonActive || lessonStep === 0;
  lessonNextEl.disabled = !lessonActive;
  const step = tutorial.line[lessonStep];
  if (lessonActive && step) {
    lessonCurrentEl.textContent = `Step ${lessonStep + 1} of ${tutorial.line.length}: ${step.from} to ${step.to}. ${step.note}`;
  } else if (lessonActive) {
    lessonCurrentEl.textContent = "Lesson finished. You can continue playing this position.";
  } else {
    lessonCurrentEl.textContent = "Tap Show on board to see the exact squares for this tutorial.";
  }
}

function renderTutorial(index) {
  currentTutorialIndex = index;
  lessonActive = false;
  lessonStep = 0;
  selected = null;
  legalForSelected = [];
  const tutorial = tutorials[index] || tutorials[0];
  tutorialTitleEl.textContent = tutorial.title;
  tutorialGoalEl.textContent = tutorial.goal;
  tutorialStepsEl.innerHTML = "";
  for (const step of tutorial.steps) {
    const li = document.createElement("li");
    li.textContent = step;
    tutorialStepsEl.append(li);
  }
  tutorialTipEl.textContent = tutorial.tip;
  Array.from(tutorialListEl.children).forEach((button, i) => {
    button.classList.toggle("active", i === index);
  });
  coachText = tutorial.goal;
  render();
}

function setupTutorials() {
  tutorialListEl.innerHTML = "";
  tutorials.forEach((tutorial, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tutorial.title
      .replace("White: Safe Attack Start", "White Start")
      .replace("Black: Solid Defense Start", "Black Start")
      .replace("Opening Attack Plan", "Attack Plan")
      .replace("Opening Defense Checklist", "Defense")
      .replace("Italian Attack Setup", "Italian")
      .replace("London Setup", "London")
      .replace("Scholar's Mate", "Scholar")
      .replace("Stop Scholar's Mate", "Stop Scholar")
      .replace("When To Attack", "Attack Timing");
    button.addEventListener("click", () => renderTutorial(index));
    tutorialListEl.append(button);
  });
  renderTutorial(0);
}

function reset() {
  state = freshState();
  selected = null;
  legalForSelected = [];
  thinking = false;
  coachMove = null;
  coachText = "Start by fighting for the center and developing your pieces.";
  lessonActive = false;
  lessonStep = 0;
  render();
  scheduleComputerMove();
}

lessonStartEl.addEventListener("click", startLesson);
lessonPrevEl.addEventListener("click", () => {
  if (lessonActive && lessonStep > 0) replayLessonTo(lessonStep - 1);
});
lessonNextEl.addEventListener("click", playCurrentLessonMove);
document.getElementById("newGame").addEventListener("click", reset);
document.getElementById("flip").addEventListener("click", () => {
  flipped = !flipped;
  render();
});
document.getElementById("undo").addEventListener("click", () => {
  if (!state.history.length) return;
  restore(state.history.pop());
  if (vsComputer && state.history.length) restore(state.history.pop());
  selected = null;
  legalForSelected = [];
  coachMove = null;
  coachText = state.moves.length ? "Move undone." : "Start by fighting for the center and developing your pieces.";
  render();
  if (isComputerTurn()) scheduleComputerMove();
});
document.getElementById("hint").addEventListener("click", () => {
  if (thinking || isComputerTurn()) return;
  const move = chooseBestMove(state, state.turn, 2);
  if (!move) return;
  coachMove = move;
  selected = move.from;
  legalForSelected = legalMoves(state).filter(item => sameSquare(item.from, move.from));
  coachText = `Try ${algebraic(move.from)} to ${algebraic(move.to)}.`;
  render();
});
document.getElementById("modeComputer").addEventListener("click", () => {
  vsComputer = true;
  document.getElementById("modeComputer").classList.add("active");
  document.getElementById("modeLocal").classList.remove("active");
  reset();
});
document.getElementById("modeLocal").addEventListener("click", () => {
  vsComputer = false;
  document.getElementById("modeLocal").classList.add("active");
  document.getElementById("modeComputer").classList.remove("active");
  reset();
});
document.getElementById("playWhite").addEventListener("click", () => {
  playerColor = "w";
  flipped = false;
  document.getElementById("playWhite").classList.add("active");
  document.getElementById("playBlack").classList.remove("active");
  reset();
});
document.getElementById("playBlack").addEventListener("click", () => {
  playerColor = "b";
  flipped = true;
  document.getElementById("playBlack").classList.add("active");
  document.getElementById("playWhite").classList.remove("active");
  reset();
});
difficultyEl.addEventListener("input", () => {
  const profile = currentDifficulty();
  difficultyLabel.textContent = profile.name;
  difficultyDepth.textContent = profile.detail;
});

reset();
setupTutorials();
