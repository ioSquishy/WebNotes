const copiable = {
    tag: "copiable",
    params: ["displayedText", "copiedText"],
    html: `<button class="copiable" onclick="copyText(this)" value="copiedText">displayedText</button>`
}

const currentDate = {
    tag: "currentDate",
    params: [],
    html: `${new Date().getMonth()}/${new Date().getDate()}/${new Date().getFullYear()}`
}

const tags = [currentDate, copiable];

/**
 * Replaces tags found in rawText with their respective
 * innerHTML based on their parameters
 * @param {String} rawText 
 * @returns converted text as raw html
 */
function rawToHTML(rawText) {
    let innerHTML = String(rawText);
    
    tags.forEach(tag => {
        // regex created by gpt 4.0 with some modifications by me
        let escapedTag = tag.tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let regex = new RegExp(`@(${escapedTag})\\(([@A-Za-z0-9_,/\\" :\\\\.*\\-#]*?)\\)`, 'g');
        innerHTML = innerHTML.replaceAll(regex, (match) => {
            return convertTag(tag, match);
        });
    })
        
    return innerHTML;
}

/**
 * Converts match to the innerHTML of its tag
 * after applying parameters
 * @param {*} tag tag of text
 * @param {String} match text that contains tag
 * @returns 
 */
function convertTag(tag, match) {
    // check if tag has any params
    if (tag.params.length >= 1) {
        // if tag has 1 or more params ensure it has correct amount
        if (validNumParams(tag, match)) {
            let matchParams = getMatchParams(tag, match);
            let replacedHTML = tag.html;
            for (i = 0; i < tag.params.length; i++) {
                replacedHTML = replacedHTML.replaceAll(tag.params[i], matchParams[i]);
            }
            return replacedHTML;
        } else {
            return match;
        }
    } else {
        // if not just return html
        return tag.html;
    }
}

/**
 * Returns whether or not a raw tag has the correct number of paramters
 * @param {*} tag tag of text
 * @param {String} match text that contains tag
 * @returns true if the match has correct number of parameters
 */
function validNumParams(tag, match) {
    let rawParams = String(match).slice(tag.tag.length+2, String(match).length-1);
    if (rawParams.split(',').length == tag.params.length) {
        return true;
    }
    console.log("invalid tag params inputted");
    console.log("tag params: " + tag.params);
    console.log("match: " + match)
    console.log("params inputted: " + rawParams.split(", ").length);
    console.log("params expected: " + tag.params.length)
    return false;
}

/**
 * Returns individual parameters of the match
 * @param {*} tag tag of match
 * @param {*} match text that contains tag
 * @returns array of parameters as strings
 */
function getMatchParams(tag, match) {
    let rawParams = String(match).slice(tag.tag.length+2, String(match).length-1);
    return rawParams.split(", ");
}

/**
 * Copies the value of a button to clipboard
 * @param {*} copiable 
 */
function copyText(copiable) {
    navigator.clipboard.writeText(copiable.value.replaceAll("\\n", "\n"));
}