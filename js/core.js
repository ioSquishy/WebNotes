// text area event listener functions
const pageHeader = document.getElementById("pageHeader");
const pageTitle = document.getElementById("title");
const scrollOffset = 31;

pageHeader.addEventListener("keydown", (event) => preventNewLine(event), false);
pageHeader.addEventListener("input", updateWebTitle, false);

/**
 * Adjusts textarea height to prevent need for scrolling
 */
function adjustTextareaHeight() {
    this.style.height = 'fit-content';
    this.style.height = (this.scrollHeight - scrollOffset) + "px";
}

/**
 * Prevents the addition of a new line to a textarea
 * @param {*} event 
 */
function preventNewLine(event) {
    if (event.key == "Enter") {
        event.preventDefault();
    }
}

/**
 * Sets the web title to the page header
 */
function updateWebTitle() {
    pageTitle.innerText = pageHeader.value;
}

// header/section text code
/**
 * Toggles a textarea so it is no longer editable, replacing the innerHTML
 * of its sibling div with processed/cooked text.
 * 
 * Also saves current data to local web api storage and sets save button to
 * changes unsaved icon.
 * @param {String} id 
 */
function toggleTextArea(id) {
    let section = document.getElementById(id);
    let textAreas = section.getElementsByTagName("TEXTAREA");
    let textDivs = section.getElementsByTagName("DIV");

    let headerTextArea = textAreas.namedItem("rawHeader");
    let headerDiv = textDivs.namedItem("cookedHeader");
    let sectionTextArea = textAreas.namedItem("rawText");
    let sectionTextDiv = textDivs.namedItem("cookedText");

    let deleteButton = section.getElementsByClassName("deleteButton")[0];

    // if section is currently being editted
    if (section.getAttribute("editing") == "true") {
        // hide delete button
        deleteButton.style.display = "none";
        // hide text areas
        headerTextArea.style.display = "none";
        sectionTextArea.style.display = "none";
        // update divs
        let headerHTML = rawToHTML(headerTextArea.value);
        headerDiv.innerHTML = headerHTML;
        sectionTextDiv.innerHTML = rawToHTML(sectionTextArea.value);
        // display divs
        headerDiv.style.display = "unset";
        sectionTextDiv.style.display = "unset";
        // update nav header
        updateHeader(section.id, headerHTML);
        // set editing attribute to false
        section.setAttribute("editing", "false");
        // save data locally
        saveToLocalStorage();
        // offline changes saved false
        changesSavedOffline(false);
    } else {
        // display text areas
        headerTextArea.style.display = "unset";
        sectionTextArea.style.display = "unset";
        // hide divs
        headerDiv.style.display = "none";
        sectionTextDiv.style.display = "none";
        // show delete button
        deleteButton.style.display = "unset";
        // set editing attribute to true
        section.setAttribute("editing", "true");
    }
}

/**
 * Updates the header of the section with provided secID to provided html
 * @param {String} secID section ID (without "nav" ending) of header to update
 * @param {String} html html to set header innerHTMl to
 */
function updateHeader(secID, html) {
    document.getElementById(secID + "nav").innerHTML = html;
}

// template code
const sectionWrapper = document.getElementById("sectionWrapper");
const sectionTemplate = document.getElementById("sectionTemplate");
var numSections = 0;

/**
 * Clones and fills out a sectionTemplate, appending it to the sectionWrapper
 * Adds event listeners to the section
 */
function addSection(id) {
    let clone = sectionTemplate.content.cloneNode(true);
    // set section id
    clone.getElementById("sec").id = id;
    // add template to wrapper
    sectionWrapper.appendChild(clone);
    // set event listeners for text areas
    let textareas = document.getElementById(id).getElementsByTagName("textarea");
    textareas.namedItem("rawHeader").addEventListener("keydown", (event) => preventNewLine(event), false);
    let sectionTextarea = textareas.namedItem("rawText")
    sectionTextarea.setAttribute("style", "height:" + (sectionTextarea.scrollHeight - scrollOffset) + "px;");
    sectionTextarea.addEventListener("input", adjustTextareaHeight, false);
}

