define([
  "require",
  "exports",
  "knockout",
  "ojs/ojbootstrap",
  "ojs/ojarraydataprovider",
  "ojs/ojknockout",
  "ojs/ojchart",
  "text!../data/quarterDataDemo.json",  // Updated path to JSON file
  // "jet-composites/demo-chart-orientation-control/loader"
], function (require, exports, ko, ojbootstrap_1, ArrayDataProvider, quarterData) {
  "use strict";
  
  class DashboardViewModel {
      constructor() {
          // Existing ViewModel properties and methods
          this.disableControls = ko.observable(false);

          // Chart-related properties
          this.orientationValue = ko.observable('vertical');
          // this.dataProvider = new ArrayDataProvider(JSON.parse(quarterData), {
          //     keyAttributes: 'id'
          // });
      }

      connected() {
          ojbootstrap_1.whenDocumentReady().then(() => {
              ko.applyBindings(this, document.getElementById('chart-container'));
              accUtils.announce('Dashboard page loaded.', 'assertive');
              document.title = "Dashboard";
          });
      }

      disconnected() {
          // Implement if needed
      }

      transitionCompleted() {
          // Implement if needed
      }

      toggleButton() {
          this.disableControls(!this.disableControls());
      }
  }
  
  return DashboardViewModel;
});
