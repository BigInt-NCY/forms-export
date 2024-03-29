// Smol
// BigInt
// December 16, 2019.


// Sample URL. Note that this must be authenticated with the current user.
var URL = "https://docs.google.com/forms/d/14cDFQuPr8haeKL497seyeUz2ysrEO5aiRnQHINqe-Kc/edit";

function onOpen(e) {
  FormApp.getUi()
      .createAddonMenu()
      .addItem('Export', 'showPopup')
      .addToUi();
}

//function onInstall(e) {
  //onOpen(e);
//}

/**
 * Opens a sidebar in the form containing the add-on's user interface for
 * configuring the notifications this add-on will produce.
 */
function showPopup() {
  var ui = HtmlService.createHtmlOutputFromFile('index')
      .setWidth(550)
      .setHeight(270);
  FormApp.getUi().showModalDialog(ui, 'Export Form');
}


/**
 * Converts the given form URL into a JSON object.
 */
function export(filename) {
  var form = FormApp.getActiveForm();
  var items = form.getItems();

  var result = {
    "metadata": getFormMetadata(form),
    "items": items.map(itemToObject),
    "count": items.length
  };

  Logger.log(JSON.stringify(result, null, 4));
  return JSON.stringify(result, null, 2);

//  var blob = new Utilities.newBlob(JSON.stringify(result));
  //google.script.run.saveAs(blob, 'test.json');
//  return ScriptApp.getService().getUrl();
//  return downloadFile(JSON.stringify(result), filename);
}

function doGet(){
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent("Test");
  output.downloadAsFile("Test.json");
  return output;
}

function downloadFile(content, filename){
  var output = ContentService.createTextOutput(content);
  output.setContent(content);
  output.setMimeType(ContentService.MimeType.JSON);
  output.downloadAsFile(filename + '.json');
  return output;
}

/**
 * Returns the form metadata object for the given Form object.
 * @param form: Form
 * @returns (Object) object of form metadata.
 */
function getFormMetadata(form) {
  return {
    "title": form.getTitle(),
    "id": form.getId(),
    "description": form.getDescription(),
    "publishedUrl": form.getPublishedUrl(),
    "editorEmails": form.getEditors().map(function(user) {return user.getEmail()}),
    "count": form.getItems().length,
    "confirmationMessage": form.getConfirmationMessage(),
    "customClosedFormMessage": form.getCustomClosedFormMessage()
  };
}

/**
 * Returns an Object for a given Item.
 * @param item: Item
 * @returns (Object) object for the given item.
 */
function itemToObject(item) {
  var data = {};

  data.type = item.getType().toString();

  // Downcast items to access type-specific properties

  var itemTypeConstructorName = snakeCaseToCamelCase("AS_" + item.getType().toString() + "_ITEM");
  Logger.log('itemTypeContrustorName [' + itemTypeConstructorName + ']');
  if (itemTypeConstructorName === 'asFileUploadItem')
    return null;

  var typedItem = item[itemTypeConstructorName]();

  //var imageItem = item.asImageItem();
//  Logger.log(imageItem);

  // Keys with a prefix of "get" have "get" stripped

  var getKeysRaw = Object.keys(typedItem).filter(function(s) {return s.indexOf("get") == 0});

  getKeysRaw.map(function(getKey) {
    var propName = getKey[3].toLowerCase() + getKey.substr(4);

    // Image data, choices, and type come in the form of objects / enums
    if (["image", "choices", "type", "alignment"].indexOf(propName) != -1) {return};

    // Skip feedback-related keys
    if ("getFeedbackForIncorrect".equals(getKey) || "getFeedbackForCorrect".equals(getKey)
      || "getGeneralFeedback".equals(getKey)) {return};

    Logger.log(getKey);
    var propValue = typedItem[getKey]();

    data[propName] = propValue;
  });

  // Bool keys are included as-is

  var boolKeys = Object.keys(typedItem).filter(function(s) {
    return (s.indexOf("is") == 0) || (s.indexOf("has") == 0) || (s.indexOf("includes") == 0);
  });

  boolKeys.map(function(boolKey) {
    var propName = boolKey;
    var propValue = typedItem[boolKey]();
    data[propName] = propValue;
  });

  // Handle image data and list choices

  switch (item.getType()) {
    case FormApp.ItemType.LIST:
    case FormApp.ItemType.CHECKBOX:
    case FormApp.ItemType.MULTIPLE_CHOICE:
      data.choices = typedItem.getChoices().map(function(choice) {
        return choice.getValue();
      });
      break;

    case FormApp.ItemType.IMAGE:
      data.alignment = typedItem.getAlignment().toString();

      if (item.getType() == FormApp.ItemType.VIDEO) {
        return;
      }

      var imageBlob = typedItem.getImage();

      data.imageBlob = {
        "dataAsString": imageBlob.getDataAsString(),
        "name": imageBlob.getName(),
        "isGoogleType": imageBlob.isGoogleType()
      };

      break;

    case FormApp.ItemType.PAGE_BREAK:
      data.pageNavigationType = typedItem.getPageNavigationType().toString();
      break;

    default:
      break;
  }

  // Have to do this because for some reason Google Scripts API doesn't have a
  // native VIDEO type
  if (item.getType().toString() === "VIDEO") {
    data.alignment = typedItem.getAlignment().toString();
  }

  return data;
}

/**
 * Converts a SNAKE_CASE string to a camelCase string.
 * @param s: string in snake_case
 * @returns (string) the camelCase version of that string
 */
function snakeCaseToCamelCase(s) {
  return s.toLowerCase().replace(/(\_\w)/g, function(m) {return m[1].toUpperCase();});
}
