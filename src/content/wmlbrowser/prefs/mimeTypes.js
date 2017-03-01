/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is wmlbrowser.
 *
 * The Initial Developer of the Original Code is
 * Matthew Wilson <matthew@mjwilson.demon.co.uk>.
 * Portions created by the Initial Developer are Copyright (C) 2002
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const mimeTypes = "UMimTyp";

function areMimeTypesInstalled () {

    var RDFService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
        .getService(Components.interfaces.nsIRDFService);
    var fileLocator =
        Components.classes["@mozilla.org/file/directory_service;1"].getService()
            .QueryInterface(Components.interfaces.nsIProperties);
    var file = fileLocator.get(mimeTypes, Components.interfaces.nsIFile);
    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var fileHandler = ioService.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
    var mimeTypesDataSource = RDFService.GetDataSourceBlocking(fileHandler.getURLSpecFromFile(file));
    
    var about = RDFService.GetUnicodeResource ("urn:mimetype:text/vnd.wap.wml");

    var container = Components.classes["@mozilla.org/rdf/container;1"].createInstance();
    container = container.QueryInterface(Components.interfaces.nsIRDFContainer);

    var containerRes = RDFService.GetUnicodeResource("urn:mimetypes:root");
    container.Init(mimeTypesDataSource, containerRes);

    return (container.IndexOf(about) != -1);

}

function mimeTypesChanged (checkbox) {

    var newState = checkbox.checked;

    var logger = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
    try {
        var RDFService = Components.classes["@mozilla.org/rdf/rdf-service;1"]
            .getService(Components.interfaces.nsIRDFService);
        var mimeTypesDataSource = null;
        const mimeTypes = "UMimTyp";
        var fileLocator = Components.classes["@mozilla.org/file/directory_service;1"].getService();
        if (fileLocator)
            fileLocator = fileLocator.QueryInterface(Components.interfaces.nsIProperties);
        var file = fileLocator.get(mimeTypes, Components.interfaces.nsIFile);
        var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var fileHandler = ioService.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIFileProtocolHandler);
        mimeTypesDataSource = RDFService.GetDataSourceBlocking(fileHandler.getURLSpecFromFile(file));

        var about = RDFService.GetUnicodeResource ("urn:mimetype:text/vnd.wap.wml");

        // add the mime type to the MIME types seq
        var container = Components.classes["@mozilla.org/rdf/container;1"].createInstance();
        if (container) {
            container = container.QueryInterface(Components.interfaces.nsIRDFContainer);
            if (container) {

                var containerRes = RDFService.GetUnicodeResource("urn:mimetypes:root");
                container.Init(mimeTypesDataSource, containerRes);

                if (newState && container.IndexOf(about) == -1) {

                    container.AppendElement(about);

                    mimeTypesDataSource.Assert
                        (about,
                         RDFService.GetUnicodeResource ("http://home.netscape.com/NC-rdf#fileExtensions"),
                         RDFService.GetLiteral ("wml"),
                         true);

                    mimeTypesDataSource.Assert
                        (about,
                         RDFService.GetUnicodeResource ("http://home.netscape.com/NC-rdf#value"),
                         RDFService.GetLiteral ("text/vnd.wap.wml"),
                         true);

                    mimeTypesDataSource.Assert
                        (about,
                         RDFService.GetUnicodeResource ("http://home.netscape.com/NC-rdf#description"),
                         RDFService.GetLiteral ("Wireless Markup Language"),
                         true);

                } else if (!newState && container.IndexOf(about) != -1) {
                    container.RemoveElement (about, true);

                    mimeTypesDataSource.Unassert
                        (about,
                         RDFService.GetUnicodeResource ("http://home.netscape.com/NC-rdf#fileExtensions"),
                         RDFService.GetLiteral ("wml"));

                    mimeTypesDataSource.Unassert
                        (about,
                         RDFService.GetUnicodeResource ("http://home.netscape.com/NC-rdf#value"),
                         RDFService.GetLiteral ("text/vnd.wap.wml"));

                    mimeTypesDataSource.Unassert
                        (about,
                         RDFService.GetUnicodeResource ("http://home.netscape.com/NC-rdf#description"),
                         RDFService.GetLiteral ("Wireless Markup Language"));

                }

                var remoteDataSource = mimeTypesDataSource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
                if (remoteDataSource) {
                    remoteDataSource.Flush();
                } else {
                    logger.logStringMessage ("wmlbrowser browsing.js - oops, no remoteDataSource");
                }

            }
        }

    } catch (e) {
        window.alert ("Failed to change 'load .wml files' setting, please try again");
        logger.logStringMessage("wmlbrowser browsing.js, unexpected error " + e);
        return false;
    }

}
