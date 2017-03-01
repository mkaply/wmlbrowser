/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * The Original Code is the wmlbrowser extension.
 * 
 * The Initial Developer of the Original Code is Matthew Wilson
 * <matthew@mjwilson.demon.co.uk>. Portions created by the Initial Developer
 * are Copyright (C) 2004 the Initial Developer. All Rights Reserved.
 * 
 * Contributor(s): 
 *
 * This file contains the content handler for converting content of type
 * text/vnd.wap.wml (WMLStreamConverter)
 */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/debug.js");

/* components defined in this file */

const WMLSTREAM_CONVERT_CONVERSION =
    "?from=text/vnd.wap.wml&to=*/*";
const WMLSTREAM_CONVERTER_CONTRACTID =
    "@mozilla.org/streamconv;1" + WMLSTREAM_CONVERT_CONVERSION;
const WMLSTREAM_CONVERTER_CID =
    Components.ID("{51427b76-8626-4a72-bd5f-2ac0ce5d101a}");

function WMLStreamConverter ()
{
    this.logger = Components.classes['@mozilla.org/consoleservice;1']
        .getService(Components.interfaces.nsIConsoleService);
};

/* text/vnd.wap.wml -> text/html stream converter */
WMLStreamConverter.prototype = {
  classDescription: "WML to HTML stream converter",
  classID:          Components.ID("{51427b76-8626-4a72-bd5f-2ac0ce5d101a}"),
  contractID:       WMLSTREAM_CONVERTER_CONTRACTID,
  _xpcom_categories: [{
    // Each object in the array specifies the parameters to pass to
    // nsICategoryManager.addCategoryEntry(). 'true' is passed for
    // both aPersist and aReplace params.
    category: "@mozilla.org/streamconv;1",
    entry: WMLSTREAM_CONVERT_CONVERSION
  }],
  QueryInterface: XPCOMUtils.generateQI(
      [Components.interfaces.nsIStreamConverter,
       Components.interfaces.nsIStreamListener,
       Components.interfaces.nsIRequestObserver
       ])
};

// nsIRequestObserver methods
WMLStreamConverter.prototype.onStartRequest =
function (aRequest, aContext) {

    this.data = '';
    this.unencodeddata = '';
    this.uri = aRequest.QueryInterface (Components.interfaces.nsIChannel).URI.spec;

    // Sets the charset if it is available. (For documents loaded from the
    // filesystem, this is not set.)
    this.charset =
       aRequest.QueryInterface (Components.interfaces.nsIChannel)
           .contentCharset;

    this.channel = aRequest;
    this.channel.contentType = "application/xhtml+xml";
    // All our data will be coerced to UTF-8
    this.channel.contentCharset = "UTF-8";

    this.listener.onStartRequest (this.channel, aContext);

};

// Load the document to be used when our XSLT transformation terminates
WMLStreamConverter.prototype.getTransformFailureDocument =
function () {
    var failureDocLoad =
        Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Components.interfaces.nsIXMLHttpRequest);
    failureDocLoad.open ("GET", "chrome://wmlbrowser/content/transformFailed.xhtml", false); // synchronous load
    failureDocLoad.overrideMimeType("text/xml");
    failureDocLoad.send(undefined);
    return failureDocLoad.responseText;
}

/**
 * Return an XSLT processor object.
 */
WMLStreamConverter.prototype.getXSLTProcessor =
function () {
    // Find out what interface we need to use for document transformation
    // (earlier builds used text/xsl)
    var transformerType;
    if (Components.classes["@mozilla.org/document-transformer;1?type=xslt"]) {
        transformerType = "xslt";
    } else {
        transformerType = "text/xsl";
    }
    var processor = Components.classes["@mozilla.org/document-transformer;1?type=" + transformerType]
        .createInstance(Components.interfaces.nsIXSLTProcessor);
    return processor;
}

/**
 * Determine whether the provided document is an error document,
 * ie has been returned as the result of an XML parser error.
 * @param doc Document to check
 * @return true if the document is an error document
 */
WMLStreamConverter.prototype.isErrorDocument =
function (doc) {
    var roottag = doc.documentElement;
    return ((roottag.tagName == "parserError") ||
            (roottag.namespaceURI == "http://www.mozilla.org/newlayout/xml/parsererror.xml"));
}

/**
 * Serialize an XML document to a string.
 */
WMLStreamConverter.prototype.serializeToString =
function (doc) {
    var serializer =
	Components.classes["@mozilla.org/xmlextras/xmlserializer;1"]
	.createInstance (Components.interfaces.nsIDOMSerializer);

    // Serialize the provided document to XML.
    // This is a BIG HACK
    var str = Components.classes["@mozilla.org/supports-string;1"].
	createInstance(Components.interfaces.nsISupportsString);
    str.data = '';
    var outputStream = {
        write: function(buf, count) {
            str.data += buf.substring(0,count);
            return count;
        }
    };
    serializer.serializeToStream (doc, outputStream, "UTF-8");
    return str.data;
}

