<?xml version="1.0" encoding="UTF-8" ?>
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
   - The Original Code is XSL transformation for Wireless Markup Language
   -
   - Contributor(s):
   -   Raoul Nakhmanson-Kulish <manko@zhurnal.ru>
   -   Matthew Wilson <matthew@mjwilson.demon.co.uk>
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
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    version="1.0" xmlns="http://www.w3.org/1999/xhtml">

  <xsl:output method="xml" version="1.0" encoding="UTF-8"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" />

  <xsl:template match="/">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="wml">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
          <title>
              <xsl:for-each select="card[@title]">
                  <xsl:value-of select="@title"/>
                  <xsl:if test="position() != last()">
                      /
                  </xsl:if>
              </xsl:for-each>
              (wmlbrowser)
          </title>
        <xsl:apply-templates select="head" />
        <xsl:apply-templates select="card[@ontimer]" mode="redirect" />
        <script type="text/javascript" src="chrome://wmlbrowser/content/wml.js">// hack</script>
        <link href="chrome://wmlbrowser/content/wml.css" rel="stylesheet" type="text/css" />
      </head>
      <body onload="nsWMLOnLoad()">
          <noscript>
              <div class="critical">
                  Please enable Javascript to allow the full functionality of wmlbrowser to work.
              </div>
        </noscript>
        <xsl:apply-templates select="card" />
      </body>
    </html>
  </xsl:template>

  <xsl:template match="head">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="meta">
    <meta>
      <xsl:for-each select="@name | @http-equiv | @content">
        <xsl:copy />
      </xsl:for-each>
    </meta>
  </xsl:template>

  <xsl:template match="card" mode="redirect">
  <!-- emulation of redirecting cards -->
   <xsl:if test="timer/@value != 0">
    <xsl:if test="substring(@ontimer,1,2)!='#'">
      <xsl:element name="meta">
        <xsl:attribute name="http-equiv">Refresh</xsl:attribute>
        <xsl:attribute name="content"><xsl:value-of
            select="timer/@value div 10" />; URL=<xsl:value-of
            select="@ontimer" />
        </xsl:attribute>
      </xsl:element>
    </xsl:if>
   </xsl:if>
  </xsl:template>

  <xsl:template name="extbutton">
  <!-- buttons to redirect on another page -->
    <xsl:param name="type" />
    <xsl:param name="label" />
    <button class="dobutton">
      <xsl:choose>
        <xsl:when test="$type='accept'">
          <xsl:attribute name="type">submit</xsl:attribute>
          <span class="sign accept">V</span>
        </xsl:when>

        <xsl:when test="$type='prev'">
          <xsl:attribute name="type">submit</xsl:attribute>
          <span class="sign prev">&#x25C4;</span>
        </xsl:when>

        <xsl:when test="$type='back'">
          <xsl:attribute name="type">button</xsl:attribute>
          <xsl:attribute name="onclick">history.back()</xsl:attribute>
          <span class="sign prev">&#x25C4;</span>
        </xsl:when>

        <xsl:when test="$type='help'">
          <xsl:attribute name="type">submit</xsl:attribute>
          <span class="sign help">?</span>
        </xsl:when>

        <xsl:when test="$type='reset'">
          <xsl:attribute name="type">reset</xsl:attribute>
          <xsl:attribute name="onclick">nsWMLresetForms();</xsl:attribute>
          <span class="sign reset">&#x25A0;</span>
        </xsl:when>

        <xsl:when test="$type='refresh'">
          <xsl:attribute name="type">button</xsl:attribute>
          <xsl:attribute name="onclick">location.reload(true);</xsl:attribute>
          <span class="sign refresh">&#x21C5;</span>
        </xsl:when>

        <xsl:when test="$type='options'">
          <xsl:attribute name="type">submit</xsl:attribute>
          <span class="sign options">&#x2026;</span>
        </xsl:when>

        <xsl:when test="$type='delete'">
          <xsl:attribute name="type">submit</xsl:attribute>
          <span class="sign delete">&#x2716;</span>
        </xsl:when>

        <xsl:otherwise>
          <xsl:attribute name="type">submit</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:value-of select="concat('&#xA0;',$label)" />
    </button>
  </xsl:template>

  <xsl:template name="intbutton">
  <!-- buttons to navigate between cards on current page -->
    <xsl:param name="type" />
    <xsl:param name="label" />
    <xsl:param name="href" />
    <button class="dobutton" type="button" onclick="location.href='{$href}'">
      <xsl:choose>
        <xsl:when test="$type='accept'">
          <span class="sign accept">V</span>
        </xsl:when>

        <xsl:when test="$type='prev'">
          <span class="sign prev">&#x25C4;</span>
        </xsl:when>

        <xsl:when test="$type='back'">
          <span class="sign prev">&#x25C4;</span>
        </xsl:when>

        <xsl:when test="$type='help'">
          <span class="sign help">?</span>
        </xsl:when>

        <xsl:when test="$type='reset'">
          <span class="sign reset">&#x25A0;</span>
        </xsl:when>

        <xsl:when test="$type='options'">
          <span class="sign options">&#x2026;</span>
        </xsl:when>

        <xsl:when test="$type='delete'">
          <span class="sign delete">&#x2716;</span>
        </xsl:when>
      </xsl:choose>
      <xsl:value-of select="concat('&#xA0;',$label)" />
    </button>
  </xsl:template>

  <xsl:template match="do" mode="do">
    <xsl:choose>
      <xsl:when test="go">
        <xsl:apply-templates select="go/setvar" mode="setvar" />
        <xsl:choose>
          <xsl:when test="go[substring(@href,1,2)!='#']">
            <form action="{go/@href}" origaction="{go/@href}"
                method="{go/@method}"
                onsubmit="return nsWMLcheckForm(this);">
              <xsl:apply-templates select="go/postfield" mode="form" />
              <xsl:call-template name="extbutton">
                <xsl:with-param name="type" select="@type" />
                <xsl:with-param name="label" select="@label" />
              </xsl:call-template>
            </form>
          </xsl:when>

          <xsl:otherwise>
            <xsl:call-template name="intbutton">
              <xsl:with-param name="type" select="@type" />
              <xsl:with-param name="label" select="@label" />
              <xsl:with-param name="href" select="go/@href" />
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>

      <xsl:otherwise>
        <xsl:if test="./prev">
          <xsl:call-template name="extbutton">
            <xsl:with-param name="type" select="'back'" />
            <xsl:with-param name="label" select="@label" />
          </xsl:call-template>
        </xsl:if>

        <xsl:if test="@type='reset'">
          <xsl:call-template name="extbutton">
            <xsl:with-param name="type" select="'reset'" />
            <xsl:with-param name="label" select="@label" />
          </xsl:call-template>
        </xsl:if>

        <xsl:if test="./refresh">
          <xsl:call-template name="extbutton">
            <xsl:with-param name="type" select="'refresh'" />
            <xsl:with-param name="label" select="@label" />
          </xsl:call-template>
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="card">
    <div>
      <xsl:if test="@id"><xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute></xsl:if>
      <xsl:attribute name="class">card</xsl:attribute>
      <xsl:if test="@title!=''">
        <h1><xsl:value-of select="@title" /></h1>
      </xsl:if>
      <div class="innercard">
        <xsl:if test="@onenterforward">
            <form action="{@onenterforward}" origaction="{@onenterforward}" id="{generate-id(..)}"
                onsubmit="return nsWMLcheckForm(this);">
                <input type="submit" value="onenterforward" style="font-style: italic" title="Use this to simulate navigating to this card"></input>
            </form>
        </xsl:if>
        <xsl:if test="@onenterbackward">
            <form action="{@onenterbackward}" origaction="{@onenterbackward}" id="{generate-id(..)}"
                onsubmit="return nsWMLcheckForm(this);">
                <input type="submit" value="onenterbackward" style="font-style: italic" title="Use this to simulate navigating to this card"></input>
            </form>
        </xsl:if>
        <xsl:apply-templates />
      </div>
      <xsl:if test=".//do | ../template/do">
        <div class="do">
          <xsl:variable name="card" select="." />
          <xsl:apply-templates select=".//do" mode="do" />
          <xsl:for-each select="../template/do">
            <xsl:variable name="curname" select="@name" />
            <xsl:if test="not($card/do[@name=$curname])">
              <xsl:apply-templates select="." mode="do" />
            </xsl:if>
          </xsl:for-each>
        </div>
      </xsl:if>
    </div>
  </xsl:template>

  <xsl:template match="onevent">
      <xsl:choose>
          <xsl:when test="@type = 'ontimer'">
              <xsl:choose>
                  <xsl:when test="go">
                      <form action="{go/@href}" origaction="{go/@href}" id="{generate-id(..)}"
                          onsubmit="return nsWMLcheckForm(this);">
                          <xsl:for-each select="go/@method | go/@accept-charset">
                              <xsl:copy />
                          </xsl:for-each>
                          <xsl:apply-templates select="go" mode="form"/>
                      </form>
                      <script type="text/javascript">
                          nsWMLRegisterTimer('go' ,'<xsl:value-of select="generate-id(..)" />');
                      </script>
                  </xsl:when>
                  <xsl:otherwise>
                      <p class="warning">Warning: this WML page uses a construct 'onevent' with
                              an action '<xsl:value-of select="local-name(./*[1])"/>' not recognised by wmlbrowser</p>
                  </xsl:otherwise>
              </xsl:choose>
          </xsl:when>
          <xsl:when test="@type = 'onenterforward' or @type='onenterbackward'">
              <xsl:choose>
                  <xsl:when test="go">
                      <form action="{go/@href}" origaction="{go/@href}" id="{generate-id(..)}"
                          onsubmit="return nsWMLcheckForm(this);">
                          <xsl:for-each select="go/@method | go/@accept-charset">
                              <xsl:copy />
                          </xsl:for-each>
                          <xsl:apply-templates select="go" mode="form"/>
                          <input type="submit" value="{ @type }" style="font-style: italic" title="Use this to simulate navigating to this card"></input>
                      </form>
                  </xsl:when>
                  <xsl:otherwise>
                      <p class="warning">Warning: this WML page uses a construct 'onevent' with
                              an action '<xsl:value-of select="local-name(./*[1])"/>' not recognised by wmlbrowser</p>
                  </xsl:otherwise>
              </xsl:choose>
          </xsl:when>
          <xsl:otherwise>
              <p class="warning">Warning: this WML page uses a construct 'onevent' with type
              '<xsl:value-of select="@type"/>' not supported by wmlbrowser</p>
          </xsl:otherwise>
      </xsl:choose>
      <!-- onevent has type="onpick", "onenterforward",
           "onenterbackward", "ontimer" -->
  </xsl:template>

  <xsl:template match="timer">
      <script type="text/javascript">nsWMLStartTimer (<xsl:value-of select="@value"/>);</script>
  </xsl:template>

  <xsl:template match="fieldset">
    <fieldset>
      <xsl:for-each select="@id">
        <xsl:copy />
      </xsl:for-each>

      <xsl:if test="@title">
        <legend><xsl:value-of select="@title" /></legend>
      </xsl:if>

      <xsl:apply-templates />
    </fieldset>
  </xsl:template>

  <xsl:template match="a">
    <a onclick="return nsWMLcheckLink(this);">
      <xsl:for-each select="@href | @title | @accesskey">
        <xsl:copy />
      </xsl:for-each>
      
      <xsl:apply-templates />
    </a>
  </xsl:template>

  <xsl:template match="p">
    <p>
      <xsl:for-each select="@align">
        <xsl:copy />
      </xsl:for-each>

      <xsl:if test="@mode='nowrap'">
        <xsl:attribute name="class">nowrap</xsl:attribute>
      </xsl:if>

      <xsl:apply-templates />
    </p>
  </xsl:template>

  <xsl:template match="br">
    <br />
  </xsl:template>

  <!-- Mozilla XSLT bug: because the HTML img element is empty,
       we can't use <img> here, we have to use <xsl:element name="img">
       otherwise the transformation gets lost -->
  <xsl:template match="img">
      <xsl:element name="img">
      <xsl:attribute name="title">
        <xsl:value-of select="@alt"/>
      </xsl:attribute>
      <xsl:for-each select="@src | @alt | @vspace | @hspace | @align | @width | @height">
        <xsl:copy />
      </xsl:for-each>
    </xsl:element>
  </xsl:template>

  <xsl:template match="table">
    <table>
      <xsl:apply-templates />
    </table>
  </xsl:template>

  <xsl:template match="tr">
    <tr>
      <xsl:apply-templates />
    </tr>
  </xsl:template>

  <xsl:template match="td">
    <td>
      <xsl:apply-templates />
    </td>
  </xsl:template>

  <xsl:template match="em">
    <em>
      <xsl:apply-templates />
    </em>
  </xsl:template>

  <xsl:template match="strong">
    <strong>
      <xsl:apply-templates />
    </strong>
  </xsl:template>

  <xsl:template match="big">
    <big>
      <xsl:apply-templates />
    </big>
  </xsl:template>

  <xsl:template match="small">
    <small>
      <xsl:apply-templates />
    </small>
  </xsl:template>

  <xsl:template match="pre">
    <pre>
      <xsl:apply-templates />
    </pre>
  </xsl:template>

  <xsl:template match="b">
    <span class="b">
      <xsl:apply-templates />
    </span>
  </xsl:template>

  <xsl:template match="i">
    <span class="i">
      <xsl:apply-templates />
    </span>
  </xsl:template>

  <xsl:template match="u">
    <span class="u">
      <xsl:apply-templates />
    </span>
  </xsl:template>

  <xsl:template match="anchor[not(child::go)]">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="prev">
     <xsl:call-template name="extbutton">
        <xsl:with-param name="type" select="'back'" />
        <xsl:with-param name="label" select="'Back'" />
     </xsl:call-template>
  </xsl:template>

  <xsl:template match="anchor[./go]">
    <xsl:apply-templates select="go/setvar" mode="setvar" />
    <form action="{go/@href}" origaction="{go/@href}"
          onsubmit="return nsWMLcheckForm(this);">
      <xsl:for-each select="go/@method | go/@accept-charset">
        <xsl:copy />
      </xsl:for-each>

      <xsl:apply-templates select="go" mode="form" />

      <button type="submit">
        <xsl:for-each select="@accesskey">
          <xsl:copy />
        </xsl:for-each>

        <xsl:apply-templates select="." mode="submit" />
      </button>
    </form>
  </xsl:template>

  <xsl:template match="anchor" mode="submit">
    <xsl:apply-templates select="text() | *[name()!='go']" />
  </xsl:template>

  <xsl:template match="go" mode="form">
    <xsl:apply-templates select="postfield" mode="form" />
  </xsl:template>

  <xsl:template match="postfield" mode="form">
    <input type="hidden" name="{@name}" value="{@value}" origvalue="{@value}"/>
  </xsl:template>

  <xsl:template match="setvar[name(..)!='go']">
    <input type="hidden" id="{@name}" value="{@value}" />
  </xsl:template>

  <xsl:template match="setvar" mode="setvar">
    <input type="hidden" id="{@name}" value="{@value}" />
  </xsl:template>

  <!-- Mozilla XSLT bug: because the HTML input element is empty,
       we can't use <input> here, we have to use <xsl:element name="input">
       otherwise the transformation gets lost -->
  <xsl:template match="input">
      <xsl:element name="input">
          <xsl:attribute name="id">__wmlbrowser_<xsl:value-of select="@name"/></xsl:attribute>
          <xsl:for-each select="@name | @type | @value | @size | @maxlength | @tabindex | @title | @accesskey">
              <xsl:copy />
          </xsl:for-each>
      </xsl:element>
  </xsl:template>

  <xsl:template match="select">
    <select onchange="nsWMLcheckSelect(this);">
      <xsl:attribute name="id">__wmlbrowser_<xsl:value-of select="@name"/></xsl:attribute>
      <xsl:for-each select="@tabindex | @title | @accesskey">
        <xsl:copy />
      </xsl:for-each>

      <xsl:if test="@multiple='true'">
        <xsl:attribute name="multiple">multiple</xsl:attribute>
      </xsl:if>

      <xsl:for-each select=".//option">
        <xsl:variable name="ivalue"
            select="concat(',',normalize-space(ancestor::select/@ivalue),',')" />
        <xsl:variable name="pos" select="position()" />
        <option>
          <xsl:for-each select="@value | @title">
            <xsl:copy />
          </xsl:for-each>
          <xsl:if test="@onpick">
            <xsl:attribute name="onclick">location.href = nsWMLreplaceValues ("<xsl:value-of select="@onpick" />", "href")</xsl:attribute>
          </xsl:if>
          <xsl:if test="contains($ivalue,concat(',',$pos,',')) or
                        contains($ivalue,concat(', ',$pos,',')) or
                        contains($ivalue,concat(',',$pos,' ,')) or
                        contains($ivalue,concat(', ',$pos,' ,'))">
            <xsl:attribute name="selected">selected</xsl:attribute>
          </xsl:if>
          <xsl:apply-templates />
        </option>
      </xsl:for-each>
    </select>
    <xsl:if test="@iname">
      <input type="hidden" class="ivalue" id="{@iname}" value="{@ivalue}" />
      <!-- emulation of WML-specific parameter "iname" in <select> -->
    </xsl:if>
  </xsl:template>
</xsl:stylesheet>
