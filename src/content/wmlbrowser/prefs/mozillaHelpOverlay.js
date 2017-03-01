var wmlbrowserOldDoHelpButton = doHelpButton;

function doHelpButton() {
  var subsrc = document.getElementById("panelFrame").getAttribute("src");
  if (subsrc == "chrome://wmlbrowser/content/prefs/browsing.xul") {
      const params = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
                               .createInstance(Components.interfaces.nsIDialogParamBlock);
      params.SetNumberStrings(2);
      params.SetString(0, "chrome://wmlbrowser/locale/help/help.rdf");
      params.SetString(1, "wmlbrowser-prefs");
      const ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                           .getService(Components.interfaces.nsIWindowWatcher);
      ww.openWindow(null, "chrome://help/content/help.xul", "_blank", "chrome,all,alwaysRaised,dialog=no", params);

  } else {
      wmlbrowserOldDoHelpButton();
  }
}
