COMPRESS = perl zip.pl

xpi: chrome versioncheck
	$(COMPRESS) chrome/wmlbrowser.jar \
        	`find content/wmlbrowser -name CVS -prune -o -name '*.bak' -prune -o -name jsunit -prune -o -name testWml.js.html -prune -o -name .cvsignore -prune -o -name '.#*' -prune -o -type f -print` \
		`find locale/ -name CVS -prune -o -name '*.bak' -prune -o -type f -print` \
		`find skin/ -name CVS -prune -o -name Thumbs.db -prune -o -name '*.bak' -prune -o -type f -print`
	$(COMPRESS) ../downloads/wmlbrowser-latest.xpi install.js chrome/wmlbrowser.jar components/*.js install.rdf chrome.manifest defaults/preferences/prefs.js

chrome:
	mkdir chrome

versioncheck:
	INSTALL_JS=`perl -n -e 'print $$1 if /<em:version>(.*)<\/em:version>/' install.rdf` ;\
	INSTALL_RDF=`perl -n -e 'print $$1 if /const myProductRegVersion = "(.*)";/' install.js` ;\
	BROWSING_XUL=`perl -n -e 'print $$1 if /headertitle="wmlbrowser v(.*)"/' content/wmlbrowser/prefs/browsing.xul` ;\
        perl -e "die 'Version incompatibility $$INSTALL_JS/$$INSTALL_RDF/$$BROWSING_XUL' unless $$INSTALL_JS eq $$INSTALL_RDF and $$INSTALL_JS eq $$BROWSING_XUL"

hash: xpi
	shasum -b -a 256 ../downloads/wmlbrowser-latest.xpi
