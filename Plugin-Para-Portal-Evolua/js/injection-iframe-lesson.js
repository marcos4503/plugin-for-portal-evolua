// @ts-nocheck

//This script will be injected into the lessons iframe opened in the site!

//Warn that was injected successfully
console.log("Code injected successfully!");

//Private variables
var currentExistingBackButtonWarnTimer = null;
var currentExistingBackHoldingTimer = null;
var currentExistingBackHoldingIteractions = -3.0;
var isLeftArrowDown = false;
var isRightArrowDown = false;


//Detect the body tag of this document and install keypress listeners to detect keypresses
document.getElementsByTagName("BODY")[0].addEventListener("keydown", (event) => {
    //Ignore events that is part of composing and special key
    if (event.isComposing == true || event.keyCode === 229)
        return;

    //Register the keys pressing down
    if (event.keyCode === 37)
        isLeftArrowDown = true;
    if (event.keyCode === 39)
        isRightArrowDown = true;

    //Run the keys processor
    RunKeysInputProcessor();
});
document.getElementsByTagName("BODY")[0].addEventListener("keyup", (event) => {
    //Ignore events that is part of composing and special key
    if (event.isComposing == true || event.keyCode === 229)
        return;

    //Register the keys released
    if (event.keyCode === 37)
        isLeftArrowDown = false;
    if (event.keyCode === 39)
        isRightArrowDown = false;

    //Run the keys processor
    RunKeysInputProcessor();
});

//Function that run the keys input processor
function RunKeysInputProcessor() {
    //If is pressing left arrow key...
    if (isLeftArrowDown == true)
        ProcessLeftKeyDown();
    //If is releasing left arrow key...
    if (isLeftArrowDown == false)
        ProcessLeftKeyUp();

    //If is pressing right arrow key, run the move to next lesson slide
    if (isRightArrowDown == true) {
        GoToNextLessonSlideIfPossible();
        isRightArrowDown = false;
    }
}

//Function that process left key down
function ProcessLeftKeyDown() {
    //If already have a timer, ignore this call
    if (currentExistingBackHoldingTimer != null)
        return;



    //Get the current element with browser focus inside this iframe of lesson
    var currentActiveElement = document.activeElement;

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
    //If the back button feature, is not enabled in the parent page of this iframe, cancel
    if (parent.document.getElementsByTagName("BODY")[0].getAttribute("pfpe.backButtonEnabled") !== "true") {
        console.log("Going Back is disabled in the extension preferences!");
        WarnThatBackButtonIsDisabled();
        return;
    }



    //Show the hold progress bar
    document.getElementById("pfpe.backPressingProgressBar").style.bottom = "0px";
    document.getElementById("pfpe.backPressingProgressBar.fill").style.width = "0%";

    //Install a timer that fill the progress bar, after the 250ms of progress bar entry animation
    currentExistingBackHoldingTimer = window.setInterval(function () {
        //Increase the hold iteractions
        if (currentExistingBackHoldingIteractions < 10.0)
            currentExistingBackHoldingIteractions += 1.0;

        //If reached the max progress, run the move to previous lesson slide...
        if (currentExistingBackHoldingIteractions == 10.0) {
            //Try to send the message
            try {
                anteriorMomento();
            }
            catch (e) { }

            //Warn that
            console.log("Sending message to go to Previously lesson slide...");

            //Simulate the release of left arrow key
            isLeftArrowDown = false;
            ProcessLeftKeyUp();
        }

        //Render the progress
        document.getElementById("pfpe.backPressingProgressBar.fill").style.width = ((currentExistingBackHoldingIteractions / 7.0 * 100.0) + "%");
    }, 100);
}

//Function that process left key up
function ProcessLeftKeyUp() {
    //If don't have a timer, ignore this call
    if (currentExistingBackHoldingTimer == null)
        return;

    //Hide the hold progress bar
    document.getElementById("pfpe.backPressingProgressBar").style.bottom = "-64px";

    //Uninstall the timer that fill the progress bar
    window.clearInterval(currentExistingBackHoldingTimer);

    //Clear the references
    currentExistingBackHoldingTimer = null;
    currentExistingBackHoldingIteractions = -3.0;
}

