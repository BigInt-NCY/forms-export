# forms-export
Google Apps Script for convert Google Forms to JSON

/!\ Uses source code from the repository : https://github.com/stevenschmatz/export-google-form

# Usage

## Installation

In order to use this package, you will need to install it first. To do it, download the files of this repo by cloned it or download the zip file. Go to your Google Forms, click on the bullets point (next to the send button) and select **Scripts editor**. You should be redirect to another tab, copy and paste the files in the editor, deploy the menu **execute** and choose **Test as a complementary addon**. From the modal, in the section **Configure new test**, choose **Install and activate**, your Google Forms and click on Save. Above select the document previously chosen et click on **Test**.

## Usage

From your Google Form, Click on **Export form** by clicking first on the addon button. Choose **Export** from the list and click **Save**.

/!\ The process can be longer than expected. Please wait.

When the process succeed, the JSON displays inside the textarea. You can copy it.

# Known problems

- The script cannot exports uploaded file, image or video due to a lack of the Google Script API.
- The script cannot create and download a JSON file, you have to copy the JSON from textarea.
