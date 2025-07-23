// @ts-nocheck

class PlayerList extends HTMLElement {
  #playerMap;
  get playerMap() {
    return this.#playerMap;
  }
  set playerMap(value) {
    if (!(value instanceof Map)) {
      throw new TypeError("playerMap must be a Map");
    }
    this.#playerMap = value;
    this.render();
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const styleSheet = new CSSStyleSheet();
    styleSheet.replace(PlayerList.#styles);
    this.shadowRoot.adoptedStyleSheets.push(styleSheet);
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;

    const playersHTML = [...(this.#playerMap?.entries() ?? [])]
      // eslint-disable-next-line no-unused-vars
      .map(([_id, { name, playAs, isHost }]) => {
        const classes = playAs ? "joined" : "";
        const hostStar = isHost ? " ⭐" : "";
        const symbolLabel = playAs ? ` (${playAs?.toUpperCase()})` : "";
        return /* html */ `<li class="${classes}">${name}${hostStar}${symbolLabel}</li>`;
      })
      .join("");

    this.shadowRoot.innerHTML = /* html */ `
      <h2>Players</h2>
      <ul>${playersHTML}</ul>
    `;
  }

  static #styles = /* css */ `
    :host {
      display: block;
    }

    ul {
      list-style: none;
      padding: 0;

      & li {
        margin: 0.2rem 0;
      }
    }
  `;
}

customElements.define("ttt-player-list", PlayerList);
