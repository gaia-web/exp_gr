// @ts-nocheck

export class GameBoard extends HTMLElement {
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  get board() {
    let attr = this.getAttribute("board") || "---------";
    attr = attr.padEnd(9, "-").slice(0, 9);
    return attr.split("").map((char) => (char === "-" ? null : char));
  }
  set board(value) {
    if (!Array.isArray(value) || value.length !== 9) {
      throw new Error("board must be an array of length 9");
    }
    const stringRepresentation = value.map((v) => v ?? "-").join("");
    this.setAttribute("board", stringRepresentation);
  }

  get playAs() {
    return this.getAttribute("play-as");
  }
  set playAs(value) {
    this.setAttribute("play-as", value);
  }

  cleanUp() {
    this.board = Array(9).fill(null);
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const styleSheet = new CSSStyleSheet();
    styleSheet.replace(GameBoard.#styles);
    this.shadowRoot.adoptedStyleSheets.push(styleSheet);
    this.shadowRoot.addEventListener("click", this.#onCellClick.bind(this));
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;
    const board = this.board;
    this.shadowRoot.innerHTML = `
    ${board
      .map(
        (val, i) =>
          /* html */ `<div class="cell" data-index="${i}">${
            val ? val.toUpperCase() : ""
          }</div>`
      )
      .join("")}
  `;
  }

  #onCellClick(event) {
    if (this.disabled) return;

    const cell = event.target.closest(".cell");
    if (!cell) return;

    const index = Number(cell.dataset.index);
    if (Number.isNaN(index)) return;

    const board = this.board;
    if (board[index] !== null) return;

    const playAs = this.playAs;
    if (!playAs) return;

    board[index] = playAs;
    this.board = board;

    this.dispatchEvent(
      new CustomEvent("cellSelect", {
        detail: { index },
        bubbles: true,
        composed: true,
      })
    );
  }

  #dispatchBoardChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("boardUpdate", {
        bubbles: true,
        composed: true,
      })
    );
  }

  static get observedAttributes() {
    return ["disabled", "board", "play-as"];
  }

  // eslint-disable-next-line no-unused-vars
  attributeChangedCallback(name, _oldVal, _newVal) {
    switch (name) {
      case "board":
        this.#dispatchBoardChangeEvent();
        break;
    }
    this.render();
  }

  static #styles = /* css */ `
    :host {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 5px;
      justify-content: center;
      height: 300px;
      width: 300px;
      color: inherit;
    }

    :host([disabled]) {
      cursor: not-allowed;

      & .cell {
        filter: contrast(0.6);
        pointer-events: none;
      }
    }

    .cell {
      border: 2px solid light-dark(#ccc, #666);
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      padding: 1rem;
      background-color: light-dark(#f0f0f0, #222);

      &:hover {
        filter: contrast(1.1);
      }
    }

  `;
}

customElements.define("ttt-game-board", GameBoard);
