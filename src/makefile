COMPRESS = perl zip.pl

xpi: versioncheck
	mkdir ../downloads
	$(COMPRESS) ../downloads/wmlbrowser-latest.xpi content locale skin components/*.js install.rdf chrome.manifest defaults/preferences/prefs.js

versioncheck:
	INSTALL_RDF=`perl -n -e 'print $$1 if /const myProductRegVersion = "(.*)";/' install.js` ;\
	BROWSING_XUL=`perl -n -e 'print $$1 if /headertitle="wmlbrowser v(.*)"/' content/wmlbrowser/prefs/browsing.xul` ;\
        perl -e "die 'Version incompatibility $$INSTALL_RDF/$$BROWSING_XUL' unless $$INSTALL_RDF eq $$BROWSING_XUL"

hash: xpi
	shasum -b -a 256 ../downloads/wmlbrowser-latest.xpi
