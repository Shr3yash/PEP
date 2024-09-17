define([
  "require",
  "exports",
  "knockout",
  "ojs/ojbootstrap",
  "ojs/ojarraydataprovider",
  "ojs/ojchart",
  "text!../data/quarterDataDemo.json",
  "text!../quarterDataDemo.json",
  "ojs/ojinputtext"
  // "text!../sample.txt",
  
], function (require, exports, ko, ojbootstrap_1, ArrayDataProvider, quarterData, sampleText) {
  function DashboardViewModel(context) {
    this.processInput = ko.observable('');
    this.endProcessInput = ko.observable('');
    this.loadInput = ko.observable('');
    this.filePath = ko.observable('');

    console.log("Sample text:", sampleText);
    if (sampleText) {
      try {
        const parsedData = JSON.parse(sampleText);
        this.dataProvider = new ArrayDataProvider(parsedData, {
          keyAttributes: 'id'
        });
      } catch (error) {
        console.error("Error parsing JSON data:", error);
      }
    } else {
      console.error("quarterData is undefined or not loaded. Using fallback data.");
      const fallbackData = [
        {
          "id": 0,
          "series": "Series 1",
          "quarter": "Q1",
          "value": 74
        },
        {
          "id": 1,
          "series": "Series 1",
          "quarter": "Q2",
          "value": 42
        },
        {
          "id": 2,
          "series": "Series 1",
          "quarter": "Q3",
          "value": 70
        },
        {
          "id": 3,
          "series": "Series 1",
          "quarter": "Q4",
          "value": 46
        },
      ];
      this.dataProvider = new ArrayDataProvider(fallbackData, {
        keyAttributes: 'id'
      });
    }
    this.disableControls = ko.observable(false);
    this.orientationValue = ko.observable('vertical');
    console.log("Loaded quarterData:", sampleText);
    console.log("Loaded quarterData:", sampleText);  // Should print raw JSON string
    console.log("Type of quarterData:", typeof sampleText);  // Should print 'string'

    

 // Method to handle file selection
 this.handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    this.filePath(file.name); // Get the file name and set it to observable
  }
};

this.connected = () => {
  ojbootstrap_1.whenDocumentReady().then(() => {
    document.title = "PEP Dashboard";
    // Attach the file input event listener
    document.getElementById('fileInput').addEventListener('change', this.handleFileSelect.bind(this));
  });
};

    this.disconnected = () => {
      // Implement any cleanup if necessary
    };

    this.transitionCompleted = () => {
      // Handle any post-transition logic
    };

    this.toggleButton = () => {
      this.disableControls(!this.disableControls());
    };
  }

  return DashboardViewModel;
});
