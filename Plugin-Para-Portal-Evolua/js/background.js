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