// Inject the stamp toggle into the active tab when the toolbar button is clicked.
// activeTab grants temporary access to this tab only, only because of this click.
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    })
    .catch((err) => {
      // e.g. chrome:// pages, the Web Store, or PDFs can't be injected — ignore.
      console.debug("evistamp: cannot stamp this page —", err.message);
    });
});
