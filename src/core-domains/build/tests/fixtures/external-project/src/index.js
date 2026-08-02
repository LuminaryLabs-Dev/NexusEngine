import isNumber from "is-number";

const answer = isNumber(42) ? 42 : 0;
globalThis.__nexusBuildFixture = answer;
document.querySelector("#result").textContent = String(answer);
