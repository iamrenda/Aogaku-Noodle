import { CLASS_NAMES } from "../const/classNames";
import getCurrentDisplay from "./getCurrentDisplay";

function getClassesName() {
    const currentDisplayCourse = getCurrentDisplay() || "リスト";
    return CLASS_NAMES[currentDisplayCourse];
}

export default getClassesName;
