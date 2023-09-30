import {TimerUI} from "./TimerUI";
import {ThemeManager} from "./Themes";
import {VoiceNotifier} from "./sound";


new ThemeManager();
new TimerUI(new VoiceNotifier());
