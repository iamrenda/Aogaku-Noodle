import { DISPLAY_METHOD_ID } from "../const/classNames";

function getCurrentDisplay() {
    const displayButton = document.querySelector(DISPLAY_METHOD_ID);

    const currentDisplay = displayButton ? displayButton.textContent.trim() : null;
    const validDisplays = ["Card", "List", "Summary", "カード", "リスト", "概要"];

    if (!currentDisplay || !validDisplays.includes(currentDisplay)) {
        return null;
    }

    return currentDisplay;
}

export default getCurrentDisplay;
