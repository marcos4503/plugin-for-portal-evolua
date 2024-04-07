// @ts-nocheck

//Private variables
var currentExistingToastTimeout = null;

//------ Core functions ------

//Function that load the user preferences to UI
function LoadUserPreferences() {
    //Find the UI elements
    var set_enableLogo = document.getElementById("set_enableLogo");
    var set_closeTabs = document.getElementById("set_closeTabs");

    //Try to load the current preferences of optional functions
    chrome.storage.sync.get(['enableLogo', 'closeTabs'], function (data) {
        //If don't have a preference for "enableLogo", set default
        if (data.enableLogo == null)
            chrome.storage.sync.set({ "enableLogo": "false" });
        //If don't have a preference for "closeTabs", set default
        if (data.closeTabs == null)
            chrome.storage.sync.set({ "closeTabs": "true" });

        //Get the updated current preferences
        chrome.storage.sync.get(['enableLogo', 'closeTabs'], function (data) {
            //Render the current preferences in the UI
            set_enableLogo.value = data.enableLogo;
            set_closeTabs.value = data.closeTabs;

            //Unlock the edition of fields
            set_enableLogo.removeAttribute("disabled");
            set_closeTabs.removeAttribute("disabled");
        });
    });
}

//Function that install the on change listener to options
function InstallAutoSaveListenersForPrefs() {
    //Find the UI elements
    var set_enableLogo = document.getElementById("set_enableLogo");
    var set_closeTabs = document.getElementById("set_closeTabs");

    //Install the callbacks
    set_enableLogo.addEventListener("change", function () {
        //Save the preference
        chrome.storage.sync.set({ "enableLogo": set_enableLogo.value });

        //Notify
        ShowToastNotification("Configuração aplicada!");
    });
    set_closeTabs.addEventListener("change", function () {
        //Save the preference
        chrome.storage.sync.set({ "closeTabs": set_closeTabs.value });

        //Notify
        ShowToastNotification("Configuração aplicada!");
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





//------ Auxiliar functions ------

//Function that show a toast notification
function ShowToastNotification(message) {
    //Get the element of toasts
    var toastContainer = document.getElementById("toastContainer");

    //Set the message
    toastContainer.innerHTML = message;

    //Show the toast
    toastContainer.setAttribute("style", "bottom: 0px;");

    //If have a toast timeout existing, clear it
    if (currentExistingToastTimeout != null) {
        window.clearTimeout(currentExistingToastTimeout);
        currentExistingToastTimeout = null;
    }

    //Wait time and auto close the message
    currentExistingToastTimeout = window.setTimeout(function () {
        //Hide the toast
        toastContainer.removeAttribute("style");

        //Clear the toast timeout reference
        currentExistingToastTimeout = null;
    }, 1500);
}