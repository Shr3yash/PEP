define(['knockout', 'ojs/ojcontext', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlparamadapter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider',
  'ojs/ojdrawerpopup', 'ojs/ojmodule-element', 'ojs/ojknockout'],
function(ko, Context, moduleUtils, KnockoutTemplateUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ResponsiveUtils, ResponsiveKnockoutUtils, ArrayDataProvider) {

function ControllerViewModel() {
this.KnockoutTemplateUtils = KnockoutTemplateUtils;

this.manner = ko.observable('polite');
this.message = ko.observable();
const announcementHandler = (event) => {
    this.message(event.detail.message);
    this.manner(event.detail.manner);
};

document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

const smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
const mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

let navData = [
  { path: '', redirect: 'dashboard' },
  { path: 'dashboard', detail: { label: 'Dashboard', iconClass: 'oj-ux-ico-bar-chart' } },
  { path: 'incidents', detail: { label: 'Extra Graphs', iconClass: 'oj-ux-ico-fire' } },
  { path: 'customers', detail: { label: 'Extra Graphs', iconClass: 'oj-ux-ico-contact-group' } },
  { path: 'about', detail: { label: 'About', iconClass: 'oj-ux-ico-information-s' } }
];

let router = new CoreRouter(navData, {
  urlAdapter: new UrlParamAdapter()
});
router.sync();

this.moduleAdapter = new ModuleRouterAdapter(router);
this.selection = new KnockoutRouterAdapter(router);
this.navDataProvider = new ArrayDataProvider(navData.slice(1), {keyAttributes: "path"});

this.sideDrawerOn = ko.observable(false);

this.mdScreen.subscribe(() => { this.sideDrawerOn(false) });

this.toggleDrawer = () => {
  this.sideDrawerOn(!this.sideDrawerOn());
}

this.appName = ko.observable("Performance Evaluation & Prediction");
this.userLogin = ko.observable("demo@smail.com");

this.footerLinks = [
  {name: 'About Us', linkId: 'aboutOracle', linkTarget:'http://www.oracle.com/us/corporate/index.html#menu-about'},
  { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
  { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
  { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
  { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
];
}

Context.getPageContext().getBusyContext().applicationBootstrapComplete();

return new ControllerViewModel();
}
);
