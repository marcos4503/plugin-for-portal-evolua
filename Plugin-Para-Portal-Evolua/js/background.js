// @ts-nocheck

//Private variables
//...

//------- Core function ---------

//Function that runs on every new loaded page in browser tabs
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    //If the page is not finished the load, ignore it
    if (changeInfo.status != 'complete')
        return undefined;

    //If is a chrome page, ignore it
    if (tab.url?.startsWith("chrome://") == true) {
        console.log("New page detected. Chrome page is not allowed for Post Processing.");
        return undefined;
    }
    //If is a edge page, ignore it
    if (tab.url?.startsWith("edge://") == true) {
        console.log("New page detected. Edge page is not allowed for Post Processing.");
        return undefined;
    }
    //If is not a allowed page in the manifest, ignore it
    if (tab.url?.includes(chrome.runtime.getManifest().host_permissions[0].replace("*://*.", "").replace("/*", "")) == false) {
        console.log("New page detected. Page not allowed in \"manifest.json\" for Post Processing.");
        return undefined;
    }

    //Load the user preferences and run the optional functions
    chrome.storage.sync.get(['enableLogo', 'closeTabs'], function (data) {
        ChangePageLogoToEnsinext(data.enableLogo, tabId);
        CloseOtherTabs(data.closeTabs);
    });

    //Reset the zoom of the page (to 100%)
    chrome.tabs.setZoom(tabId, 1.0, null);

    //Auto set the page tab as active in the browser
    chrome.tabs.update(tabId, { active: true });

    //Set the window as fullscreen
    chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, { state: "fullscreen" });
    //Detects when the window is resized
    chrome.windows.onBoundsChanged.addListener((window) => {
        //Get current active tab of the resized window
        chrome.tabs.query({ currentWindow: true, active: true }, function (resultTabArray) {
            //If the current active tab of window is not a allowed page in the manifest, ignore this callback
            if (resultTabArray[0].url?.includes(chrome.runtime.getManifest().host_permissions[0].replace("*://*.", "").replace("/*", "")) == false)
                return;

            //Detect the current state of the resized window
            chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT, function (window) {
                //If is changed to "normal" state, set it to maximized state
                if (window.state == "normal")
                    chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, { state: "maximized" });
            });
        });
    });

    //Post process the loaded page
    chrome.scripting.executeScript({ target: { tabId: tabId }, func: PostProcessLoadedPage }).then(() => {
        console.log("New page detected. Post Processing...");
    });
});

//Function that changes the page logo to Ensinext
function ChangePageLogoToEnsinext(logoEnabled, tabId) {
    //If the logo is not enabled, ignore this call
    if (logoEnabled != "true")
        return;

    //Run the logo change script in the page context
    chrome.scripting.executeScript({
        target: { tabId: tabId }, func: () => {
            //Try to change the favicon
            var linkNodes = document.getElementsByTagName("HEAD")[0].getElementsByTagName("LINK");
            //Change the icon URL for all favicon tags
            for (var i = 0; i < linkNodes.length; i++) {
                //If is not a tag of favicon, ignore
                if (linkNodes[i].getAttribute("rel") != "icon")
                    continue;

                //Change the favicon
                linkNodes[i].setAttribute("href", chrome.runtime.getURL("img/ensinext-favicon.png"));
            }

            //Try to change the logo of login screen
            var loginLogoNode = document.getElementsByClassName("logo-login")[0];
            if (loginLogoNode != null && loginLogoNode != undefined)
                loginLogoNode.src = chrome.runtime.getURL("img/ensinext-login.png");

            //Try to change the nav bar icon
            var navbarLogoNode = document.getElementsByClassName("logo-nav")[0];
            if (navbarLogoNode != null && navbarLogoNode != undefined)
                navbarLogoNode.src = chrome.runtime.getURL("img/ensinext-navbar.png");
        }
    }).then(() => {
        console.log("New page detected. Changing Logos...");
    });
}

//Function that process the close other thabs that is not portal evolua
function CloseOtherTabs(closeTabsEnabled) {
    //If the close other tabs is not enabled, ignore this call
    if (closeTabsEnabled != "true")
        return;

    //Query all currently opened tabs (in all windows) and close all that don't have portal evolua site
    chrome.tabs.query({ windowType: "normal" }, function (resultTabArray) {
        //Prepare the information about tabs
        var hasClosedTabs = false;

        //Check each tab...
        for (var i = 0; i < resultTabArray.length; i++)
            if (resultTabArray[i].url?.includes(chrome.runtime.getManifest().host_permissions[0].replace("*://*.", "").replace("/*", "")) == false) {
                chrome.tabs.remove(resultTabArray[i].id, function () { });
                hasClosedTabs = true;
            }

        //If was closed some tab, warn it
        if (hasClosedTabs == true)
            chrome.notifications.create("tabWarn",
                {
                    type: "basic",
                    iconUrl: "../img/icon-64px.png",
                    title: "Abas Fechadas",
                    message: "As outras abas do Browser, foram fechadas automaticamente. Mantenha o foco!",
                }, function () { });
    });
}

//Function that post process the code injection on the loaded page
function PostProcessLoadedPage() {
    //Get the url of the page
    var pageUrl = window.location.toString();

    //Install a mutation observer inside the page, to detect every new lesson iframe created inside the page
    new MutationObserver(async records => {
        // This callback gets called when any nodes are added/removed from document.body.
        // The {childList: true, subtree: true} options are what configures it to be this way.

        // This loops through what is passed into the callback and finds any iframes that were added.
        for (let record of records) {
            //For added nodes...
            for (let node of record.addedNodes) {
                if (node.tagName === "IFRAME") {

                    //Warn about new iframe detected on the page
                    console.log("New lesson iframe detected! Injecting code...");

                    //Wait the iframe finishes the document load
                    node.contentWindow.onload = function () {
                        //Get a reference for the iframe content
                        var iframeDocument = node.contentDocument || node.contentWindow.document;

                        //Get the head tag
                        var headTag = iframeDocument.getElementsByTagName("HEAD")[0];

                        //Inject the javascript file that will run on page context
                        newScript = document.createElement('script');
                        newScript.type = 'text/javascript';
                        newScript.src = chrome.runtime.getURL("js/injection-iframe-lesson.js");
                        headTag.appendChild(newScript);

                        //Inject the css file that will be acessible on page context
                        newCss = document.createElement('link');
                        newCss.setAttribute("rel", "stylesheet");
                        newCss.setAttribute("href", chrome.runtime.getURL("css/injection-iframe-lesson.css"));
                        headTag.appendChild(newCss);

                        //Force the browser focus into this new added lesson iframe
                        node.focus();
                        window.setTimeout(function () { node.contentWindow.focus(); }, 250);
                    };
                }
            }

            //For removed nodes...
            for (let node of record.removedNodes) {
                if (node.tagName === "DIV" && node.getAttribute("class") === "background_player") {

                    //Warn about the iframe removed
                    console.log("A lesson iframe was removed. Reloading the page soon...");

                    //Show the loading indicator on lessons screen
                    var loadingIndicator = document.getElementsByClassName("modal-degustacao-load")[0];
                    if (loadingIndicator != null && loadingIndicator != undefined) {
                        loadingIndicator.style.display = "block";
                        loadingIndicator.style.zIndex = "5000";
                    }

                    //Wait a time and reload the page
                    window.setTimeout(function () { window.location.reload(); }, 2500);
                }
            }
        }
    }).observe(document.body, { childList: true, subtree: true });

    //Set the page as fullscreen automatically
    //document.documentElement.requestFullscreen();
}