//Function that send a message to go to next slide
function GoToNextLessonSlideIfPossible() {
    //Get the current element with browser focus inside this iframe of lesson
    var currentActiveElement = document.activeElement;

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

//Function that shows the warning card of back button disabled
function WarnThatBackButtonIsDisabled() {
    //Try to find the warning card
    var warningCard = document.getElementById("pfpe.warnCardBackDisabled");

    //If not found a warning card, cancel
    if (warningCard == null || warningCard == undefined)
        return;

    //Show the warning
    warningCard.style.opacity = "1.0";

    //If have a toast timeout existing, clear it
    if (currentExistingBackButtonWarnTimer != null) {
        window.clearTimeout(currentExistingBackButtonWarnTimer);
        currentExistingBackButtonWarnTimer = null;
    }

    //Create a timer to hide the warning again
    currentExistingBackButtonWarnTimer = window.setTimeout(function () {
        //Hide the warning
        warningCard.style.opacity = "0.0";

        //Clear the timeout reference
        currentExistingBackButtonWarnTimer = null;
    }, 2500);
}





//If not found a element with class "conteudo-avaliacao-html", show the warning card (means that the lesson is not a exam)
if (document.getElementsByClassName("conteudo-avaliacao-html").length == 0) {
    //Create the warning card
    cardBaseNode = document.createElement('div');
    cardBaseNode.setAttribute("id", "pfpe.warnCard");
    cardBaseNode.setAttribute("class", "warningCardBase");
    cardBaseNode.innerHTML = 'Segure <div class="backKey"></div> ou Pressione <div class="nextKey"></div> para Retroceder ou ' +
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

//If not found a element with class "conteudo-avaliacao-html", pre-create a warning of back button disabled
if (document.getElementsByClassName("conteudo-avaliacao-html").length == 0) {
    //Create the warning card
    cardBaseNode = document.createElement('div');
    cardBaseNode.setAttribute("id", "pfpe.warnCardBackDisabled");
    cardBaseNode.setAttribute("class", "warningCardBase warningCardBaseNegativeVariation");
    cardBaseNode.style.pointerEvents = "none";
    cardBaseNode.style.opacity = "0.0";
    cardBaseNode.innerHTML = 'A função de Retroceder está desativada nas Preferências do Plugin, no navegador.';

    //Find the body element and add the card base to it
    document.getElementsByTagName("BODY")[0].appendChild(cardBaseNode);
}

//If not found a element with class "conteudo-avaliacao-html", pre-create the back hold progress bar status
if (document.getElementsByClassName("conteudo-avaliacao-html").length == 0) {
    //Create the warning card
    var backHoldBaseNode = document.createElement('div');
    backHoldBaseNode.setAttribute("id", "pfpe.backPressingProgressBar");
    backHoldBaseNode.setAttribute("class", "backButtonHoldProgressBar");
    backHoldBaseNode.style.bottom = "-64px";
    //Crate the warning fill
    var backHoldFillNode = document.createElement('div');
    backHoldFillNode.setAttribute("id", "pfpe.backPressingProgressBar.fill");
    backHoldFillNode.setAttribute("class", "backButtonHoldProgressBarFill");
    backHoldFillNode.style.width = "0%";
    backHoldBaseNode.appendChild(backHoldFillNode);
    //Crate the warning card text
    var backHoldTextNode = document.createElement('div');
    backHoldTextNode.setAttribute("class", "backButtonHoldProgressBarText");
    backHoldTextNode.innerHTML = "Segure Para Retroceder Para Momento Anterior!";
    backHoldBaseNode.appendChild(backHoldTextNode);

    //Find the body element and add the card base to it
    document.getElementsByTagName("BODY")[0].appendChild(backHoldBaseNode);
}