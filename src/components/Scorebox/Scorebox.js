class Scorebox extends HTMLElement {
  constructor() {
    super();

    this.innings = 9;
    this.currentInning = 0;
  }

  connectedCallback() {
    this.innerHTML = `
      <table class="scorebox">
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
            <th>6</th>
            <th>7</th>
            <th>8</th>
            <th>9</th>
            <th>R</th>
            <th>H</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Visitor</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
          <tr>
            <td>Home</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    `;
  }
}

export const scorebox = () => customElements.define('db-scorebox', Scorebox);
