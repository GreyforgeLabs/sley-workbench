const output = document.querySelector("#output");
for (const button of document.querySelectorAll("button[data-command]")) {
  button.addEventListener("click", async () => {
    output.textContent = "Running " + button.dataset.command + "...";
    const response = await fetch("/api/" + button.dataset.command);
    const json = await response.json();
    output.textContent = JSON.stringify(json, null, 2);
  });
}
