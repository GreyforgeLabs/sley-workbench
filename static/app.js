const output = document.querySelector("#output");
const targetInput = document.querySelector("#target");
const statusNode = document.querySelector("#status");

async function runCommand(command) {
  const target = encodeURIComponent((targetInput.value || ".").trim() || ".");
  output.textContent = "Running " + command + "...";
  statusNode.textContent = "status: running";
  try {
    const response = await fetch(`/api/run?name=${command}&target=${target}`);
    const json = await response.json();
    statusNode.textContent = `status: ${json.ok ? "ok" : "fail"} (${json.command})`;
    output.textContent = JSON.stringify(json, null, 2);
  } catch (error) {
    statusNode.textContent = "status: error";
    output.textContent = String(error);
  }
}

for (const button of document.querySelectorAll("button[data-command]")) {
  button.addEventListener("click", () => runCommand(button.dataset.command));
}
