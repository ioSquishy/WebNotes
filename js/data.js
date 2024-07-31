const data = {
    saveVersion: 1,
    pageHeader: "WebNotes",
    sections: []
};

var changesSaved; // boolean
const saveButton = document.getElementById("saveNotesButton");

/**
 * Changes save icon depending on if changes
 * have been saved manually to a file.
 * @param {boolean} saved 
 */
function changesSavedOffline(saved) {
    if (saved == true) {
        changesSaved = true;
        saveButton.style.backgroundImage = "url(./icons/save_icon.svg)";
    } else {
        changesSaved = false;
        saveButton.style.backgroundImage = "url(./icons/unsaved_icon.svg)";
    }
}

/**
 * Displays a confirmation message asking user if they are sure they want to
 * continue with whatever they were doing as it may lead to data loss.
 * @returns true if changes are saved or user agrees to lose data, false user cancels action
 */
function confirmLostData() {
    if (changesSaved == false) {
        return confirm("You have unsaved changes! Proceed?");
    } else {
        return true;
    }
}

/**
 * Creates a valid section entry to be put into data object
 * @param {String} id 
 * @param {String} rawHeader 
 * @param {String} rawText 
 * @returns 
 */
function createSectionEntry(id, rawHeader, rawText) {
    return {
        id: id,
        rawHeader: rawHeader,
        rawText: rawText
    };
}

/**
 * Updates data object and then makes user save it as a json file. 
 */
function saveJSON() {
    updateData();
    // made with help from gpt 4.0
    let dataJson = JSON.stringify(data);
    let link = document.createElement('a');
    let blob = new Blob([dataJson], {type: 'application/json'});

    link.download = "webnotes.json";
    link.href = window.URL.createObjectURL(blob);
    link.click();

    changesSavedOffline(true);

    setTimeout(() => window.URL.revokeObjectURL(link.href), 1000);
}

/**
 * Parses and stores JSON data inputted by user into data object.
 * @param {*} event 
 */
function loadJSON(event) {
    // made with help from gpt 4.0
    let file = event.target.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let json = JSON.parse(e.target.result);
            setParsedData(json);
            loadData();
        }
        reader.readAsText(file);
    } else {
        window.alert("unable to load web notes");
    }
}

/**
 * Updates the data object so all values are up to date.
 */
function updateData() {
    // update page header
    data.pageHeader = pageHeader.value;
    // update sections
    let updatedSections = [];

    let sections = sectionWrapper.getElementsByTagName("SECTION");
    for (let i = 0; i < sections.length; i++) {
        let section = sections.item(i);
        let rawSectionHeader = section.getElementsByClassName("sectionHeader").namedItem("rawHeader").value;
        let rawSectionText = section.getElementsByClassName("sectionText").namedItem("rawText").value;
        updatedSections.push(createSectionEntry(section.id, rawSectionHeader, rawSectionText));
    }

    data.sections = updatedSections;
}

/**
 * Resets current HTML and then loads data from data object into HTML.
 */
function loadData() {
    // reset html
    navWrapper.innerHTML = "";
    sectionWrapper.innerHTML = "";
    numSections = 0;
    
    // set page header and title
    pageHeader.value = data.pageHeader;
    pageTitle.innerText = data.pageHeader;
    // add sections
    data.sections.forEach(section => {
        addNewSection(section.id);
        let addedSection = document.getElementById(section.id);
        addedSection.getElementsByClassName("sectionHeader").namedItem("rawHeader").value = section.rawHeader;
        addedSection.getElementsByClassName("sectionText").namedItem("rawText").value = section.rawText;
        toggleTextArea(section.id);
    })

    changesSavedOffline(true);
}

/**
 * Sets data object to values of parsed JSON of loaded data object.
 * @param {*} parsedJson 
 */
function setParsedData(parsedJson) {
    // in case of changes to data object structure in the future,
    // use saveVersion here to set data differently if needed
    data.pageHeader = parsedJson.pageHeader;
    data.sections = parsedJson.sections;
}

const localStorage = window.localStorage;

/**
 * Updates data object and then stores its JSON in local web storage
 */
function saveToLocalStorage() {
    updateData();
    localStorage.setItem("autoSave", JSON.stringify(data));
}

/**
 * Loads local web storage data if it exists.
 * If it does not exist, creates a blank web note with one section.
 */
function loadLocalSave() {
    let autoSave = localStorage.getItem("autoSave");

    if (autoSave != null) {
        let savedData = JSON.parse(autoSave);
        setParsedData(savedData);
        loadData();
        saveToLocalStorage();
    } else {
        addNewSection();
    }
}

/**
 * Facade function that first confirms that user wants to load a file
 * if they have unsaved changes. Then, prompts user to select file to load.
 */
function loadNotes() {
    if (confirmLostData()) {
        document.getElementById('file-input').click();
    }
}

/**
 * Prompts user to save changes if they have any unsaved changes and then
 * clears local storage and reloads the page the user a blank web note.
 */
function newNotePage() {
    if (confirmLostData()) {
        localStorage.clear();
        location.reload();
    }
}

window.onload = loadLocalSave();