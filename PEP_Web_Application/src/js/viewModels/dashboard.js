define([
  "require",
  "exports",
  "knockout",
  "ojs/ojbootstrap",
  "ojs/ojarraydataprovider",
  "ojs/ojknockout",
  "ojs/ojchart",
  "text!../data/quarterDataDemo.json",
  // "ojs/ojknockout", "ojs/ojchart", "jet-composites/demo-chart-orientation-control/loader"
], function (require, exports, ko, ojbootstrap_1, ArrayDataProvider, quarterData) {
  "use strict";
  
  class DashboardViewModel {
      constructor() {
          this.disableControls = ko.observable(false);
          this.orientationValue = ko.observable('vertical');
          
          try {
            const parsedData = JSON.parse(quarterData);
            this.dataProvider = new ArrayDataProvider(parsedData, {
              keyAttributes: 'id'
            });
          } catch (error) {
            console.error("Error parsing JSON data:", error);
          }
        }
    

      connected() {
          ojbootstrap_1.whenDocumentReady().then(() => {
              ko.applyBindings(this, document.getElementById('chart-container'));
              accUtils.announce('Dashboard page loaded.', 'assertive');
              document.title = "Dashboard";
          });
      }

      disconnected() {
      }

      transitionCompleted() {
      }

      toggleButton() {
          this.disableControls(!this.disableControls());
      }
  }
  
  return DashboardViewModel;
});
