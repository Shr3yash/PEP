define(['../accUtils', 'knockout'], function(accUtils, ko) {
  function DashboardViewModel() {
      // Observable to control button's disabled state
      this.disableControls = ko.observable(false);

      // ViewModel lifecycle methods
      this.connected = () => {
          accUtils.announce('Dashboard page loaded.', 'assertive');
          document.title = "Dashboard";
      };

      this.disconnected = () => {
          // Implement if needed
      };

      this.transitionCompleted = () => {
          // Implement if needed
      };

      // Example: toggle the button state
      this.toggleButton = () => {
          this.disableControls(!this.disableControls()); // Toggles between true and false
      };
  }

  return DashboardViewModel;
});