WMLStreamConverter.prototype.onStopRequest =
function (aRequest, aContext, aStatusCode) {

    var converter = Components
        .classes["@mozilla.org/intl/scriptableunicodeconverter"]
        .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    converter.charset = this.charset;

    try {
        this.data = converter.ConvertToUnicode (this.unencodeddata);
    } catch (failure) {
        this.logger.logStringMessage ("wmlbrowser: Failure converting unicode using charset " + this.charset);
        this.logger.logStringMessage (failure);
        this.data += this.unencodeddata;
    }
    //this.logger.logStringMessage (this.data);

    // Strip leading whitespace
    this.data = this.data.replace (/^\s+/,'');

    // Replace any external DTD declarations with an internal DTD subset
    this.data = this.data.replace
        (/<!DOCTYPE\s+wml\s+PUBLIC\s+['"].*?["']\s+["'][^<]*?['"]\s*>/,
         '<!DOCTYPE wml [ <!ENTITY quot "&#34;"> <!ENTITY apos "&#39;"> <!ENTITY nbsp  "&#160;"> <!ENTITY shy "&#173;"> ]>');

    //this.logger.logStringMessage (this.data);

    // Parse the content into an XMLDocument
    var parser =
        Components.classes['@mozilla.org/xmlextras/domparser;1']
             .getService(Components.interfaces.nsIDOMParser);
    var originalDoc = parser.parseFromString(this.data, "text/xml");

    // Determine whether there was an error parsing the document
    var error = this.isErrorDocument (originalDoc);
    // And choose a stylesheet accordingly
    var xslt = error ? "chrome://wmlbrowser/content/errors.xsl" :"chrome://wmlbrowser/content/wml.xsl";

    var processor = this.getXSLTProcessor();

    // Use an XMLHttpRequest object to load our own stylesheet.
    var styleLoad =
        Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Components.interfaces.nsIXMLHttpRequest);
    styleLoad.open ("GET", xslt, false); // synchronous load
    styleLoad.overrideMimeType("text/xml");
    styleLoad.send(undefined);

    var targetDocument;
    // Get the transformed document
    try {
        processor.importStylesheet (styleLoad.responseXML.documentElement);
        var transformedDocument = processor.transformToDocument (originalDoc);
        targetDocument = this.serializeToString (transformedDocument);
    } catch (e) {
        this.logger.logStringMessage (e);
        // If we couldn't perform the transformation then we probably
        // hit a termination message.
        targetDocument = this.getTransformFailureDocument();
    }

    // Bit of a hack for now, can we do this in XSLT?
    if (error) {
        targetDocument = targetDocument.replace (/Location: .+/, 'Location: ' + this.uri);
    }
    //this.logger.logStringMessage (targetDocument);

    var sis =
        Components.classes["@mozilla.org/io/string-input-stream;1"]
        .createInstance(Components.interfaces.nsIStringInputStream);
    sis.setData (targetDocument, targetDocument.length);

    // Pass the data to the main content listener
    this.listener.onDataAvailable (this.channel, aContext, sis, 0, targetDocument.length);

    this.listener.onStopRequest (this.channel, aContext, aStatusCode);

};

// nsIStreamListener methods
WMLStreamConverter.prototype.onDataAvailable =
function (aRequest, aContext, aInputStream, aOffset, aCount) {

    // TODO For more recent Mozilla versions, we can use the
    // 'convertFromByteArray' methods.  Creating a string first leaves us with
    // the risk of problems, eg a 0 byte indicating the end of a string
    var si = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance();
    si = si.QueryInterface(Components.interfaces.nsIScriptableInputStream);
    si.init(aInputStream);
    // This is basically a string containing a UTF-16 character for each
    // byte of the original data
    var unencoded = si.read (aCount);

    // Try and detect the XML encoding if declared in the file and not
    // already known. This will fail with UTF-16 etc I think.
    if ((this.charset == undefined || this.charset == '') && 
         unencoded.match (/<?xml\s+version\s*=\s*["']1.0['"]\s+encoding\s*=\s*["'](.*?)["']/)) {
        //this.logger.logStringMessage ("got encoding match " + RegExp.$1);

        this.charset = RegExp.$1;
    } else {
        //this.logger.logStringMessage ("No encoding match found (or already got charset: " + this.charset + ")");
    }

    // Default charset
    if (this.charset == undefined || this.charset == '') {
       this.charset = 'UTF-8';
    }

    this.unencodeddata += unencoded;
}

// nsIStreamConverter methods
// old name (before bug 242184)...
WMLStreamConverter.prototype.AsyncConvertData =
function (aFromType, aToType, aListener, aCtxt) {
    this.asyncConvertData (aFromType, aToType, aListener, aCtxt);
}

// renamed to...
WMLStreamConverter.prototype.asyncConvertData =
function (aFromType, aToType, aListener, aCtxt) {
    // Store the listener passed to us
    this.listener = aListener;
}

// Old name (before bug 242184):
WMLStreamConverter.prototype.Convert =
function (aFromStream, aFromType, aToType, aCtxt) {
    return this.convert (aFromStream, aFromType, aToType, aCtxt);
}

// renamed to...
WMLStreamConverter.prototype.convert =
function (aFromStream, aFromType, aToType, aCtxt) {
    return aFromStream;
}

let WMLStreamConverterFactory = {
  createInstance: function (outer, iid) {
    if (outer != null)
      throw Cr.NS_ERROR_NO_AGGREGATION;
    return new WMLStreamConverter().QueryInterface(iid);
  }
};

let registrar = Components.manager.QueryInterface(Components.interfaces.nsIComponentRegistrar);
if (registrar.isContractIDRegistered(WMLSTREAM_CONVERTER_CONTRACTID) == false) {
	registrar.registerFactory(
		WMLSTREAM_CONVERTER_CID,
		"WML to HTML stream converter",
		WMLSTREAM_CONVERTER_CONTRACTID,
		WMLStreamConverterFactory
	);

	var catman = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
	catman.addCategoryEntry("@mozilla.org/streamconv;1",
													WMLSTREAM_CONVERT_CONVERSION,
													"WML to HTML stream converter",
													true, true);
}
