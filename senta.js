let Senta = window.Senta || (function() {

    let Senta = {};
    let config = Reveal.getConfig() || {};
    config.Senta = config.Senta || {};

    let options = {
        // If the previous slide is a slide further in the deck (i.e. we come back to
        // slide from the next slide), by default the last fragment transition will be
        // triggered to to get the last state of the visualization. This can be
        // discarded.
        runLastState: config.Senta.runLastState === undefined ? !config.Senta.runLastState : config.Senta.runLastState, //default true

        // If true, do not drop the iframe once the slide is not active anymore
        // Default is false since keeping the iframes running can overwhelm the browser
        // depending of the complexity of the visualization. The need for this option
        // to be true is when the last fragment transition is not a state per se but
        // the result of the multiple previous transitions, and the "triggerLastTransition"
        // option is not sufficient to recover the last state.
        keepViz: config.Senta.keepViz === undefined ? !!config.Senta.keepViz : config.Senta.keepViz, // default: false

        // This will prefix the path attributes of the source html paths with the given path.
        // (by default "src" if set to true or with the specified path if string)
        mapPath: typeof(config.Senta.mapPath) === "string" ? config.Senta.mapPath : (config.Senta.mapPath ? "src" : ""),

        // If true, will try to locate the file at a fallback url without the mapPath prefix in case no file is found
        // at the stipulated url with mapPath
        tryFallbackURL: config.Senta.tryFallbackURL === undefined ? !!config.Senta.tryFallbackURL : config.Senta.tryFallbackURL, //default false

        // If true the browser will refresh page whenever browser window is resized. Allows any d3 visualisations to be adapted.
        // to the window size
        refreshOnResize: config.Senta.refreshOnResize === undefined ? !config.Senta.refreshOnResize : config.Senta.refreshOnResize, //default true

        // Add plus and minus buttons to range inputs
        rangeButtons: config.Senta.rangeButtons === undefined ? !config.Senta.rangeButtons : config.Senta.rangeButtons //default true
    };

    /* When slide is changed or ready the slideInput object is reset. The up/down controls in the slide are activated
    if there are input objects in the slide. Each fieldset which are initiated as hidden are turned visible when all
    iframes are loaded. */
    Reveal.addEventListener("slidechanged", (event) => setSlideReady(event));
    Reveal.addEventListener("ready", (event) => setSlideReady(event));

    // Trigger reload when window is resized in order to have d3 visualizations adjusted to window
    if (options.refreshOnResize) window.addEventListener("resize", () => setTimeout(() => location.reload(), 600));

    Reveal.initialize({Keyboard: {
            38: () => slideInput.prevInput(),
            40: () => slideInput.nextInput(),
            13: () => {
                let clicked = slideInput.presentInput[slideInput.inputIndex];
                if (slideInput.inputIndex !== -1) {clicked.click()}
                slideInput.setPresentInput(clicked);
            }
        }});

    /* When control up/down controls are clicked the slideInput object moves to the next input. When left/right controls
    are clicked the controls are reset. When you click anywhere on the slide BUT the up/down arrows the slideInput object
    is reset. Whereever you click the target is not supposed to be the focus, therefore blur is called. */
    window.addEventListener("click", function(e) {
        if (e.target.type === "button") {
            if (e.target.classList.contains("navigate-up")) slideInput.prevInput();
            if (e.target.classList.contains("navigate-down")) slideInput.nextInput();

            //CHANGE
            //if (!e.target.classList.contains("navigate-up") && !e.target.classList.contains("navigate-down")) slideInput.resetPresentInput();
            e.target.blur();
        }
    });

    /* setSlideReady function check if there are any iframe containers in the present slide. If there are such they may
    be adding controls to the container of the iframe. Therefore it calls functions to set the slide ready when iframes
    are loaded. If no iframe containers are found controls and input are reset without delay. */
    function setSlideReady(event) {
        let figcontainers = [...document.querySelectorAll("section.present div.fig-container")];
        if (figcontainers.length !== 0) {
            $("section.present div.fig-container iframe").on("load", function() {
                slideInput.resetPresentInput();
                editControls();
                $("section.present fieldset").toArray().forEach(function(d) {d.style.visibility = "visible"});
            });
        } else {
            slideInput.resetPresentInput();
            editControls();
        }
        //inputManager.resetInput();
        if (!options.keepViz) deletePrevious(event);
        handleSlideVisualizations(event);
    }

    function getSlideId() {
        let indices = Reveal.getIndices(document.getElementById("sectionID"));
        return indices.h + "#S#" + indices.v;
    }

    function refreshInputLegend() {
        let slideId = getSlideId();
        let inputs = Senta.input.getFieldObjects(slideId);
        //let legends = Senta.legend.getFieldObjects(slideId);
        if (typeof inputs !== "undefined") {
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i].getRefresh()) inputs[i].refresh();
            }
        }
        /*if (typeof legends !== "undefined") {
            for (let i = 0; i < legends.length; i++) {
                if (legend[i].getRefresh()) legends[i].refresh();
            }
        }*/
    }

}