const navWrapper = document.getElementById("navWrapper");
const navTemplate = document.getElementById("navTemplate");

/**
 * Clones and fills out a navTemplate, appending it to the navWrapper
 */
function addSectionNav(id) {
    let clone = navTemplate.content.cloneNode(true);
    clone.getElementById("navLink").href = "#" + id;
    clone.getElementById("navLink").id = id + "nav";
    navWrapper.appendChild(clone);
}

/**
 * Increass the numSections variable and 
 * then calls addSectionNav() and addSection()
 */
function addNewSection(customID) {
    id = customID != null ? customID : Date.now();
    addSectionNav(id);
    addSection(id);
}

// delete section code
function deleteSection(id) {
    if (confirm("Delete this section?")) {
        document.getElementById(id).remove();
        document.getElementById(id + "nav").remove();
    }
}

// section highlighting code
/**
 * Adds the 'hightlight' class to an element based on its id and then removes it
 * after 1 second.
 * @param {String} id id of element to temporarily highlight
 */
function highlightSection(id) {
    console.log(id);
    let target = document.getElementById(id);
    target.classList.add('highlight');

    // remove highlight after 1 second
    setTimeout(() => {target.classList.remove('highlight')}, 500);
}

// nav code
navWrapper.addEventListener("dragstart", event => dragStart(event));
navWrapper.addEventListener("dragenter", event => dragEnter(event));
navWrapper.addEventListener("dragover", event => dragOver(event));
navWrapper.addEventListener("dragend", event => dragEnd(event));

var currentlyDragging; // stores the node

/**
 * Ran when user starts dragging an element.
 * Sets currentlyDragging variable and the drag image.
 * @param {DragEvent} event 
 */
function dragStart(event) {
    // make image transparent
    var img = new Image(1, 1);
    img.src = "../icons/transparent.png";
    event.dataTransfer.setDragImage(img, 0, 0);

    event.dataTransfer.dropEffect = "none";
    // set attributes and store target
    currentlyDragging = event.target;
    currentlyDragging.setAttribute("dragging", true);
}

/**
 * Ran when user drags an element over another element.
 * Reorders the navWrapper and sectionWrapper children nodes when dragging over other sections.
 * @param {DragEvent} event 
 */
function dragEnter(event) {
    event.preventDefault();
    targetID = event.target.id;
    if (targetID == "navWrapper" || targetID == currentlyDragging.id) {
        return;
    }

    swapNodes(currentlyDragging, event.target)

    var currentSection = document.getElementById(String(currentlyDragging.id).slice(0, -3));
    var targetSection  = document.getElementById(String(event.target.id).slice(0, -3));
    swapNodes(currentSection, targetSection);
}

/**
 * Ran when element is dragged over another element.
 * Prevents default: This is required to prevent the mouse from turning into a no-drop symbol.
 * @param {DragEvent} event 
 */
function dragOver(event) {
    event.preventDefault();
}

/**
 * Ran when dragging ends.
 * Sets the last dragged elements attribute "dragging" to false.
 * @param {DragEvent} event 
 */
function dragEnd(event) {
    currentlyDragging.setAttribute("dragging", false);
}

/**
 * Swaps node node1 and node2 from the perspective of their parent sibling.
 * Will do nothing of both node1 and node2 do not have the same parent node.
 * @param {Node} node1 Element to insert.
 * @param {Node} node2 Element to insert e1 before.
 */
function swapNodes(node1, node2) {
    if (node1.parentNode != node2.parentNode) {
        console.log("both nodes must have the same parent");
        return;
    }

    var parentNode = node1.parentNode;
    children = Array.from(parentNode.children);

    if (children.indexOf(node1) < children.indexOf(node2)) {
        parentNode.insertBefore(node1, node2.nextSibling);
    } else {
        parentNode.insertBefore(node1, node2);
    }
}