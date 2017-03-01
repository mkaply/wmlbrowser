<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html [
  <!ENTITY % htmlDTD
    PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
    "DTD/xhtml1-strict.dtd">
  %htmlDTD;
  <!ENTITY % netErrorDTD
    SYSTEM "chrome://global/locale/netError.dtd">
  %netErrorDTD;
  <!ENTITY % globalDTD
    SYSTEM "chrome://global/locale/global.dtd">
  %globalDTD;
  <!ENTITY % wmlbrowserDTD
    SYSTEM "chrome://wmlbrowser/locale/errors.dtd">
  %wmlbrowserDTD;
]>
<!-- ***** BEGIN LICENSE BLOCK *****
   - Version: MPL 1.1/GPL 2.0/LGPL 2.1
   -
   - The contents of this file are subject to the Mozilla Public License Version
   - 1.1 (the "License"); you may not use this file except in compliance with
   - the License. You may obtain a copy of the License at
   - http://www.mozilla.org/MPL/
   -
   - Software distributed under the License is distributed on an "AS IS" basis,
   - WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
   - for the specific language governing rights and limitations under the
   - License.
   -
   - The Original Code is mozilla.org code.
   -
   - The Initial Developer of the Original Code is
   - Netscape Communications Corporation.
   - Portions created by the Initial Developer are Copyright (C) 1998
   - the Initial Developer. All Rights Reserved.
   -
   - Contributor(s):
   -   Adam Lock <adamlock@netscape.com>
   -   William R. Price <wrprice@alumni.rice.edu>
   -   Henrik Skupin <mozilla@hskupin.info>
   -   Jeff Walden <jwalden+code@mit.edu>
   -
   - Contributor(s):
   -   Matthew Wilson <matthew@mjwilson.demon.co.uk> (rework for use in wmlbrowser)
   -
   - Alternatively, the contents of this file may be used under the terms of
   - either the GNU General Public License Version 2 or later (the "GPL"), or
   - the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
   - in which case the provisions of the GPL or the LGPL are applicable instead
   - of those above. If you wish to allow use of your version of this file only
   - under the terms of either the GPL or the LGPL, and not to allow others to
   - use your version of this file under the terms of the MPL, indicate your
   - decision by deleting the provisions above and replace them with the notice
   - and other provisions required by the LGPL or the GPL. If you do not delete
   - the provisions above, a recipient may use your version of this file under
   - the terms of any one of the MPL, the GPL or the LGPL.
   -
   - ***** END LICENSE BLOCK ***** -->
<xsl:stylesheet version="1.0"
       xmlns="http://www.w3.org/1999/xhtml"
       xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
       xmlns:error="http://www.mozilla.org/newlayout/xml/parsererror.xml">

  <xsl:output method="xml" version="1.0" encoding="UTF-8"
    doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
    doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" />

  <xsl:template match="/">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>&loadError.label;</title>
    <link type="text/css" rel="stylesheet" href="chrome://wmlbrowser/content/errors.css"/>
    <link rel="stylesheet" href="chrome://global/skin/netError.css" type="text/css" media="all" />
    <!-- XXX this needs to be themeable -->
    <link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAICSURBVHjaYvz//z8DJQAggJhwiDPvnmlzc2aR0O+JGezt+AwACCCsBhxfYhn59N41FWtXIxZOLu70niRGXVwGAAQQNgNYHj96O8HaWYdJW5ubwd4/mI2Ng7sblwEAAYRhwMm1URk/vn4SUNWVYGD8+YZBXZOZm5OLzRjoCmNsBgAEEKoBN82Y7l851GLrqMjM8Oc7A8O/3wwMP54wuAQFCXNycUzGZgBAAKEYcOaKZO2/f//5FbUVgBrfMoRVcgHpNwyKGjKMXDwCan0prFboBgAEELIBzDcvXyy2cVZhYPj9GWj7H4jo/38MDJ9OMDj7O/KzsjH3oxsAEEBwA/bNNipiZf7FI6cqwcDw8x2qqp8fGORUpVn4BEXlgGHhhCwFEEAwA9gfP3hdZ+Oizcjw+wvCdjgAuuLrFQbXIH9hTm7uqcgyAAEENuD4ctcebm5mbikFYRTbV7V/Q6j88Z5BSuY7q4CQgAjQFR4wYYAAAhtw89L5ZFsnRaDtn4CW/YXrAQcisit+PGVwDgrnZ2NnnwATBQggpsNLvGYLCAmxi8tLARWg+h3FBVBXSEj/ZZWQkRcCuiIQJAQQQCyvnj5KMDTkZ2JgYmRg4FchnHv+vmEwttLmeXT3VjKQtx4ggFgk5TXebV63UfT3ijOMxOZAVlZWdiB1EMQGCCBGSrMzQIABAFR3kRM3KggZAAAAAElFTkSuQmCC" />

    <script type="application/x-javascript"><![CDATA[
        function showErrors () {
            document.getElementById ("errorson").setAttribute ("style", "display: block");
            document.getElementById ("errorsoff").setAttribute ("style", "display: none");
        }
        function hideErrors () {
            document.getElementById ("errorson").setAttribute ("style", "display: none");
            document.getElementById ("errorsoff").setAttribute ("style", "display: block");
        }
    ]]></script>
  </head>

  <body onload="hideErrors()">

    <!-- PAGE CONTAINER (for styling purposes only) -->
    <div id="errorPageContainer">
    
      <!-- Error Title -->
      <div id="errorTitle">
        <h1 id="errorTitleText">&errorTitle;</h1>
      </div>
      
      <!-- LONG CONTENT (the section most likely to require scrolling) -->
      <div id="errorLongContent">
      
        <!-- Short Description -->
        <div id="errorShortDesc">
            <p id="errorShortDescText">&shortErrorText;</p>
        </div>

        <!-- Long Description -->
        <div id="errorLongDesc">
            <p>&longErrorText;</p>
            <div id="errorsoff" style="display: none">
                <p><button onclick="showErrors();">&showDetails;</button></p>
            </div>
            <div id="errorson" style="display: none">
                <p><button onclick="hideErrors()">&hideDetails;</button></p>
                <xsl:apply-templates select="error:parsererror"/>
            </div>
            <noscript>
                <xsl:apply-templates select="error:parsererror"/>
            </noscript>
        </div>

      </div>

    </div>

  </body>
</html>
  </xsl:template>

  <xsl:template match="error:parsererror">
      <p class="error"><xsl:apply-templates /></p>
  </xsl:template>

  <xsl:template match="error:sourcetext">
      <pre class="source"><xsl:apply-templates /></pre>
  </xsl:template>

</xsl:stylesheet>
