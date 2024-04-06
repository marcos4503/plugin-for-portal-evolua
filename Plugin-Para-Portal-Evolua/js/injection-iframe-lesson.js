// @ts-nocheck

//This script will be injected into the lessons iframe opened in the site!

//Warn that was injected successfully
console.log("Code injected successfully!");

//Detect the body tag of this document and install a keypress listener to detect keypresses
document.getElementsByTagName("BODY")[0].addEventListener("keyup", (event) => {
    //Ignore events that is part of composing and special key
    if (event.isComposing == true || event.keyCode === 229)
        return;

    //Repass the key press event to the handler
    OnAnyKeyPress(event);
});

//Function that will be called on every key press inside the iframe of lesson
function OnAnyKeyPress(eventData) {
    //Get the current element with browser focus inside this iframe of lesson
    var currentActiveElement = document.activeElement;

    //If is the "<-" key, send a message to go to previous slide
    if (eventData.keyCode === 37) {
        //Get the "Back" icon node, of the first slide
        var backButton = document.getElementsByClassName("btn-volta-momento")[0];

        //If not found the button, cancel
        if (backButton == null || backButton === undefined) {
            console.log("The Back action is not available in this lesson.");
            return;
        }
        //If this button is disabled, cancel
        if (backButton.classList.contains("disabledbutton") == true) {
            console.log("Going Back is not available yet!");
            BlinkTheLessonControlBar();
            return;
        }
        //If the current active element is a text field, cancel
        if (currentActiveElement != null && currentActiveElement != undefined)
            if (currentActiveElement.tagName == "TEXTAREA" || currentActiveElement.tagName == "INPUT") {
                console.log("Going Back is not available while editing some text field!");
                return;
            }

        //Try to send the message
        try {
            anteriorMomento()
        }
        catch (e) { }

        //Warn that
        console.log("Sending message to go to Previously lesson slide...");
    }

    //If is the "->" key, send a message to go to next slide
    if (eventData.keyCode === 39) {
        //Get the "Next" icon node, of the first slide
        var nextButton = document.getElementsByClassName("btn-avanca-momento")[0];

        //If not found the button, cancel
        if (nextButton == null || nextButton === undefined) {
            console.log("The Next action is not available in this lesson.");
            return;
        }
        //If this button is disabled, cancel
        if (nextButton.classList.contains("disabledbutton") == true) {
            console.log("Going Next is not available yet!");
            BlinkTheLessonControlBar();
            return;
        }
        //If the current active element is a text field, cancel
        if (currentActiveElement != null && currentActiveElement != undefined)
            if (currentActiveElement.tagName == "TEXTAREA" || currentActiveElement.tagName == "INPUT") {
                console.log("Going Next is not available while editing some text field!");
                return;
            }

        //Try to send the message
        try {
            proximoMomento();
        }
        catch (e) { }

        //Warn that
        console.log("Sending message to go to Next lesson slide...");
    }
}

//Function that will set the lesson control bar to red, and after a time, change to default color
function BlinkTheLessonControlBar() {
    //Try to find the controlbars of all lesson slides
    var controlBars = document.getElementsByClassName("bar-navegador");

    //Set color of controlbars of all lesson slides, to red
    for (var i = 0; i < controlBars.length; i++)
        controlBars[i].style.background = "linear-gradient(135deg, #8892a0 0%, #b10000 100%)";

    //Create the timer to set default color for all controlbars of all lesson slides
    window.setTimeout(function () {
        //Try to find the controlbars of all lesson slides
        var controlBars = document.getElementsByClassName("bar-navegador");

        //Remove the style foreach
        for (var i = 0; i < controlBars.length; i++)
            controlBars[i].style.background = "";
    }, 150);
}





//If not found a element with class "conteudo-avaliacao-html", show the warning card (means that the lesson is not a exam)
if (document.getElementsByClassName("conteudo-avaliacao-html").length == 0) {
    //Create the warning card
    cardBaseNode = document.createElement('div');
    cardBaseNode.setAttribute("id", "pfpe.warnCard");
    cardBaseNode.setAttribute("class", "warningCardBase");
    cardBaseNode.innerHTML = 'Pressione <div class="backKey"></div> ou <div class="nextKey"></div> para Retroceder ou ' +
        'Avançar os momentos da Aula, quando for possível.';

    //Setup the user dismiss event
    cardBaseNode.addEventListener("mouseenter", (event) => {
        //Start fade-out animation for the warning card
        document.getElementById("pfpe.warnCard").style.opacity = "0.0";
        document.getElementById("pfpe.warnCard").style.pointerEvents = "none";

        //Warn that the card was dismissed
        console.log("The Card was Dismissed by the user.");
    });

    //Find the body element and add the card base to it
    document.getElementsByTagName("BODY")[0].appendChild(cardBaseNode);

    //Wait until the loading screen is removed from DOM (on lesson load finished)
    var loadScreenWaiter = window.setInterval(function () {
        //Try to find the loading screen
        var loadScreen = document.getElementById("holdon-overlay");

        //If not found the loading screen, means that the loading screen was removed from DOM
        if (loadScreen == null || loadScreen === undefined) {
            //Stop this timer
            window.clearInterval(loadScreenWaiter);

            //Warn that the loading screen was removed
            console.log("Lesson loading finished. Hiding the Card soon...");

            //Run code after time...
            window.setTimeout(function () {
                //Start fade-out animation for the warning card
                document.getElementById("pfpe.warnCard").style.opacity = "0.0";
                document.getElementById("pfpe.warnCard").style.pointerEvents = "none";

                //After 5 seconds...
                window.setTimeout(function () {
                    //Disable the warning card from DOM
                    document.getElementById("pfpe.warnCard").style.display = "none";

                    //Warn that the card was hided and closed
                    console.log("The Card was completely Hided and Closed.");
                }, 5000);
            }, 10000);
        }
    }, 1000);
}