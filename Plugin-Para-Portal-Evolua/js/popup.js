// @ts-nocheck

//Private variables
//...

//------ Core functions ------

//Function that load the user preferences to UI
function LoadUserPreferences() {
    //Find the UI elements
    var set_enableLogo = document.getElementById("set_enableLogo");
    var set_closeTabs = document.getElementById("set_closeTabs");

    //If don't have a preference for "enableLogo"
    if (localStorage.getItem("enableLogo") == null) {
        //Set default option for "enableLogo"
        localStorage.setItem("enableLogo", "false");
        set_enableLogo.value = "false";
    }

    //If don't have a preference for "closeTabs"
    if (localStorage.getItem("closeTabs") == null) {
        //Set default option for "closeTabs"
        localStorage.setItem("closeTabs", "true");
        set_closeTabs.value = "true";
    }

    //Load the preferences to UI
    set_enableLogo.value = localStorage.getItem("enableLogo");
    set_closeTabs.value = localStorage.getItem("closeTabs");
}

//Function that install the on change listener to options
function InstallAutoSaveListenersForPrefs() {
    //Find the UI elements
    var set_enableLogo = document.getElementById("set_enableLogo");
    var set_closeTabs = document.getElementById("set_closeTabs");

    //Install the callbacks
    set_enableLogo.addEventListener("change", function () {
        //Save the preference for UI
        localStorage.setItem("enableLogo", set_enableLogo.value);

        //Save the preference for Background
        chrome.storage.sync.set({ "enableLogo": set_enableLogo.value });
    });
    set_closeTabs.addEventListener("change", function () {
        //Save the preference for UI
        localStorage.setItem("closeTabs", set_closeTabs.value);

        //Save the preference for Background
        chrome.storage.sync.set({ "closeTabs": set_closeTabs.value });
    });
}

//Function that render the extension version
function RenderExtensionVersion() {
    //Render the extension version
    document.getElementById("extensionVersion").innerHTML = ("v" + chrome.runtime.getManifest().version);
}

//Load the current user preferences on end of the DOM creation
window.onload = function () {
    LoadUserPreferences();
    InstallAutoSaveListenersForPrefs();
    RenderExtensionVersion();
}